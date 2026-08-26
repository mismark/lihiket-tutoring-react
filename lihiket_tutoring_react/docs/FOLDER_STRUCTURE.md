# Project Folder Structure

This repository follows a clean full-stack architecture for a React frontend and Node.js + MongoDB backend.

```text
lihiket_tutoring_react/
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
├── docs/
│   ├── SRS.md
│   └── FOLDER_STRUCTURE.md
│
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── constants/
│       ├── hooks/
│       ├── lib/
│       ├── pages/
│       ├── routes/
│       ├── store/
│       ├── styles/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── .env.example
│   ├── package.json
│   ├── uploads/
│   └── src/
│       ├── app.js
│       ├── seed.js
│       ├── server.js
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── jobs/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── test_auth.js
│
└── src/  # removed in cleanup; kept empty files are not used by the app
```

## Why this structure works
- Frontend and backend are separated cleanly.
- The root workspace remains lightweight for monorepo scripts.
- All environment files remain hidden via `.gitignore`.
- Uploads, env data, and build files are isolated.
- Server and client each have their own package manifests and runtime dependencies.

## Performance-focused conventions
- Frontend: smaller reusable components, lazy loading where needed, React Query for API caching.
- Backend: Mongoose models, rate limiting, compression, and indexing on high-traffic fields.
- Database: avoid redundant nested documents and keep large files in object storage or upload directories when appropriate.
- Deployment: keep build artifacts out of source control and only commit source files.

