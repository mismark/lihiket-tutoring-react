const ROLES = Object.freeze({
  ADMIN:   'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  PARENT:  'parent',
});

const COLLECTIONS = Object.freeze({
  admin:   'admins',
  teacher: 'teachers',
  student: 'students',
  parent:  'parents',
});

module.exports = { ROLES, COLLECTIONS };
