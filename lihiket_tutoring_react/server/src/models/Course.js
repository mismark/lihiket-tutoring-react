const mongoose = require('mongoose');
const { slugify } = require('../utils/slugify');

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    slug: {
      type:      String,
      unique:    true,
      trim:      true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, collection: 'courses' }
);

// Auto-generate slug from title before saving
CourseSchema.pre('save', async function (next) {
  if (this.isModified('title') || !this.slug) {
    const base = slugify(this.title);
    let slug   = base;
    let suffix = 1;
    while (true) {
      const exists = await mongoose.model('Course').findOne({ slug, _id: { $ne: this._id } });
      if (!exists) break;
      slug = `${base}-${++suffix}`;
    }
    this.slug = slug;
  }
  next();
});

module.exports = mongoose.model('Course', CourseSchema);
