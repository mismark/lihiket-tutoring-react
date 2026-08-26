# Lihiket Tutoring Platform - Setup & Running Guide

## 🚀 Quick Start

This is a full-stack application with:
- **Frontend**: React + Vite (Port 5173)
- **Backend**: Node.js + Express (Port 5000)
- **Database**: MongoDB

### Prerequisites

Before running the application, ensure you have:

1. **Node.js** (v16+) and npm installed
   - Download from https://nodejs.org/

2. **MongoDB** running locally or accessible
   - For local development: `mongodb://localhost:27017/lihiket_tutoring`
   - Or download MongoDB Community: https://www.mongodb.com/try/download/community

## 📋 Environment Configuration

The `.env` files are already set up in:
- `server/.env` - Backend configuration
- `client/.env` - Frontend configuration

### Server Configuration (.env)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/lihiket_tutoring
JWT_SECRET=lihiket_super_secret_key_change_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Client Configuration (.env)

```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Lihiket Tutoring
```

## 🛠️ Setup Steps

### Step 1: Install Dependencies

Both dependencies are already installed, but to reinstall:

```bash
npm run install:all
```

Or individually:
```bash
npm --prefix server install
npm --prefix client install
```

### Step 2: Start MongoDB

**Windows (Local MongoDB)**:
```bash
# If MongoDB is installed, it may already be running as a service
# Check in Services app or run:
mongod
```

**Using Docker** (if you have Docker):
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Online MongoDB** (Atlas):
- Update `MONGO_URI` in `server/.env` with your MongoDB Atlas connection string

### Step 3: Seed Initial Data (Optional)

This creates test users for development:

```bash
npm run seed
```

**Test Credentials After Seeding**:
- Admin: `admin@lihiket.com` / `Admin@12345`
- Teacher: `teacher@lihiket.com` / `Teacher@12345`
- Student: `student@lihiket.com` / `Student@12345`
- Parent: `parent@lihiket.com` / `Parent@12345`

## ▶️ Running the Application

### Option 1: Run Everything Together (Recommended)

```bash
npm run dev
```

This starts:
- ✅ Backend server on `http://localhost:5000`
- ✅ Frontend client on `http://localhost:5173`
- Both services run side-by-side

### Option 2: Run Separately

**Terminal 1 - Start Backend**:
```bash
npm run server
```
- Server will start on http://localhost:5000
- Health check: http://localhost:5000/api/health

**Terminal 2 - Start Frontend**:
```bash
npm run client
```
- Frontend will start on http://localhost:5173
- You'll see "Local: http://localhost:5173/"

### Option 3: Production Build

```bash
npm run build
```

This creates an optimized production build in `client/dist/`

## 🔌 API Connection Verification

The frontend is configured to connect to the backend at `http://localhost:5000/api`

### Check Backend Health:
```
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Lihiket API is running",
  "timestamp": "2026-08-14T..."
}
```

## 📚 Available API Endpoints

- `/api/auth` - Authentication (register, login, logout, verify OTP)
- `/api/users` - User management
- `/api/courses` - Courses
- `/api/lessons` - Lessons
- `/api/assignments` - Assignments
- `/api/quizzes` - Quizzes
- `/api/exams` - Exams
- `/api/notifications` - Notifications
- `/api/payments` - Payment processing
- And more...

## 🛑 Troubleshooting

### "Port 5000 already in use"
```bash
# Find and kill the process using port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :5000
kill -9 <PID>
```

### "MongoDB connection error"
1. Verify MongoDB is running: `mongo` or `mongosh`
2. Check connection string in `server/.env`
3. Verify network connectivity if using MongoDB Atlas
4. Check firewall settings

### "Frontend can't connect to backend"
1. Ensure backend is running on http://localhost:5000
2. Check `VITE_API_URL` in `client/.env`
3. Check browser console (F12) for CORS errors
4. Verify both services are on the same machine or accessible via network

### "Build errors"
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm run install:all
npm run build
```

## 📝 Project Structure

```
lihiket_tutoring_react/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── pages/         # Page components (auth, dashboard, etc.)
│   │   ├── components/    # Reusable components
│   │   ├── api/           # API service calls (uses Axios)
│   │   └── store/         # State management
│   └── .env               # Frontend env variables
├── server/                # Node.js + Express backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   ├── models/        # MongoDB schemas
│   │   ├── middleware/    # Express middleware
│   │   └── config/        # Configuration files
│   └── .env               # Backend env variables
└── package.json           # Root scripts for running both
```

## 🎯 Common Commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Runs both client and server together |
| `npm run client` | Runs frontend only (http://localhost:5173) |
| `npm run server` | Runs backend only (http://localhost:5000) |
| `npm run seed` | Populates database with test data |
| `npm run build` | Creates production build |
| `npm run install:all` | Installs all dependencies |

## ✨ Next Steps

1. **Start the app**: `npm run dev`
2. **Open browser**: http://localhost:5173
3. **Test registration**: Create a new account or use seeded credentials
4. **Verify backend**: Check http://localhost:5000/api/health

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review browser console errors (F12)
3. Check server logs in terminal
4. Verify MongoDB is running and accessible
5. Ensure all environment variables are set correctly

---

**Happy Coding! 🚀**
