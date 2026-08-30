const Subject    = require('../models/Subject');
const Teacher    = require('../models/Teacher');
const Enrollment = require('../models/Enrollment');
const AppError   = require('../utils/AppError');
const { slugify } = require('../utils/slugify');
const notify     = require('../utils/notify');
const { EVENTS } = require('../constants/events');

// ── Resolve a slug OR ObjectId to a Subject document ─────────────────────────
// All routes that used /:id now accept either the slug or the raw _id so
// any existing bookmarks / API calls keep working.
async function resolveSubject(slugOrId) {
  const isObjectId = /^[a-f\d]{24}$/i.test(slugOrId);
  const subject = isObjectId
    ? await Subject.findById(slugOrId)
    : await Subject.findOne({ slug: slugOrId });
  return subject;
}

// ── Backfill: generate slugs for any subjects that predate this change ────────
// Called once at startup from app.js (or on demand via GET /api/subjects/backfill-slugs).
async function backfillSlugs() {
  const subjects = await Subject.find({ $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] });
  for (const s of subjects) {
    // Trigger the pre-save hook which generates the slug
    s.name = s.name; // mark modified
    await s.save().catch(() => {}); // ignore duplicate-slug conflicts
  }
  return subjects.length;
}

/**
 * Attach assignedTeachers and enrolledCount to each subject.
 */
const attachTeachersToSubjects = async (subjects) => {
  const subjectIds = subjects.map(s => s._id);

  const [teachers, enrollmentCounts] = await Promise.all([
    Teacher.find({ assignedSubjects: { $in: subjectIds } })
      .select('firstName lastName email specializedSubject assignedSubjects'),
    Enrollment.aggregate([
      { $match: { subject: { $in: subjectIds }, status: 'active' } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
    ]),
  ]);

  // Build maps
  const teacherMap = {};
  for (const teacher of teachers) {
    for (const sid of teacher.assignedSubjects) {
      const key = sid.toString();
      if (!teacherMap[key]) teacherMap[key] = [];
      teacherMap[key].push({
        _id:               teacher._id,
        firstName:         teacher.firstName,
        lastName:          teacher.lastName,
        email:             teacher.email,
        specializedSubject: teacher.specializedSubject,
      });
    }
  }

  const countMap = {};
  for (const row of enrollmentCounts) {
    countMap[row._id.toString()] = row.count;
  }

  return subjects.map(subject => {
    const plain = subject.toObject ? subject.toObject() : subject;
    const id    = plain._id.toString();
    plain.assignedTeachers = teacherMap[id] || [];
    plain.enrolledCount    = countMap[id]   || 0;
    return plain;
  });
};

exports.backfillSlugs = async (req, res, next) => {
  try {
    const count = await backfillSlugs();
    res.json({ success: true, message: `Backfilled slugs for ${count} subjects` });
  } catch (err) { next(err); }
};
// @access  Private (Admin, Teacher)
exports.getAllSubjects = async (req, res, next) => {
  try {
    const { gradeLevel, category, isActive } = req.query;
    const filter = {};

    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const subjects = await Subject.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const subjectsWithTeachers = await attachTeachersToSubjects(subjects);

    res.status(200).json({
      success: true,
      count: subjectsWithTeachers.length,
      data: subjectsWithTeachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:slug
// @access  Private
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await resolveSubject(req.params.id);

    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    const [subjectWithTeachers] = await attachTeachersToSubjects([subject]);

    res.status(200).json({
      success: true,
      data: subjectWithTeachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin only)
exports.createSubject = async (req, res, next) => {
  try {
    const { name, code, description, gradeLevel, category, price } = req.body;

    // Code must be globally unique; name only needs to be unique within the same grade level
    const existingByCode = await Subject.findOne({ code: code.toUpperCase() });
    if (existingByCode) {
      return next(new AppError('A subject with this code already exists.', 400));
    }

    const existingByNameGrade = await Subject.findOne({ name, gradeLevel });
    if (existingByNameGrade) {
      return next(new AppError(`A subject named "${name}" already exists for ${gradeLevel}.`, 400));
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      description,
      gradeLevel,
      category,
      price: price ? Number(price) : 0,
      createdBy: req.user.id,
    });

    await subject.populate('createdBy', 'firstName lastName email');

    const [subjectWithTeachers] = await attachTeachersToSubjects([subject]);

    res.status(201).json({
      success: true,
      data: subjectWithTeachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:slug
// @access  Private (Admin only)
exports.updateSubject = async (req, res, next) => {
  try {
    const { name, code, description, gradeLevel, category, isActive, price } = req.body;

    let subject = await resolveSubject(req.params.id);
    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    const newGrade = gradeLevel || subject.gradeLevel;

    // Check name+gradeLevel uniqueness if either is changing
    if ((name && name !== subject.name) || (gradeLevel && gradeLevel !== subject.gradeLevel)) {
      const existing = await Subject.findOne({
        name: name || subject.name,
        gradeLevel: newGrade,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return next(new AppError(`A subject named "${name || subject.name}" already exists for ${newGrade}.`, 400));
      }
    }

    // Check code uniqueness if code is changing
    if (code && code.toUpperCase() !== subject.code) {
      const existing = await Subject.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id } });
      if (existing) {
        return next(new AppError('A subject with this code already exists.', 400));
      }
    }

    subject = await Subject.findByIdAndUpdate(
      subject._id,   // always use _id for the update itself
      {
        name:        name        || subject.name,
        code:        code        ? code.toUpperCase() : subject.code,
        description: description !== undefined ? description : subject.description,
        gradeLevel:  gradeLevel  || subject.gradeLevel,
        category:    category    || subject.category,
        isActive:    isActive    !== undefined ? isActive : subject.isActive,
        price:       price       !== undefined ? Number(price) : subject.price,
      },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');

    const [subjectWithTeachers] = await attachTeachersToSubjects([subject]);

    res.status(200).json({
      success: true,
      data: subjectWithTeachers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:slug
// @access  Private (Admin only)
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await resolveSubject(req.params.id);

    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    // ── Notify all teachers assigned to this subject before removing them ──
    const assignedTeachers = await Teacher.find({ assignedSubjects: subject._id }).select('_id');
    await Promise.all(
      assignedTeachers.map(t =>
        notify({
          userId:    t._id,
          userModel: 'Teacher',
          type:      EVENTS.SUBJECT_DELETED,
          title:     'Subject Deleted',
          message:   `The subject "${subject.name}" (${subject.gradeLevel}) has been deleted by an administrator.`,
          link:      '/my-subjects',
        })
      )
    );

    await Teacher.updateMany(
      { assignedSubjects: subject._id },
      { $pull: { assignedSubjects: subject._id } }
    );

    await Subject.findByIdAndDelete(subject._id);

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign subject to teacher
// @route   POST /api/subjects/:slug/assign
// @access  Private (Admin only)
exports.assignSubjectToTeacher = async (req, res, next) => {
  try {
    const { teacherId } = req.body;

    const subject = await resolveSubject(req.params.id);
    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return next(new AppError('Teacher not found', 404));
    }

    if (teacher.assignedSubjects.includes(subject._id)) {
      return next(new AppError('Teacher already assigned to this subject', 400));
    }

    teacher.assignedSubjects.push(subject._id);
    await teacher.save();

    // ── Notify the teacher ────────────────────────────────────────────────
    await notify({
      userId:    teacher._id,
      userModel: 'Teacher',
      type:      EVENTS.SUBJECT_ASSIGNED,
      title:     'New Subject Assigned',
      message:   `You have been assigned to teach "${subject.name}" (${subject.gradeLevel}).`,
      link:      '/my-subjects',
    });

    await teacher.populate('assignedSubjects');

    res.status(200).json({
      success: true,
      message: 'Subject assigned to teacher successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove subject from teacher
// @route   DELETE /api/subjects/:slug/assign/:teacherId
// @access  Private (Admin only)
exports.removeSubjectFromTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.teacherId);
    if (!teacher) {
      return next(new AppError('Teacher not found', 404));
    }

    const subject = await resolveSubject(req.params.id);
    if (!subject) return next(new AppError('Subject not found', 404));

    if (!teacher.assignedSubjects.some(id => id.toString() === subject._id.toString())) {
      return next(new AppError('Teacher not assigned to this subject', 400));
    }

    teacher.assignedSubjects = teacher.assignedSubjects.filter(
      (id) => id.toString() !== subject._id.toString()
    );
    await teacher.save();

    // ── Notify the teacher ────────────────────────────────────────────────
    await notify({
      userId:    teacher._id,
      userModel: 'Teacher',
      type:      EVENTS.SUBJECT_REMOVED,
      title:     'Subject Removed',
      message:   `You have been removed from teaching "${subject.name}" (${subject.gradeLevel}).`,
      link:      '/my-subjects',
    });

    await teacher.populate('assignedSubjects');

    res.status(200).json({
      success: true,
      message: 'Subject removed from teacher successfully',
      data: teacher,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get teachers assigned to a subject
// @route   GET /api/subjects/:slug/teachers
// @access  Private (Admin)
exports.getSubjectTeachers = async (req, res, next) => {
  try {
    const subject = await resolveSubject(req.params.id);
    if (!subject) {
      return next(new AppError('Subject not found', 404));
    }

    const teachers = await Teacher.find({
      assignedSubjects: subject._id,
    }).populate('assignedSubjects');

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    next(error);
  }
};
