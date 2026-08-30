/**
 * Notification event types used across the platform.
 */
const EVENTS = Object.freeze({
  // ── Auth / account ────────────────────────────────────────────────────────
  NEW_REGISTRATION:          'new_registration',
  ACCOUNT_APPROVED:          'account_approved',
  ACCOUNT_REJECTED:          'account_rejected',

  // ── Subject management ────────────────────────────────────────────────────
  SUBJECT_ASSIGNED:          'subject_assigned',        // teacher ← admin assigns subject
  SUBJECT_REMOVED:           'subject_removed',         // teacher ← admin removes subject
  SUBJECT_DELETED:           'subject_deleted',         // teacher ← admin deletes subject

  // ── Enrollment ────────────────────────────────────────────────────────────
  ENROLLED_IN_COURSE:        'enrolled_in_course',      // student ← enrolled in subject
  STUDENT_ENROLLED:          'student_enrolled',        // teacher ← new student enrolled
  STUDENT_DROPPED:           'student_dropped',         // teacher ← student dropped

  // ── Content ───────────────────────────────────────────────────────────────
  NEW_LESSON:                'new_lesson',              // student ← lesson created
  LESSON_UPDATED:            'lesson_updated',          // student ← lesson updated
  LESSON_DELETED:            'lesson_deleted',          // student ← lesson deleted
  NEW_DOCUMENT:              'new_document',
  NEW_COURSE:                'new_course',              // student ← course created
  COURSE_UPDATED:            'course_updated',          // student ← course updated
  COURSE_DELETED:            'course_deleted',          // student ← course deleted

  // ── Assignments ───────────────────────────────────────────────────────────
  NEW_ASSIGNMENT:            'new_assignment',          // student ← assignment created
  ASSIGNMENT_SUBMITTED:      'assignment_submitted',    // teacher ← student submitted
  ASSIGNMENT_GRADED:         'assignment_graded',       // student ← teacher graded
  ASSIGNMENT_REJECTED:       'assignment_rejected',
  ASSIGNMENT_DUE_SOON:       'assignment_due_soon',     // student ← deadline reminder

  // ── Quizzes ───────────────────────────────────────────────────────────────
  NEW_QUIZ:                  'new_quiz',                // student ← quiz published
  QUIZ_PUBLISHED:            'quiz_published',          // teacher ← quiz is now live
  QUIZ_SUBMITTED:            'quiz_submitted',          // teacher ← student completed quiz
  QUIZ_RESULT:               'quiz_result',             // student ← result available

  // ── Exams ─────────────────────────────────────────────────────────────────
  NEW_EXAM:                  'new_exam',                // student ← exam published
  EXAM_PUBLISHED:            'exam_published',          // teacher ← exam is now live
  EXAM_SUBMITTED:            'exam_submitted',          // teacher ← student completed exam
  EXAM_RESULT:               'exam_result',             // student ← result available
  EXAM_STARTING_SOON:        'exam_starting_soon',      // student ← startTime reminder

  // ── Live classes ──────────────────────────────────────────────────────────
  LIVE_CLASS_SCHEDULED:      'live_class_scheduled',

  // ── Certificates / payments ───────────────────────────────────────────────
  CERTIFICATE_ISSUED:        'certificate_issued',
  PAYMENT_SUCCESS:           'payment_success',
  PAYMENT_FAILED:            'payment_failed',
});

module.exports = { EVENTS };
