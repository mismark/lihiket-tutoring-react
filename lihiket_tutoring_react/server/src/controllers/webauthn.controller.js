const crypto = require('crypto');

const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

const Student  = require('../models/Student');
const Teacher  = require('../models/Teacher');
const Parent   = require('../models/Parent');
const Admin    = require('../models/Admin');
const WebauthnCredential = require('../models/WebauthnCredential');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const config = require('../config');
const { setChallenge, consumeChallenge } = require('../utils/webauthnStore');

// ─── Collection → Model resolver ─────────────────────────────────────────────
const MODELS = {
  students: () => require('../models/Student'),
  teachers: () => require('../models/Teacher'),
  parents:  () => require('../models/Parent'),
  admins:   () => require('../models/Admin'),
};

const RP = config.webauthn;

// Stable, opaque per-user id encoded to a Uint8Array for the authenticator.
// We prefix with the collection so the same raw _id in two collections can't
// collide in the browser's account picker.
const userAuthID = (collection, id) => Buffer.from(`${collection}:${id}`, 'utf8');

const newRequestId = () => crypto.randomBytes(32).toString('base64url');

// Shape returned to the client on login (matches the password login response).
function buildUserResponse(user) {
  return {
    id:                 user._id,
    userId:             user.userId,
    firstName:          user.firstName,
    lastName:           user.lastName,
    username:           user.username,
    email:              user.email,
    role:               user.role,
    profilePicture:     user.profilePicture,
    gradeLevel:         user.gradeLevel,
    specializedSubject: user.specializedSubject,
  };
}

// ─── POST /api/auth/webauthn/register/begin  (protected) ──────────────────────
exports.generateRegistrationOptionsHandler = async (req, res) => {
  const { _id } = req.user;
  const collection = req.userCollection;

  // Exclude already-registered credentials so the same device isn't enrolled twice.
  const existing = await WebauthnCredential
    .find({ user: _id, userModel: collection })
    .select('credentialID transports')
    .lean();

  const options = await generateRegistrationOptions({
    rpName:        RP.rpName,
    rpID:          RP.rpID,
    userName:      req.user.username || req.user.email,
    userDisplayName: `${req.user.firstName} ${req.user.lastName}`,
    userID:        userAuthID(collection, _id),
    attestationType: 'none',
    authenticatorSelection: {
      residentKey:      'preferred', // enable usernameless / discoverable passkeys
      userVerification: 'preferred', // biometric (fingerprint/Face ID/PIN) when available
    },
    excludeCredentials: existing.map((c) => ({
      id: c.credentialID,
      transports: c.transports,
    })),
  });

  const requestId = newRequestId();
  setChallenge(requestId, {
    challenge:  options.challenge,
    userId:     String(_id),
    userModel:  collection,
    type:       'registration',
  });

  res.json({ success: true, data: { options, requestId } });
};

// ─── POST /api/auth/webauthn/register/finish  (protected) ────────────────────
exports.verifyRegistrationHandler = async (req, res) => {
  const { response, requestId, deviceName } = req.body;

  if (!response || !requestId) {
    throw new AppError('Missing WebAuthn registration response.', 400);
  }

  const entry = consumeChallenge(requestId);
  if (!entry || entry.type !== 'registration') {
    throw new AppError('Registration session expired or invalid. Please try again.', 400);
  }

  // The challenge must belong to the authenticated user issuing it.
  if (String(entry.userId) !== String(req.user._id) || entry.userModel !== req.userCollection) {
    throw new AppError('Registration session does not match the current user.', 403);
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: entry.challenge,
      expectedOrigin:     RP.expectedOrigins,
      expectedRPID:       RP.rpID,
    });
  } catch (err) {
    throw new AppError(`Could not verify fingerprint registration: ${err.message}`, 400);
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) {
    throw new AppError('Fingerprint registration could not be verified.', 400);
  }

  const { credential, credentialDeviceType, credentialBackedUp, aaguid } = registrationInfo;

  // Guard against duplicate credential IDs (e.g. re-submitting the same response).
  const alreadyExists = await WebauthnCredential.findOne({ credentialID: credential.id }).lean();
  if (alreadyExists) {
    throw new AppError('This device is already set up for fingerprint login.', 409);
  }

  const doc = await WebauthnCredential.create({
    credentialID:         credential.id,
    credentialPublicKey:   Buffer.from(credential.publicKey),
    counter:               credential.counter,
    transports:            credential.transports || [],
    deviceType:            credentialDeviceType,
    backedUp:              credentialBackedUp,
    aaguid:                aaguid || '',
    deviceName:            (deviceName || '').toString().trim().slice(0, 60),
    user:                 req.user._id,
    userModel:            req.userCollection,
  });

  res.status(201).json({
    success: true,
    message: 'Fingerprint login enabled for this device.',
    data: {
      id:            doc._id,
      credentialID:  doc.credentialID,
      deviceName:    doc.deviceName,
      deviceType:    doc.deviceType,
      backedUp:      doc.backedUp,
      createdAt:     doc.createdAt,
    },
  });
};

// ─── POST /api/auth/webauthn/auth/begin  (public) ────────────────────────────
exports.generateAuthenticationOptionsHandler = async (req, res) => {
  // Discoverable (usernameless) credentials: leave allowCredentials empty so the
  // browser offers whichever passkey the user holds for this domain.
  const options = await generateAuthenticationOptions({
    rpID:             RP.rpID,
    allowCredentials: [],
    userVerification: 'preferred',
  });

  const requestId = newRequestId();
  setChallenge(requestId, {
    challenge: options.challenge,
    type:      'authentication',
  });

  res.json({ success: true, data: { options, requestId } });
};

// ─── POST /api/auth/webauthn/auth/finish  (public) ───────────────────────────
exports.verifyAuthenticationHandler = async (req, res) => {
  const { response, requestId } = req.body;

  if (!response || !requestId) {
    throw new AppError('Missing WebAuthn authentication response.', 400);
  }

  const entry = consumeChallenge(requestId);
  if (!entry || entry.type !== 'authentication') {
    throw new AppError('Authentication session expired or invalid. Please try again.', 400);
  }

  // Look up the credential the browser is asserting with.
  const credID = response.id;
  const cred = await WebauthnCredential.findOne({ credentialID: credID });
  if (!cred) {
    throw new AppError('This fingerprint is not registered. Set it up from your profile first.', 404);
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: entry.challenge,
      expectedOrigin:     RP.expectedOrigins,
      expectedRPID:       RP.rpID,
      credential: {
        id:         cred.credentialID,
        publicKey:  cred.credentialPublicKey, // Buffer (Uint8Array subclass)
        counter:    cred.counter,
        transports: cred.transports,
      },
    });
  } catch (err) {
    throw new AppError(`Fingerprint verification failed: ${err.message}`, 400);
  }

  const { verified, authenticationInfo } = verification;
  if (!verified) {
    throw new AppError('Fingerprint verification failed.', 401);
  }

  // Persist the new counter for replay protection (non-blocking on errors).
  cred.counter = authenticationInfo.newCounter;
  await cred.save().catch((e) => console.error('WebAuthn counter update failed:', e.message));

  // Resolve the owning user from the correct collection.
  const getModel = MODELS[cred.userModel];
  if (!getModel) {
    throw new AppError('Account type not recognized. Please log in with your password.', 400);
  }
  const user = await getModel().findById(cred.user).select('-password');
  if (!user) {
    throw new AppError('Account no longer exists.', 404);
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      code: 'ACCOUNT_DEACTIVATED',
      message: 'Your account has been deactivated. Please contact platform support.',
    });
  }

  // Mirror the password-login auto-fix for legacy unverified accounts.
  if (!user.isVerified) {
    user.isVerified = true;
    await user.save();
  }

  const token = generateToken({ id: user._id, role: user.role, collection: cred.userModel });

  res.json({
    success: true,
    message: 'Login successful.',
    data: { token, user: buildUserResponse(user) },
  });
};

// ─── GET /api/auth/webauthn/credentials  (protected) ──────────────────────────
exports.listCredentials = async (req, res) => {
  const creds = await WebauthnCredential
    .find({ user: req.user._id, userModel: req.userCollection })
    .select('-credentialPublicKey')
    .sort('-createdAt')
    .lean();

  res.json({
    success: true,
    data: creds.map((c) => ({
      id:           c._id,
      credentialID: c.credentialID,
      deviceName:   c.deviceName,
      deviceType:   c.deviceType,
      backedUp:     c.backedUp,
      transports:   c.transports,
      createdAt:    c.createdAt,
    })),
  });
};

// ─── PATCH /api/auth/webauthn/credentials/:id  (protected) — rename ──────────
exports.renameCredential = async (req, res) => {
  const { deviceName } = req.body;
  if (deviceName === undefined) {
    throw new AppError('deviceName is required.', 400);
  }

  const cred = await WebauthnCredential.findOne({
    _id: req.params.id,
    user: req.user._id,
    userModel: req.userCollection,
  });

  if (!cred) {
    throw new AppError('Passkey not found.', 404);
  }

  cred.deviceName = String(deviceName).trim().slice(0, 60);
  await cred.save();

  res.json({
    success: true,
    message: 'Passkey label updated.',
    data: { id: cred._id, deviceName: cred.deviceName },
  });
};

// ─── DELETE /api/auth/webauthn/credentials/:id  (protected) ───────────────────
exports.removeCredential = async (req, res) => {
  // Ownership is enforced by filtering on user + userModel.
  const result = await WebauthnCredential.deleteOne({
    _id: req.params.id,
    user: req.user._id,
    userModel: req.userCollection,
  });

  if (result.deletedCount === 0) {
    throw new AppError('Passkey not found or you do not own it.', 404);
  }

  res.json({ success: true, message: 'Fingerprint login removed for that device.' });
};
