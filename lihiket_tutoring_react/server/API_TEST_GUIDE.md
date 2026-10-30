# Lihiket API — Complete Test Guide

Base URL (local):      http://localhost:5000/api
Base URL (production): https://lihiket-api.onrender.com/api

## How to use
1. Login first → copy the token from response
2. Add header to all protected requests:
   Authorization: Bearer <your_token>

---

## 1. AUTH

### Register
POST /auth/register
Body (Student):
{
  "role": "student",
  "firstName": "Selam",
  "lastName": "Alemu",
  "username": "selam.alemu",
  "email": "selam@test.com",
  "password": "Test@12345",
  "phone": "+251911000099",
  "gradeLevel": "G12",
  "parentFullName": "Alemu Tadesse",
  "parentPhone": "+251911000088"
}

Body (Teacher):
{
  "role": "teacher",
  "firstName": "Dawit",
  "lastName": "Haile",
  "username": "dawit.haile",
  "email": "dawit@test.com",
  "password": "Test@12345",
  "phone": "+251911000077",
  "specializedSubject": "Mathematics",
  "qualifications": "MSc Mathematics",
  "experience": 5
}

Body (Parent):
{
  "role": "parent",
  "firstName": "Alemu",
  "lastName": "Tadesse",
  "username": "alemu.parent",
  "email": "alemu@test.com",
  "password": "Test@12345",
  "phone": "+251911000066",
  "country": "Ethiopia"
}

### Login (email or username)
POST /auth/login
Body:
{ "email": "admin@lihiket.com", "password": "Admin@12345" }
{ "email": "superadmin", "password": "Admin@12345" }
{ "email": "teacher@lihiket.com", "password": "Teacher@12345" }
{ "email": "student@lihiket.com", "password": "Student@12345" }
{ "email": "parent@lihiket.com", "password": "Parent@12345" }

### Forgot Password
POST /auth/forgot-password
Body: { "email": "admin@lihiket.com" }

### Verify OTP
POST /auth/verify-otp
Body: { "email": "admin@lihiket.com", "otp": "123456" }

### Set New Password
POST /auth/set-new-password
Body: { "email": "admin@lihiket.com", "otp": "123456", "password": "NewPass@123" }

### Get My Profile  [AUTH REQUIRED]
GET /auth/me

### Update Profile  [AUTH REQUIRED]
PUT /auth/profile
Body:
{
  "firstName": "Super",
  "lastName": "Admin",
  "phone": "+251911000001",
  "bio": "Platform administrator"
}

### Change Password  [AUTH REQUIRED]
PUT /auth/change-password
Body:
{ "currentPassword": "Admin@12345", "newPassword": "NewAdmin@123" }

---

## 2. USERS  [ADMIN ONLY]

### Get All Users
GET /users
GET /users?role=student
GET /users?role=teacher
GET /users?search=selam

### Get Pending Users (awaiting approval)
GET /users/pending

### Get All Teachers
GET /users/teachers

### Get Single User
GET /users/<userId>?userType=student
GET /users/<userId>?userType=teacher
GET /users/<userId>?userType=admin

### Approve User
POST /users/<userId>/approve

### Reject User
DELETE /users/<userId>/reject

### Toggle Active Status
PATCH /users/<userId>/toggle-active

### Update User
PUT /users/<userId>
Body: { "firstName": "Updated", "phone": "+251911000000" }

### Delete User
DELETE /users/<userId>

### Parent: Get My Children  [PARENT ONLY]
GET /users/my-children

---

## 3. SUBJECTS  [AUTH REQUIRED]

### Get All Subjects
GET /subjects
GET /subjects?search=math
GET /subjects?gradeLevel=G12

### Get Single Subject
GET /subjects/<subjectId>
GET /subjects/english-g12   (by slug)

### Create Subject  [ADMIN ONLY]
POST /subjects
Body:
{
  "name": "Mathematics",
  "description": "Grade 12 Mathematics covering calculus and algebra",
  "gradeLevel": "G12",
  "category": "Science",
  "price": 500
}

### Update Subject  [ADMIN ONLY]
PUT /subjects/<subjectId>
Body: { "name": "Advanced Mathematics", "price": 600 }

### Delete Subject  [ADMIN ONLY]
DELETE /subjects/<subjectId>

### Assign Teacher to Subject  [ADMIN ONLY]
POST /subjects/<subjectId>/assign
Body: { "teacherId": "<teacherId>" }

### Remove Teacher from Subject  [ADMIN ONLY]
DELETE /subjects/<subjectId>/assign/<teacherId>

### Get Subject Teachers  [ADMIN ONLY]
GET /subjects/<subjectId>/teachers

---

## 4. COURSES  [AUTH REQUIRED]

### Get Courses by Subject
GET /courses/subject/<subjectId>

### Get Single Course
GET /courses/<courseId>

### Create Course  [ADMIN/TEACHER]
POST /courses
Body:
{
  "title": "Introduction to Calculus",
  "description": "Limits, derivatives and integrals",
  "subjectId": "<subjectId>",
  "order": 1
}

### Update Course  [ADMIN/TEACHER]
PUT /courses/<courseId>
Body: { "title": "Updated Course Title", "order": 2 }

### Delete Course  [ADMIN/TEACHER]
DELETE /courses/<courseId>

---

## 5. LESSONS  [AUTH REQUIRED]

### Get Lessons by Course
GET /lessons/course/<courseId>

### Get Single Lesson
GET /lessons/<lessonId>

### Create Lesson  [ADMIN/TEACHER]
POST /lessons
Content-Type: multipart/form-data
Fields:
  title: "Lesson 1 — Limits"
  description: "Introduction to limits"
  courseId: <courseId>
  type: video | document | text
  content: (text content if type=text)
  file: (file upload if type=video or document)

### Update Lesson  [ADMIN/TEACHER]
PUT /lessons/<lessonId>
(same fields as create)

### Delete Lesson  [ADMIN/TEACHER]
DELETE /lessons/<lessonId>

---

## 6. ASSIGNMENTS  [AUTH REQUIRED]

### Get All Assignments
GET /assignments
GET /assignments?subjectId=<id>

### Get Single Assignment
GET /assignments/<assignmentId>

### Create Assignment  [ADMIN/TEACHER]
POST /assignments
Content-Type: multipart/form-data
Fields:
  title: "Assignment 1"
  description: "Solve problems 1-10"
  subjectId: <subjectId>
  dueDate: 2026-12-31T23:59:00.000Z
  totalMarks: 100
  file: (optional attachment)

### Update Assignment  [ADMIN/TEACHER]
PUT /assignments/<assignmentId>
Body: { "title": "Updated Assignment", "totalMarks": 50 }

### Delete Assignment  [ADMIN/TEACHER]
DELETE /assignments/<assignmentId>

### Submit Assignment  [STUDENT ONLY]
POST /assignments/<assignmentId>/submit
Content-Type: multipart/form-data
Fields:
  answer: "My answer text"
  file: (optional file)

### Get Submissions  [ADMIN/TEACHER]
GET /assignments/<assignmentId>/submissions

### Grade Submission  [ADMIN/TEACHER]
PUT /assignments/<assignmentId>/submissions/<studentId>/grade
Body: { "score": 85, "feedback": "Good work!" }

---

## 7. QUIZZES  [AUTH REQUIRED]

### Get All Quizzes
GET /quizzes
GET /quizzes?subjectId=<id>

### Get Single Quiz
GET /quizzes/<quizId>

### Create Quiz  [ADMIN/TEACHER]
POST /quizzes
Body:
{
  "title": "Quiz 1 — Chapter 1",
  "description": "Test your knowledge",
  "subjectId": "<subjectId>",
  "duration": 30,
  "totalMarks": 100,
  "passMark": 50,
  "questions": [
    {
      "question": "What is 2+2?",
      "options": ["2", "3", "4", "5"],
      "correctAnswer": "4",
      "marks": 10
    }
  ]
}

### Update Quiz  [ADMIN/TEACHER]
PUT /quizzes/<quizId>
Body: { "title": "Updated Quiz", "duration": 45 }

### Delete Quiz  [ADMIN/TEACHER]
DELETE /quizzes/<quizId>

### Submit Quiz  [STUDENT ONLY]
POST /quizzes/<quizId>/submit
Body:
{
  "answers": [
    { "questionId": "<qId>", "answer": "4" }
  ]
}

### Get All Results  [ADMIN/TEACHER]
GET /quizzes/<quizId>/results

### Get My Results  [ALL]
GET /quizzes/<quizId>/my-results

---

## 8. EXAMS  [AUTH REQUIRED]

### Get All Exams
GET /exams
GET /exams?subjectId=<id>

### Get Single Exam
GET /exams/<examId>

### Create Exam  [ADMIN/TEACHER]
POST /exams
Body:
{
  "title": "Mid-Term Exam",
  "description": "Covers chapters 1-5",
  "subjectId": "<subjectId>",
  "duration": 120,
  "totalMarks": 100,
  "passMark": 50,
  "scheduledAt": "2026-12-01T09:00:00.000Z",
  "questions": [
    {
      "question": "Define a limit.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "marks": 10
    }
  ]
}

### Update Exam  [ADMIN/TEACHER]
PUT /exams/<examId>
Body: { "title": "Final Exam", "duration": 180 }

### Delete Exam  [ADMIN/TEACHER]
DELETE /exams/<examId>

### Submit Exam  [STUDENT ONLY]
POST /exams/<examId>/submit
Body: { "answers": [{ "questionId": "<qId>", "answer": "Option A" }] }

### Get All Results  [ADMIN/TEACHER]
GET /exams/<examId>/results

### Get My Results  [ALL]
GET /exams/<examId>/my-results

---

## 9. LIVE CLASSES  [AUTH REQUIRED]

### Get All Live Classes
GET /live-classes
GET /live-classes?subjectId=<id>

### Get Single Live Class
GET /live-classes/<classId>

### Create Live Class  [ADMIN/TEACHER]
POST /live-classes
Body:
{
  "title": "Live Q&A Session",
  "description": "Ask your questions",
  "subjectId": "<subjectId>",
  "scheduledAt": "2026-12-01T10:00:00.000Z",
  "duration": 60,
  "meetingLink": "https://meet.google.com/abc-defg-hij"
}

### Update Live Class  [ADMIN/TEACHER]
PUT /live-classes/<classId>
Body: { "title": "Updated Class", "duration": 90 }

### Delete Live Class  [ADMIN/TEACHER]
DELETE /live-classes/<classId>

---

## 10. ENROLLMENTS  [AUTH REQUIRED]

### Get My Enrollments  [STUDENT ONLY]
GET /enrollments

### Enroll in Subject  [STUDENT ONLY]
POST /enrollments/<subjectId>

### Unenroll from Subject  [STUDENT ONLY]
DELETE /enrollments/<subjectId>

### Get Enrolled Students by Subject  [ADMIN/TEACHER]
GET /enrollments/subject/<subjectId>

### Remove Enrollment  [ADMIN ONLY]
DELETE /enrollments/subject/<subjectId>/student/<studentId>

---

## 11. DOCUMENTS  [AUTH REQUIRED]

### Get All Documents
GET /documents
GET /documents?subjectId=<id>

### Get Single Document
GET /documents/<docId>

### Upload Document  [ADMIN/TEACHER]
POST /documents
Content-Type: multipart/form-data
Fields:
  title: "Chapter 1 Notes"
  description: "PDF notes for chapter 1"
  subjectId: <subjectId>
  file: (PDF/DOC file)

### Update Document  [ADMIN/TEACHER]
PUT /documents/<docId>
Body: { "title": "Updated Notes" }

### Delete Document  [ADMIN/TEACHER]
DELETE /documents/<docId>

---

## 12. QUESTION BANK  [TEACHER/ADMIN]

### Get All Questions
GET /question-bank
GET /question-bank?subjectId=<id>

### Get Single Question
GET /question-bank/<questionId>

### Create Question  [TEACHER ONLY]
POST /question-bank
Body:
{
  "question": "What is the derivative of x²?",
  "options": ["x", "2x", "x²", "2"],
  "correctAnswer": "2x",
  "explanation": "Power rule: d/dx(xⁿ) = nxⁿ⁻¹",
  "subjectId": "<subjectId>",
  "difficulty": "medium",
  "marks": 5
}

### Update Question  [TEACHER ONLY]
PUT /question-bank/<questionId>
Body: { "difficulty": "hard", "marks": 10 }

### Delete Question  [TEACHER ONLY]
DELETE /question-bank/<questionId>

---

## 13. NOTIFICATIONS  [AUTH REQUIRED]

### Get All Notifications
GET /notifications

### Get Unread Count
GET /notifications/unread-count

### Mark One as Read
PATCH /notifications/<notifId>/read

### Mark All as Read
PATCH /notifications/read-all

### Delete One
DELETE /notifications/<notifId>

### Clear All
DELETE /notifications/clear-all

---

## 14. CHAT  [AUTH REQUIRED]

### Get Chatable Users
GET /chats/users

### Get Unread Count
GET /chats/unread-count

### Get All Conversations
GET /chats

### Start Conversation
POST /chats
Body: { "userId": "<otherUserId>" }

### Get Messages in Conversation
GET /chats/<conversationId>/messages

### Send Message
POST /chats/<conversationId>/messages
Body: { "content": "Hello! How are you?" }

### Delete Message
DELETE /chats/messages/<messageId>

### Delete Conversation
DELETE /chats/<conversationId>

---

## 15. PAYMENTS  [AUTH REQUIRED]

### Get Payment Methods (Public)
GET /payments/methods

### Initiate Payment  [STUDENT ONLY]
POST /payments/initiate
Body:
{
  "subjectId": "<subjectId>",
  "amount": 500,
  "currency": "ETB",
  "paymentMethod": "chapa"
}

### Verify Payment  [STUDENT ONLY]
GET /payments/verify?tx_ref=<transaction_ref>

### Get My Payments  [STUDENT ONLY]
GET /payments/my-payments

### Get All Payments  [ADMIN ONLY]
GET /payments/all

---

## 16. SEARCH  [AUTH REQUIRED]

### Search Everything
GET /search?q=mathematics
GET /search?q=calculus&type=course
GET /search?q=dawit&type=user

---

## QUICK TEST SEQUENCE (Postman/curl)

1. Login as admin:
   POST /auth/login  →  copy token

2. Create subject:
   POST /subjects  →  copy subjectId

3. Approve a teacher:
   POST /users/<teacherId>/approve

4. Assign teacher to subject:
   POST /subjects/<subjectId>/assign  { "teacherId": "..." }

5. Login as student:
   POST /auth/login  →  copy student token

6. Enroll in subject:
   POST /enrollments/<subjectId>

7. Take quiz:
   POST /quizzes/<quizId>/submit

8. Check results:
   GET /quizzes/<quizId>/my-results
