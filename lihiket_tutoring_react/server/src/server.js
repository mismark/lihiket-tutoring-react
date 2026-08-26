const http       = require('http');
const app        = require('./app');
const connectDB  = require('./config/db');
const { initSocket } = require('./config/socket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB()
  .then(async () => {
    // Backfill slugs for subjects and courses created before this feature
    try {
      const Subject = require('./models/Subject');
      const Course  = require('./models/Course');
      const noSlug  = { $or: [{ slug: { $exists: false } }, { slug: '' }, { slug: null }] };

      const [missingSub, missingCourse] = await Promise.all([
        Subject.find(noSlug),
        Course.find(noSlug),
      ]);
      for (const s of missingSub)  { s.name  = s.name;  await s.save().catch(() => {}); }
      for (const c of missingCourse){ c.title = c.title; await c.save().catch(() => {}); }
      const total = missingSub.length + missingCourse.length;
      if (total) console.log(`✅ Backfilled slugs for ${missingSub.length} subjects, ${missingCourse.length} courses`);
    } catch (e) {
      console.warn('⚠️  Slug backfill failed (non-fatal):', e.message);
    }
    // Wrap Express in a plain http.Server so Socket.IO can share the same port
    const server = http.createServer(app);
    initSocket(server);

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Lihiket API running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/api/health\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please close the other process or set a different PORT in .env`);
      } else {
        console.error('❌ Server error:', err.message);
      }
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message);
  });
