/**
 * Turn a subject name + gradeLevel into a clean URL slug.
 * e.g.  "English", "Grade 12"  →  "english-grade-12"
 * e.g.  "Maths & Algebra", "G9" →  "maths-algebra-g9"
 */
function slugify(name, gradeLevel = '') {
  const base = `${name} ${gradeLevel}`
    .toLowerCase()
    .replace(/&/g, 'and')          // & → and
    .replace(/[^a-z0-9\s-]/g, '') // strip non-alphanumeric (except spaces/hyphens)
    .trim()
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/-+/g, '-');          // collapse multiple hyphens
  return base;
}

module.exports = { slugify };
