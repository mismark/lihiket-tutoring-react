const LiveClass = require('../models/LiveClass');
const AppError  = require('../utils/AppError');

exports.getAll = async (req, res, next) => {
  try {
    const { subject, status, gradeLevel } = req.query;
    const filter = {};
    if (subject)    filter.subject    = subject;
    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (status)     filter.status     = status;
    // Students only see scheduled/live/ended (not cancelled unless admin)
    if (req.userRole === 'student') filter.status = { $in: ['scheduled','live','ended'] };

    const classes = await LiveClass.find(filter)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName')
      .sort({ scheduledAt: -1 });

    res.json({ success: true, count: classes.length, data: classes });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const lc = await LiveClass.findById(req.params.id)
      .populate('subject', 'name code gradeLevel')
      .populate('createdBy', 'firstName lastName');
    if (!lc) return next(new AppError('Live class not found', 404));
    res.json({ success: true, data: lc });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, subject, gradeLevel, meetingLink,
            platform, scheduledAt, duration, notes } = req.body;
    if (!title || !meetingLink || !scheduledAt)
      return next(new AppError('title, meetingLink and scheduledAt are required', 400));

    const lc = await LiveClass.create({
      title, description: description || '', subject: subject || null,
      gradeLevel: gradeLevel || '', meetingLink, platform: platform || 'meet',
      scheduledAt: new Date(scheduledAt), duration: Number(duration) || 60,
      notes: notes || '', status: 'scheduled',
      createdBy: req.user._id,
      createdByModel: req.userRole === 'admin' ? 'Admin' : 'Teacher',
    });
    await lc.populate('subject', 'name code');
    res.status(201).json({ success: true, data: lc });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return next(new AppError('Live class not found', 404));
    if (req.userRole === 'teacher' && lc.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only edit your own live classes', 403));

    const ALLOWED = ['title','description','subject','gradeLevel','meetingLink',
                     'platform','scheduledAt','duration','status','recordingUrl','notes'];
    ALLOWED.forEach(f => { if (req.body[f] !== undefined) lc[f] = req.body[f]; });
    if (req.body.scheduledAt) lc.scheduledAt = new Date(req.body.scheduledAt);

    await lc.save();
    res.json({ success: true, data: lc });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const lc = await LiveClass.findById(req.params.id);
    if (!lc) return next(new AppError('Live class not found', 404));
    if (req.userRole === 'teacher' && lc.createdBy.toString() !== req.user._id.toString())
      return next(new AppError('You can only delete your own live classes', 403));
    await LiveClass.findByIdAndDelete(lc._id);
    res.json({ success: true, message: 'Live class deleted' });
  } catch (err) { next(err); }
};
