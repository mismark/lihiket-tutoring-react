/**
 * Home Tutor Subject Controller
 *
 * Subjects (admin-managed catalogue):
 *   Public  GET  /api/home-tutor/subjects              — browse all active subjects
 *   Public  GET  /api/home-tutor/subjects/:id           — single subject detail
 *   Admin   POST /api/home-tutor/subjects               — create subject
 *   Admin   PUT  /api/home-tutor/subjects/:id           — update subject
 *   Admin   DELETE /api/home-tutor/subjects/:id         — delete subject
 *   Admin   GET  /api/home-tutor/subjects/all           — all subjects incl. inactive
 *
 * Bookings (student requests):
 *   Public  POST /api/home-tutor/bookings               — create booking (auth optional)
 *   Auth    GET  /api/home-tutor/bookings/my            — student's own bookings
 *   Admin   GET  /api/home-tutor/bookings               — all bookings (paginated)
 *   Admin   GET  /api/home-tutor/bookings/:id           — single booking
 *   Admin   PATCH /api/home-tutor/bookings/:id          — update status/teacher/notes
 *   Admin   DELETE /api/home-tutor/bookings/:id         — delete
 */

const HomeTutoringSubject = require('../models/HomeTutoringSubject');
const HomeTutoringBooking  = require('../models/HomeTutoringBooking');
const Teacher              = require('../models/Teacher');
const AppError             = require('../utils/AppError');
const { GRADE_LEVELS }     = require('../constants/grades');

// ════════════════════════════════════════════════════════════════════════════════
//  SUBJECTS
// ════════════════════════════════════════════════════════════════════════════════

// ── GET /api/home-tutor/subjects  (public — active only) ─────────────────────
exports.getActiveSubjects = async (req, res) => {
  const { gradeLevel, category, search } = req.query;

  const filter = { isActive: true };
  if (gradeLevel) filter.gradeLevel = gradeLevel;
  if (category)   filter.category   = category;
  if (search)     filter.name       = { $regex: search, $options: 'i' };

  const subjects = await HomeTutoringSubject.find(filter)
    .sort({ gradeLevel: 1, name: 1 })
    .select('-createdBy');

  res.json({ success: true, count: subjects.length, data: subjects });
};

// ── GET /api/home-tutor/subjects/all  (admin — all including inactive) ────────
exports.getAllSubjects = async (req, res) => {
  const { gradeLevel, category, search, isActive } = req.query;

  const filter = {};
  if (gradeLevel !== undefined) filter.gradeLevel = gradeLevel;
  if (category   !== undefined) filter.category   = category;
  if (isActive   !== undefined) filter.isActive   = isActive === 'true';
  if (search)                   filter.name       = { $regex: search, $options: 'i' };

  const subjects = await HomeTutoringSubject.find(filter)
    .sort({ createdAt: -1 });

  res.json({ success: true, count: subjects.length, data: subjects });
};

// ── GET /api/home-tutor/subjects/:id  (public) ───────────────────────────────
exports.getSubjectById = async (req, res, next) => {
  const subject = await HomeTutoringSubject.findById(req.params.id);
  if (!subject) return next(new AppError('Subject not found', 404));
  res.json({ success: true, data: subject });
};

// ── POST /api/home-tutor/subjects  (admin) ───────────────────────────────────
exports.createSubject = async (req, res, next) => {
  const {
    name, gradeLevel, pricePerHour, currency,
    description, outcomes, category,
    maxStudentsPerDay, isActive, imageUrl,
  } = req.body;

  if (!name?.trim())   return next(new AppError('Subject name is required', 400));
  if (!gradeLevel)     return next(new AppError('Grade level is required', 400));
  if (!GRADE_LEVELS.includes(gradeLevel))
    return next(new AppError(`Invalid grade level: ${gradeLevel}`, 400));
  if (pricePerHour === undefined || pricePerHour === null)
    return next(new AppError('Price per hour is required', 400));

  // Check duplicate
  const exists = await HomeTutoringSubject.findOne({
    name: { $regex: `^${name.trim()}$`, $options: 'i' },
    gradeLevel,
  });
  if (exists) return next(new AppError(`"${name}" already exists for ${gradeLevel}`, 409));

  const subject = await HomeTutoringSubject.create({
    name:              name.trim(),
    gradeLevel,
    pricePerHour:      Number(pricePerHour),
    currency:          currency || 'ETB',
    description:       description?.trim() ?? '',
    outcomes:          Array.isArray(outcomes) ? outcomes.filter(Boolean) : [],
    category:          category?.trim() || 'General',
    maxStudentsPerDay: maxStudentsPerDay ? Number(maxStudentsPerDay) : 5,
    isActive:          isActive !== undefined ? Boolean(isActive) : true,
    imageUrl:          imageUrl?.trim() || null,
    createdBy:         req.user._id,
  });

  res.status(201).json({ success: true, message: 'Subject created successfully.', data: subject });
};

// ── PUT /api/home-tutor/subjects/:id  (admin) ────────────────────────────────
exports.updateSubject = async (req, res, next) => {
  const subject = await HomeTutoringSubject.findById(req.params.id);
  if (!subject) return next(new AppError('Subject not found', 404));

  const {
    name, gradeLevel, pricePerHour, currency,
    description, outcomes, category,
    maxStudentsPerDay, isActive, imageUrl,
  } = req.body;

  if (gradeLevel && !GRADE_LEVELS.includes(gradeLevel))
    return next(new AppError(`Invalid grade level: ${gradeLevel}`, 400));

  // Duplicate check only if name or grade is changing
  const newName  = name?.trim()   ?? subject.name;
  const newGrade = gradeLevel     ?? subject.gradeLevel;
  if ((name && name.trim() !== subject.name) || (gradeLevel && gradeLevel !== subject.gradeLevel)) {
    const dup = await HomeTutoringSubject.findOne({
      name: { $regex: `^${newName}$`, $options: 'i' },
      gradeLevel: newGrade,
      _id: { $ne: subject._id },
    });
    if (dup) return next(new AppError(`"${newName}" already exists for ${newGrade}`, 409));
  }

  if (name         !== undefined) subject.name             = name.trim();
  if (gradeLevel   !== undefined) subject.gradeLevel       = gradeLevel;
  if (pricePerHour !== undefined) subject.pricePerHour     = Number(pricePerHour);
  if (currency     !== undefined) subject.currency         = currency;
  if (description  !== undefined) subject.description      = description.trim();
  if (outcomes     !== undefined) subject.outcomes         = Array.isArray(outcomes) ? outcomes.filter(Boolean) : [];
  if (category     !== undefined) subject.category         = category.trim();
  if (maxStudentsPerDay !== undefined) subject.maxStudentsPerDay = Number(maxStudentsPerDay);
  if (isActive     !== undefined) subject.isActive         = Boolean(isActive);
  if (imageUrl     !== undefined) subject.imageUrl         = imageUrl?.trim() || null;

  await subject.save();
  res.json({ success: true, message: 'Subject updated.', data: subject });
};

// ── DELETE /api/home-tutor/subjects/:id  (admin) ────────────────────────────
exports.deleteSubject = async (req, res, next) => {
  const subject = await HomeTutoringSubject.findById(req.params.id);
  if (!subject) return next(new AppError('Subject not found', 404));
  await subject.deleteOne();
  res.json({ success: true, message: 'Subject deleted.' });
};

// ════════════════════════════════════════════════════════════════════════════════
//  BOOKINGS
// ════════════════════════════════════════════════════════════════════════════════

// ── POST /api/home-tutor/bookings  (public + optional auth) ──────────────────
exports.createBooking = async (req, res, next) => {
  const {
    subjectId,
    fullName, age, sex, email, phone,
    hoursPerWeek, preferredSchedule, startDate,
    city, subcity, street, address, additionalAddress,
    location, mapLink, message,
  } = req.body;

  if (!subjectId)        return next(new AppError('subjectId is required', 400));
  if (!fullName?.trim()) return next(new AppError('Full name is required', 400));
  if (!email?.trim())    return next(new AppError('Email is required', 400));
  if (!phone?.trim())    return next(new AppError('Phone number is required', 400));
  if (!address?.trim())  return next(new AppError('House number / main address is required', 400));

  const subject = await HomeTutoringSubject.findById(subjectId);
  if (!subject)          return next(new AppError('Subject not found', 404));
  if (!subject.isActive) return next(new AppError('This subject is not currently available', 400));

  const booking = await HomeTutoringBooking.create({
    subject:           subject._id,
    subjectName:       subject.name,
    gradeLevel:        subject.gradeLevel,
    pricePerHour:      subject.pricePerHour,
    currency:          subject.currency,
    student:           req.user?.role === 'student' ? req.user._id : null,
    fullName:          fullName.trim(),
    age:               age ? Number(age) : null,
    sex:               sex?.trim() ?? '',
    email:             email.trim().toLowerCase(),
    phone:             phone.trim(),
    hoursPerWeek:      hoursPerWeek ? Number(hoursPerWeek) : 4,
    preferredSchedule: preferredSchedule?.trim() ?? '',
    startDate:         startDate ? new Date(startDate) : null,
    city:              city?.trim() ?? '',
    subcity:           subcity?.trim() ?? '',
    street:            street?.trim() ?? '',
    address:           address.trim(),
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
    message: `Booking for "${subject.name}" submitted! We will contact you within 24 hours.`,
    data: booking,
  });
};

// ── GET /api/home-tutor/bookings/my  (authenticated student) ─────────────────
exports.getMyBookings = async (req, res) => {
  const bookings = await HomeTutoringBooking.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate('subject', 'name gradeLevel pricePerHour currency category imageUrl')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');

  res.json({ success: true, count: bookings.length, data: bookings });
};

// ── GET /api/home-tutor/bookings  (admin) ────────────────────────────────────
exports.getAllBookings = async (req, res) => {
  const { status, gradeLevel, subjectId, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status)    filter.status     = status;
  if (gradeLevel) filter.gradeLevel = gradeLevel;
  if (subjectId)  filter.subject    = subjectId;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await HomeTutoringBooking.countDocuments(filter);
  const bookings = await HomeTutoringBooking.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .populate('subject',         'name gradeLevel pricePerHour currency')
    .populate('student',         'firstName lastName email gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');

  res.json({
    success: true,
    count: bookings.length,
    total,
    page:  Number(page),
    pages: Math.ceil(total / Number(limit)),
    data:  bookings,
  });
};

// ── GET /api/home-tutor/bookings/:id  (admin) ────────────────────────────────
exports.getBookingById = async (req, res, next) => {
  const booking = await HomeTutoringBooking.findById(req.params.id)
    .populate('subject',         'name gradeLevel pricePerHour currency description')
    .populate('student',         'firstName lastName email phone gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject qualifications experience');

  if (!booking) return next(new AppError('Booking not found', 404));
  res.json({ success: true, data: booking });
};

// ── PATCH /api/home-tutor/bookings/:id  (admin) ──────────────────────────────
exports.updateBooking = async (req, res, next) => {
  const { status, assignedTeacherId, adminNotes } = req.body;

  const booking = await HomeTutoringBooking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));

  const VALID = ['pending','reviewed','confirmed','assigned','cancelled','completed'];
  if (status && !VALID.includes(status))
    return next(new AppError(`Invalid status. Must be one of: ${VALID.join(', ')}`, 400));

  if (assignedTeacherId) {
    const teacher = await Teacher.findById(assignedTeacherId);
    if (!teacher) return next(new AppError('Teacher not found', 404));
    booking.assignedTeacher = assignedTeacherId;
    if (!status) booking.status = 'assigned';
  }

  if (status     !== undefined) booking.status     = status;
  if (adminNotes !== undefined) booking.adminNotes  = adminNotes;

  await booking.save();

  const updated = await HomeTutoringBooking.findById(booking._id)
    .populate('subject',         'name gradeLevel pricePerHour currency')
    .populate('student',         'firstName lastName email gradeLevel')
    .populate('assignedTeacher', 'firstName lastName email phone specializedSubject');

  res.json({ success: true, message: 'Booking updated.', data: updated });
};

// ── DELETE /api/home-tutor/bookings/:id  (admin) ─────────────────────────────
exports.deleteBooking = async (req, res, next) => {
  const booking = await HomeTutoringBooking.findById(req.params.id);
  if (!booking) return next(new AppError('Booking not found', 404));
  await booking.deleteOne();
  res.json({ success: true, message: 'Booking deleted.' });
};
