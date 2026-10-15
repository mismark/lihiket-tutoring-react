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

    // Allow long-running requests (e.g. 2 GB video uploads).
    // Node default is 0 (no timeout); reverse proxies (Render, Nginx) often
    // impose their own 30 s idle timeout which would kill large uploads.
    // 100 minutes covers a 2 GB file even on a slow 3 MB/s connection.
    const UPLOAD_TIMEOUT_MS = 100 * 60 * 1000; // 100 min
    server.timeout        = UPLOAD_TIMEOUT_MS; // inactivity timeout per request
    server.headersTimeout = UPLOAD_TIMEOUT_MS + 5000; // must be > timeout
    server.requestTimeout = UPLOAD_TIMEOUT_MS + 10000; // full request lifecycle

    // Start live class auto-status job (scheduled→live→ended)
    const { startLiveClassJob } = require('./jobs/liveclass.status.job');
    startLiveClassJob();

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
