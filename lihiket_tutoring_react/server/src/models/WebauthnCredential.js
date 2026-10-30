const mongoose = require('mongoose');

/**
 * Stores a WebAuthn passkey (fingerprint / biometric / security key) credential.
 *
 * A user can have several credentials (one per device). The credential is
 * linked back to its owner by `user` (ObjectId) + `userModel` (the collection
 * name, e.g. "students", "teachers", "parents", "admins") since accounts live in
 * four separate collections.
 *
 * `credentialPublicKey` is the COSE-encoded public key returned by the
 * authenticator; we persist it as a Buffer (a Uint8Array subclass) so it can be
 * fed straight back into @simplewebauthn/server's verifyAuthenticationResponse().
 */
const WebauthnCredentialSchema = new mongoose.Schema(
  {
    credentialID: {
      type: String,
      required: [true, 'credentialID is required'],
      unique: true,
      // Base64URL string returned by the authenticator — used to look up the
      // matching public key during authentication. `unique: true` already
      // creates the index, so no separate `index: true` is needed.
    },
    credentialPublicKey: {
      type: Buffer,
      required: [true, 'credentialPublicKey is required'],
      select: false,
    },
    counter: {
      type: Number,
      required: true,
      default: 0,
    },
    transports: {
      type: [String],
      default: [],
    },
    // 'singleDevice' | 'multiDevice'
    deviceType: {
      type: String,
      default: 'singleDevice',
    },
    backedUp: {
      type: Boolean,
      default: false,
    },
    // Authenticator Attestation GUID — identifies the authenticator model.
    aaguid: {
      type: String,
      default: '',
    },
    // Optional human label so users can recognise the device in settings.
    deviceName: {
      type: String,
      default: '',
      trim: true,
    },
    // ── Owner reference ──────────────────────────────────────────────────────
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Owning user is required'],
      index: true,
    },
    // Collection name the owner lives in: students | teachers | parents | admins
    userModel: {
      type: String,
      required: [true, 'Owning user collection is required'],
      enum: ['students', 'teachers', 'parents', 'admins'],
    },
  },
  { timestamps: true, collection: 'webauthn_credentials' }
);

module.exports = mongoose.model('WebauthnCredential', WebauthnCredentialSchema);
