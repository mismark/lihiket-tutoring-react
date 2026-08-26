/**
 * Notification event types used across the platform.
 */
const EVENTS = Object.freeze({
  NEW_REGISTRATION:          'new_registration',
  ACCOUNT_APPROVED:          'account_approved',
  ACCOUNT_REJECTED:          'account_rejected',
  ENROLLED_IN_COURSE:        'enrolled_in_course',
  NEW_LESSON:                'new_lesson',
  NEW_DOCUMENT:              'new_document',
  NEW_ASSIGNMENT:            'new_assignment',
  NEW_QUIZ:                  'new_quiz',
  NEW_EXAM:                  'new_exam',
  ASSIGNMENT_GRADED:         'assignment_graded',
  ASSIGNMENT_REJECTED:       'assignment_rejected',
  QUIZ_RESULT:               'quiz_result',
  EXAM_RESULT:               'exam_result',
  LIVE_CLASS_SCHEDULED:      'live_class_scheduled',
  CERTIFICATE_ISSUED:        'certificate_issued',
  PAYMENT_SUCCESS:           'payment_success',
  PAYMENT_FAILED:            'payment_failed',
});

module.exports = { EVENTS };
