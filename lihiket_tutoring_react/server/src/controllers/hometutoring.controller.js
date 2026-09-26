/**
 * Home Tutoring Controller
 *
 * Public  : GET  /api/home-tutoring/pricing          — grade-level pricing table
 * Public  : POST /api/home-tutoring/requests          — submit a booking (auth optional)
 * Auth    : GET  /api/home-tutoring/my-requests       — student's own bookings
 * Admin   : GET  /api/home-tutoring/requests          — all bookings
 * Admin   : GET  /api/home-tutoring/requests/:id      — single booking
 * Admin   : PATCH /api/home-tutoring/requests/:id     — update status / assign teacher / add notes
 * Admin   : DELETE /api/home-tutoring/requests/:id    — delete booking
 * Admin   : PUT  /api/home-tutoring/pricing           — update the pricing table
 */

const HomeTutoringRequest = require('../models/HomeTutoringRequest');
const Teacher             = require('../models/Teacher');
const AppError            = require('../utils/AppError');
const { GRADE_LEVELS }    = require('../constants/grades');

// ── In-memory pricing store (admin can update at runtime) ────────────────────
// Stored in a module-level object so it persists for the lifetime of the process.
// For production you'd persist this to a Settings collection in MongoDB.

const DEFAULT_PRICING = {
  KG1: 150, KG2: 150,
  G1: 180,  G2: 180,  G3: 180,
  G4: 200,  G5: 200,  G6: 200,
  G7: 250,  G8: 250,  G9: 270,
  G10: 300, G11: 350, G12: 400,
  HL: 500,  // Higher Level / university prep
};

// Mutable copy — admin can override individual grade prices
let CURRENT_PRICING = { ...DEFAULT_PRICING };

// ── GET /api/home-tutoring/pricing ───────────────────────────────────────────
exports.getPricing = (req, res) => {
  const table = GRADE_LEVELS.map((grade) => ({
    grade,
    pricePerHour: CURRENT_PRICING[grade] ?? DEFAULT_PRICING[grade] ?? 200,
    currency: 'ETB',
  }));
  res.json({ success: true, data: table });
};

// ── PUT /api/home-tutoring/pricing  (admin only) ──────────────────────────────
exports.updatePricing = (req, res, next) => {
  const updates = req.body; // { G10: 320, G11: 380, ... }
  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return next(new AppError('Body must be an object mapping grade → pricePerHour', 400));
  }

  const invalid = Object.keys(updates).filter((k) => !GRADE_LEVELS.includes(k));
  if (invalid.length) {
    return next(new AppError(`Invalid grade levels: ${invalid.join(', ')}`, 400));
  }

  Object.entries(updates).forEach(([grade, price]) => {
    const n = Number(price);
    if (isNaN(n) || n < 0) return; // skip invalid values silently
    CURRENT_PRICING[grade] = n;
  });

  const table = GRADE_LEVELS.map((grade) => ({
    grade,
    pricePerHour: CURRENT_PRICING[grade],
    currency: 'ETB',
  }));
  res.json({ success: true, message: 'Pricing updated.', data: table });
};

// ── POST /api/home-tutoring/requests ─────────────────────────────────────────
// Accessible without login (guests can book too).
// If called while authenticated, req.user is available and we link the student.
exports.createRequest = async (req, res, next) => {
  const {
    fullName, email, phone,
    gradeLevel, subjects, hoursPerWeek, preferredSchedule, startDate,
    address, city, location, mapLink, message,
  } = req.body;

  // ── Basic validation ──
  if (!fullName?.trim())  return next(new AppError('Full name is required', 400));
  if (!email?.trim())     return next(new AppError('Email is required', 400));
  if (!phone?.trim())     return next(new AppError('Phone number is required', 400));
  if (!gradeLevel)        return next(new AppError('Grade level is required', 400));
  if (!GRADE_LEVELS.includes(gradeLevel))
    return next(new AppError(`Invalid grade level: ${gradeLevel}`, 400));
  if (!address?.trim())   return next(new AppError('Address is required', 400));

  const pricePerHour = CURRENT_PRICING[gradeLevel] ?? 200;

  const requestDoc = await HomeTutoringRequest.create({
    // Link to logged-in student if available
    student:    req.user?.role === 'student' ? req.user._id : null,
    fullName:   fullName.trim(),
    email:      email.trim().toLowerCase(),
    phone:      phone.trim(),
    gradeLevel,
    subjects:   Array.isArray(subjects) ? subjects : [],
    hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : 4,
    preferredSchedule: preferredSchedule?.trim() ?? '',
    startDate:  startDate ? new Date(startDate) : null,
    address:    address.trim(),
    city:       city?.trim() ?? '',
    location: {
      lat: location?.lat ? Number(location.lat) : null,
      lng: location?.lng ? Number(location.lng) : null,
    },
    mapLink:    mapLink?.trim() ?? null,
    pricePerHour,
    currency:   'ETB',
    message:    message?.trim() ?? '',
    status:     'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Your home tutoring request has been submitted! We will contact you within 24 hours.',
    data: requestDoc,
  });
};

// ── GET /api/home-tutoring/my-requests  (logged-in student) ──────────────────
exports.getMyRequests = async (req, res) => {
  const requests = await HomeTutoringRequest.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');

  res.json({ success: true, count: requests.length, data: requests });
};

// ── GET /api/home-tutoring/requests  (admin) ─────────────────────────────────
exports.getAllRequests = async (req, res) => {
  const { status, gradeLevel, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status)     filter.status     = status;
  if (gradeLevel) filter.gradeLevel = gradeLevel;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await HomeTutoringRequest.countDocuments(filter);
  const requests = await HomeTutoringRequest.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('student',         'firstName lastName email gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');

  res.json({
    success: true,
    count:   requests.length,
    total,
    page:    Number(page),
    pages:   Math.ceil(total / Number(limit)),
    data:    requests,
  });
};

// ── GET /api/home-tutoring/requests/:id  (admin) ─────────────────────────────
exports.getRequestById = async (req, res, next) => {
  const request = await HomeTutoringRequest.findById(req.params.id)
    .populate('student',         'firstName lastName email phone gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject qualifications experience');

  if (!request) return next(new AppError('Home tutoring request not found', 404));
  res.json({ success: true, data: request });
};

// ── PATCH /api/home-tutoring/requests/:id  (admin) ───────────────────────────
exports.updateRequest = async (req, res, next) => {
  const { status, assignedTeacherId, adminNotes } = req.body;

  const request = await HomeTutoringRequest.findById(req.params.id);
  if (!request) return next(new AppError('Home tutoring request not found', 404));

  const VALID_STATUSES = ['pending', 'reviewed', 'confirmed', 'assigned', 'cancelled', 'completed'];
  if (status && !VALID_STATUSES.includes(status)) {
    return next(new AppError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 400));
  }

  if (assignedTeacherId) {
    const teacher = await Teacher.findById(assignedTeacherId);
    if (!teacher) return next(new AppError('Teacher not found', 404));
    request.assignedTeacher = assignedTeacherId;
    if (!status) request.status = 'assigned'; // auto-advance status
  }

  if (status)     request.status     = status;
  if (adminNotes !== undefined) request.adminNotes = adminNotes;

  await request.save();

  const updated = await HomeTutoringRequest.findById(request._id)
    .populate('student',         'firstName lastName email gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');

  res.json({ success: true, message: 'Request updated.', data: updated });
};

// ── DELETE /api/home-tutoring/requests/:id  (admin) ──────────────────────────
exports.deleteRequest = async (req, res, next) => {
  const request = await HomeTutoringRequest.findById(req.params.id);
  if (!request) return next(new AppError('Home tutoring request not found', 404));
  await request.deleteOne();
  res.json({ success: true, message: 'Home tutoring request deleted.' });
};
