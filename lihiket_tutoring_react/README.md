# Lihiket Tutoring Platform

A full-stack education platform built with React, Node.js, and MongoDB.

## 🚀 Quick Start

**Prerequisites**: Node.js v16+ and MongoDB running locally (or accessible)

```bash
# 1. Install all dependencies (already done if running first time)
npm run install:all

# 2. Start both client and server together
npm run dev
```

Then open your browser to: **http://localhost:5173**

Backend runs on: **http://localhost:5000**

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

---

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- File handling: Multer + uploads folder
- Performance: React Query, gzip compression, rate limiting, optimized API patterns

## Project Structure

```text
lihiket_tutoring_react/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── constants/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── server/                        # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── SRS.md
│   └── FOLDER_STRUCTURE.md
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Development Workflow

### Install dependencies
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### Run the app
```bash
npm run dev
```

### Run frontend only
```bash
npm run client
```

### Run backend only
```bash
npm run server
```

## Environment Files
- Client: `client/.env`
- Server: `server/.env`

Copy the example files before starting the app:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

## Core Features
- Authentication and role-based access
- Subject and course management
- Lesson, assignment, and document modules
- Quiz and exam workflows
- Live class scheduling
- Notification system
- Certificate generation
- Admin moderation and dashboard analytics

## Quality and Performance Guidelines
- Keep frontend state and API calls separated
- Use caching for repeated reads via React Query
- Optimize large payloads with pagination and compression
- Use MongoDB indexes on frequently queried fields
- Keep uploads in a dedicated `uploads` folder and restrict file types
- Avoid unnecessary client re-renders and large component trees

## Documentation
- [Functional requirements](docs/SRS.md)
- [Folder map](docs/FOLDER_STRUCTURE.md)
