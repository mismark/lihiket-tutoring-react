const mongoose = require('mongoose');
const { GRADE_LEVELS } = require('../constants/grades');
const { slugify } = require('../utils/slugify');

const SUBJECT_CATEGORIES = [
  'STEM',
  'Sciences',
  'Mathimatics and algebra',
  'Languages',
  'Arts',
  'Social Studies',
  'Physical Education',
  'Other',
];

const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    slug: {
      type:    String,
      unique:  true,
      trim:    true,
      lowercase: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      trim: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    gradeLevel: {
      type: String,
      required: [true, 'Grade level is required'],
      enum: GRADE_LEVELS,
    },
    category: {
      type: String,
      required: [true, 'Subject category is required'],
      enum: SUBJECT_CATEGORIES,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
  },
  { timestamps: true, collection: 'subjects' }
);

// Same name is allowed for different grade levels, but not within the same grade
SubjectSchema.index({ name: 1, gradeLevel: 1 }, { unique: true });

// Auto-generate slug before saving
SubjectSchema.pre('save', async function (next) {
  // Regenerate whenever name or gradeLevel changes (or on first save)
  if (this.isModified('name') || this.isModified('gradeLevel') || !this.slug) {
    const base = slugify(this.name, this.gradeLevel);
    let slug    = base;
    let suffix  = 1;

    // Ensure uniqueness — append -2, -3, … on collision
    while (true) {
      const existing = await mongoose.model('Subject').findOne({
        slug,
        _id: { $ne: this._id },
      });
      if (!existing) break;
      slug = `${base}-${++suffix}`;
    }

    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Subject', SubjectSchema);
module.exports.SUBJECT_CATEGORIES = SUBJECT_CATEGORIES;
