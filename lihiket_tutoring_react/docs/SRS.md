# Software Requirements Specification (SRS)
# Lihiket Online Tutoring Platform
**Version:** 2.0  
**Stack:** React + Node.js + MongoDB  
**Date:** 2026

---

## 1. Introduction

### 1.1 Purpose
Lihiket is a full-featured online tutoring platform. Every registered user must be **verified by an admin** before they can log in. The system uses **separate database collections per role** for clean data separation.

### 1.2 Scope
- Role-based access: Admin / Teacher / Student / Parent
- Admin approval required before any user can log in
- Separate MongoDB collections for each role
- Course enrollment filtered by grade level and subject
- Live class scheduling with countdown timers
- Assignments with due-date enforcement and grading
- Timed quizzes and scheduled exams with auto-submit
- Document library with download tracking
- Real-time notifications
- Certificate generation with QR verification
- Secure JWT authentication with OTP password reset

---

## 2. User Models — Separate Collections

### 2.1 Design Decision
Each role has its **own MongoDB collection** with role-specific fields.

```
MongoDB Collections:
  admins      → Admin model
  teachers    → Teacher model
  students    → Student model
  parents     → Parent model
```

A shared `baseUserFields` object contains common fields reused across all models.

---

### 2.2 Shared Base Fields (all roles)

| Field            | Type    | Notes |
|------------------|---------|-------|
| firstName        | String  | required |
| lastName         | String  | required |
| username         | String  | required, unique |
| email            | String  | required, unique |
| password         | String  | hashed with bcrypt |
| phone            | String  | required |
| profilePicture   | String  | file path |
| bio              | String  | optional |
| dateOfBirth      | Date    | optional |
| address          | String  | optional |
| isVerified       | Boolean | **default: false** — set to true by admin |
| isActive         | Boolean | default: true |
| verifiedAt       | Date    | when admin approved |
| verifiedBy       | ObjectId| ref to Admin |
| passwordResetOTP | String  | 4-digit OTP |
| otpExpires       | Date    | OTP expiry |
| createdAt        | Date    | auto |
| updatedAt        | Date    | auto |

---

### 2.3 Admin Model (`admins` collection)

Extra fields beyond base:

| Field       | Type   | Notes |
|-------------|--------|-------|
| role        | String | hardcoded: "admin" |
| permissions | Array  | e.g. ["manage_users","manage_courses"] |

- Admins are created directly in the database (seeded) or by a superadmin
- Admins **do not go through the verification flow** — they are always active
- Admin can verify/reject pending users

---

### 2.4 Teacher Model (`teachers` collection)

Extra fields beyond base:

| Field               | Type   | Notes |
|---------------------|--------|-------|
| role                | String | hardcoded: "teacher" |
| specializedSubject  | String | required at registration |
| cvDocument          | String | file path — uploaded at registration |
| qualifications      | String | optional |
| experience          | Number | years of experience |
| assignedSubjects    | Array  | ObjectId refs to Subject |

---

### 2.5 Student Model (`students` collection)

Extra fields beyond base:

| Field              | Type   | Notes |
|--------------------|--------|-------|
| role               | String | hardcoded: "student" |
| gradeLevel         | String | required — KG1/KG2/.../G12/HL |
| parentFullName     | String | optional |
| parentEmail        | String | optional |
| parentPhone        | String | optional |
| parentCountry      | String | optional |

---

### 2.6 Parent Model (`parents` collection)

Extra fields beyond base:

| Field      | Type  | Notes |
|------------|-------|-------|
| role       | String| hardcoded: "parent" |
| children   | Array | ObjectId refs to Student |
| country    | String| optional |

---

## 3. Admin Verification Flow

### 3.1 Registration → Pending
1. User fills registration form (role cannot be "admin")
2. Account created with `isVerified: false`
3. User **cannot log in** — receives: *"Your account is pending admin approval."*
4. Admin receives notification: *"New [Teacher/Student/Parent] registration: [name]"*

### 3.2 Admin Reviews
Admin goes to **Pending Users** panel:
- Sees list of all unverified users grouped by role
- Can view full profile (CV for teachers, grade for students)
- Actions: **Approve** or **Reject**

### 3.3 Approve
1. Admin clicks Approve
2. `isVerified = true`, `verifiedAt = now()`, `verifiedBy = adminId`
3. User receives email: *"Your account has been approved. You can now log in."*
4. User receives notification in system

### 3.4 Reject
1. Admin clicks Reject with optional reason
2. User receives email: *"Your registration was not approved. Reason: [reason]"*
3. Account deleted or marked inactive

### 3.5 Login Check
```
POST /api/auth/login
  → find user in correct collection by email
  → check password
  → if isVerified === false → 403: "Account pending approval"
  → if isActive === false   → 403: "Account deactivated"
  → issue JWT
```

---

## 4. Authentication

### 4.1 Register
```
POST /api/auth/register
Body: { role, firstName, lastName, username, email, password,
        phone, gradeLevel (student), specializedSubject (teacher),
        cvDocument (teacher file), parentFullName (student optional) }

→ Create user in role-specific collection
→ isVerified = false
→ Notify admin
→ Return: "Registration submitted. Awaiting admin approval."
```

### 4.2 Login
```
POST /api/auth/login
Body: { email, password }

→ Determine collection from email lookup (check all 4 collections)
→ Verify password
→ Check isVerified === true
→ Return: { token, user: { id, role, firstName, ... } }
```

### 4.3 OTP Password Reset
```
POST /api/auth/forgot-password   → send 4-digit OTP via Brevo
POST /api/auth/verify-otp        → validate OTP (expires 10 min)
POST /api/auth/set-new-password  → update password
```

### 4.4 JWT Payload
```json
{
  "id":        "user_mongo_id",
  "role":      "teacher",
  "collection":"teachers",
  "iat":       1234567890,
  "exp":       1234567890
}
```

---

## 5. Functional Requirements

### 5.1 Admin Panel — User Management
- View all pending registrations (grouped by role)
- Approve / Reject with optional reason
- View all users per role (filter: verified, unverified, active, inactive)
- Deactivate/reactivate any user
- Assign teachers to subjects

### 5.2 Subjects
- Admin creates subjects per grade level
- name, grade_level, code, description, image, icon, color
- Teachers assigned by admin
- Students see only subjects matching their gradeLevel

### 5.3 Courses
- Teacher creates courses for their assigned subjects
- Course linked to one subject and one teacher
- Students enroll only in grade-matched courses

### 5.4 Lessons
- Teacher creates lessons per course
- Video file or URL, thumbnail, duration, order, preview, status

### 5.5 Documents
- Teacher uploads: PDF, DOC, DOCX, PPT, PPTX, XLS, TXT, ZIP — max 50MB
- Visibility: public / students / teachers / private
- Download counter per document

### 5.6 Assignments
- Teacher creates with due date
- Past due → auto-rejected (0 marks, grade F)
- Teacher grades: marks + letter grade + feedback

### 5.7 Quizzes
- MCQ + True/False, timed, auto-submit
- Import from Question Bank
- Result shows correct answers + explanations

### 5.8 Exams
- start_time + duration (end_time computed)
- Student page shows countdown → auto-redirect when time=0
- Auto-submit when timer expires

### 5.9 Question Bank
- Teacher creates reusable MCQ/TF questions for their subjects
- Import into quizzes and exams

### 5.10 Live Classes
- Status computed from time: upcoming / live / ended
- Countdown auto-redirects student to join URL

### 5.11 Notifications
Events that trigger notifications:
- New registration (→ admin)
- Account approved/rejected (→ user)
- Enrolled in course (→ student + teacher)
- New lesson/document/assignment/quiz/exam (→ enrolled students)
- Assignment graded/rejected (→ student)
- Quiz/exam result (→ student, teacher)
- Live class scheduled (→ enrolled students)
- Certificate issued (→ student)

### 5.12 Certificates
- Auto-issued at 100% course progress
- PDF with QR code for verification
- Public verification endpoint

### 5.13 Dashboard
- Admin: pending users count + list, total stats, recent activity
- Teacher: my courses, pending grades, students, upcoming live classes
- Student: enrolled courses + progress, upcoming events, tabs per content type
- Parent: child's progress overview

---

## 6. API Endpoints Summary

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/verify-otp
POST   /api/auth/set-new-password
GET    /api/auth/me
```

### Admin — User Management
```
GET    /api/admin/pending-users          → all unverified users
GET    /api/admin/pending-users/:role    → by role
POST   /api/admin/verify/:role/:id       → approve
POST   /api/admin/reject/:role/:id       → reject
GET    /api/admin/users/:role            → all users by role
PATCH  /api/admin/users/:role/:id/toggle → activate/deactivate
```

### Users (profile)
```
GET    /api/users/me
PATCH  /api/users/me
PATCH  /api/users/me/password
POST   /api/users/me/avatar
```

### Subjects, Courses, Lessons, Documents,
### Assignments, Quizzes, Exams, Question Bank,
### Live Classes, Certificates, Notifications, Search
```
Standard CRUD: GET / POST / PATCH / DELETE
Role-protected by middleware
```

---

## 7. Non-Functional Requirements

| Requirement | Specification |
|-------------|--------------|
| Performance | API < 200ms average |
| Security    | JWT, bcrypt, role + verification middleware |
| Timezone    | Africa/Addis_Ababa (EAT, UTC+3) |
| File Storage| Multer local (dev) / Cloudinary (prod) |
| Database    | MongoDB — 4 user collections + app collections |

---

## 8. Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, React Router v6, Axios, Tailwind CSS |
| Backend   | Node.js 20, Express.js |
| Database  | MongoDB, Mongoose |
| Auth      | JWT, bcryptjs |
| Email     | Nodemailer + Brevo HTTPS API |
| Files     | Multer |
| PDF       | PDFKit |
| QR        | qrcode |
| Real-time | Socket.io (notifications) |
