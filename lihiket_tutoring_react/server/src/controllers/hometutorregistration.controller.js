/**
 * Home Tutor Registration Controller
 *
 * Public  POST /api/home-tutor-register          — submit registration (auth optional)
 * Auth    GET  /api/home-tutor-register/my        — student's own registrations
 * Admin   GET  /api/home-tutor-register           — all registrations (paginated)
 * Admin   GET  /api/home-tutor-register/:id       — single registration
 * Admin   PATCH /api/home-tutor-register/:id      — update status / assign teacher / notes
 * Admin   DELETE /api/home-tutor-register/:id     — delete
 */

const HomeTutorRegistration = require('../models/HomeTutorRegistration');
const Teacher               = require('../models/Teacher');
const AppError              = require('../utils/AppError');
const { GRADE_LEVELS }      = require('../constants/grades');

// ── POST /api/home-tutor-register ────────────────────────────────────────────
exports.createRegistration = async (req, res, next) => {
  const {
    fullName, age, sex, email, phone,
    gradeLevel, subjects,
    hoursPerWeek, preferredSchedule, startDate,
    city, subcity, street, address, additionalAddress,
    location, mapLink,
    message,
  } = req.body;

  // Required field validation
  if (!fullName?.trim())  return next(new AppError('Full name is required', 400));
  if (!age)               return next(new AppError('Age is required', 400));
  if (!sex)               return next(new AppError('Sex is required', 400));
  if (!email?.trim())     return next(new AppError('Email is required', 400));
  if (!phone?.trim())     return next(new AppError('Phone number is required', 400));
  if (!gradeLevel)        return next(new AppError('Grade level is required', 400));
  if (!GRADE_LEVELS.includes(gradeLevel))
    return next(new AppError(`Invalid grade level: ${gradeLevel}`, 400));
  if (!city?.trim())      return next(new AppError('City is required', 400));
  if (!address?.trim())   return next(new AppError('House No. / main address is required', 400));

  const registration = await HomeTutorRegistration.create({
    student:      req.user?.role === 'student' ? req.user._id : null,
    fullName:     fullName.trim(),
    age:          Number(age),
    sex,
    email:        email.trim().toLowerCase(),
    phone:        phone.trim(),
    gradeLevel,
    subjects:     Array.isArray(subjects) ? subjects.filter(Boolean) : [],
    hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : 4,
    preferredSchedule: preferredSchedule?.trim() ?? '',
    startDate:    startDate ? new Date(startDate) : null,
    city:         city.trim(),
    subcity:      subcity?.trim() ?? '',
    street:       street?.trim() ?? '',
    address:      address.trim(),
    additionalAddress: additionalAddress?.trim() ?? '',
    location: {
      lat: location?.lat ? Number(location.lat) : null,
      lng: location?.lng ? Number(location.lng) : null,
    },
    mapLink:  mapLink?.trim() ?? null,
    message:  message?.trim() ?? '',
    status:   'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully! We will contact you within 24 hours to confirm your tutor.',
    data: registration,
  });
};

// ── GET /api/home-tutor-register/my  (authenticated student) ─────────────────
exports.getMyRegistrations = async (req, res) => {
  const list = await HomeTutorRegistration.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');
  res.json({ success: true, count: list.length, data: list });
};

// ── GET /api/home-tutor-register  (admin) ────────────────────────────────────
exports.getAllRegistrations = async (req, res) => {
  const { status, gradeLevel, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status)     filter.status     = status;
  if (gradeLevel) filter.gradeLevel = gradeLevel;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await HomeTutorRegistration.countDocuments(filter);
  const list  = await HomeTutorRegistration.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('student',         'firstName lastName email gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');

  res.json({ success: true, count: list.length, total, page: Number(page), pages: Math.ceil(total / Number(limit)), data: list });
};

// ── GET /api/home-tutor-register/:id  (admin) ─────────────────────────────────
exports.getRegistrationById = async (req, res, next) => {
  const reg = await HomeTutorRegistration.findById(req.params.id)
    .populate('student',         'firstName lastName email phone gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject qualifications experience');
  if (!reg) return next(new AppError('Registration not found', 404));
  res.json({ success: true, data: reg });
};

// ── PATCH /api/home-tutor-register/:id  (admin) ───────────────────────────────
exports.updateRegistration = async (req, res, next) => {
  const { status, assignedTeacherId, adminNotes } = req.body;
  const reg = await HomeTutorRegistration.findById(req.params.id);
  if (!reg) return next(new AppError('Registration not found', 404));

  const VALID = ['pending','reviewed','confirmed','assigned','cancelled','completed'];
  if (status && !VALID.includes(status))
    return next(new AppError(`Invalid status. Must be one of: ${VALID.join(', ')}`, 400));

  if (assignedTeacherId) {
    const teacher = await Teacher.findById(assignedTeacherId);
    if (!teacher) return next(new AppError('Teacher not found', 404));
    reg.assignedTeacher = assignedTeacherId;
    if (!status) reg.status = 'assigned';
  }
  if (status     !== undefined) reg.status     = status;
  if (adminNotes !== undefined) reg.adminNotes = adminNotes;

  await reg.save();
  const updated = await HomeTutorRegistration.findById(reg._id)
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');
  res.json({ success: true, message: 'Registration updated.', data: updated });
};

// ── DELETE /api/home-tutor-register/:id  (admin) ──────────────────────────────
exports.deleteRegistration = async (req, res, next) => {
  const reg = await HomeTutorRegistration.findById(req.params.id);
  if (!reg) return next(new AppError('Registration not found', 404));
  await reg.deleteOne();
  res.json({ success: true, message: 'Registration deleted.' });
};
