const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: 'thai-election-2569',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

// Database setup
const db = new sqlite3.Database('./voting.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database');
});

// Initialize database tables
const initDatabase = () => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        citizen_id TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        has_voted INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Votes table
    db.run(`
      CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        party_id INTEGER NOT NULL,
        voted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // Parties table
    db.run(`
      CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        vote_count INTEGER DEFAULT 0
      )
    `, () => {
      // Insert Thai parties
      const parties = [
        'เพื่อไทย (Pheu Thai)',
        'ก้าวไกล (Move Forward)',
        'พืชศรุษ (Bhumjaithai)',
        'ประชาธิปไตย (Democrat)',
        'ชาติไทย (Thai Nation)',
        'คนไทยสร้างไทย (Thai Build Thailand)',
        'สยาม (Siam)',
        'พลังประชารัฐ (Popular Force)',
        'ประชาชนใจสุไทย (Thai People)',
        'อนาคตไทย (Future Thailand)'
      ];

      parties.forEach(party => {
        db.run(`INSERT OR IGNORE INTO parties (name) VALUES (?)`, [party]);
      });
    });
  });
};

initDatabase();

// Helper function to check if citizen ID exists
const checkCitizenIdExists = (citizenId, callback) => {
  db.get(`SELECT id FROM users WHERE citizen_id = ?`, [citizenId], (err, row) => {
    callback(err, !!row);
  });
};

// Routes

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Register
app.post('/api/register', (req, res) => {
  const { citizen_id, password } = req.body;

  if (!citizen_id || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  // Validate citizen ID format (5 digits)
  if (!/^\d{5}$/.test(citizen_id)) {
    return res.status(400).json({ error: 'เลขประจำตัวต้องเป็นตัวเลข 5 หลัก' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
  }

  // Check if citizen ID already exists
  checkCitizenIdExists(citizen_id, (err, exists) => {
    if (err) {
      return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
    }

    if (exists) {
      return res.status(400).json({ error: 'เลขประจำตัวนี้ถูกใช้ไปแล้ว กรุณาเปลี่ยนเลขประจำตัว' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    db.run(
      `INSERT INTO users (citizen_id, password) VALUES (?, ?)`,
      [citizen_id, hashedPassword],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
        }
        res.json({ 
          success: true, 
          message: `สมัครสมาชิกสำเร็จ! เลขประจำตัว: ${citizen_id}`,
          citizen_id: citizen_id 
        });
      }
    );
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { citizen_id, password } = req.body;

  if (!citizen_id || !password) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
  }

  db.get(
    `SELECT * FROM users WHERE citizen_id = ?`,
    [citizen_id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
      }

      if (!user) {
        return res.status(401).json({ error: 'เลขประจำตัวไม่ถูกต้อง' });
      }

      const isValidPassword = bcrypt.compareSync(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
      }

      req.session.userId = user.id;
      req.session.citizenId = user.citizen_id;
      req.session.hasVoted = user.has_voted;

      res.json({ 
        success: true, 
        message: 'เข้าสู่ระบบสำเร็จ',
        has_voted: user.has_voted
      });
    }
  );
});

// Get voting page data
app.get('/api/voting-data', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }

  db.all(`SELECT id, name FROM parties ORDER BY name`, (err, parties) => {
    if (err) {
      return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
    }

    res.json({
      citizen_id: req.session.citizenId,
      has_voted: req.session.hasVoted,
      parties: parties
    });
  });
});

// Submit vote
app.post('/api/vote', (req, res) => {
  const { party_id } = req.body;

  if (!req.session.userId) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }

  // Check if user already voted
  db.get(
    `SELECT has_voted FROM users WHERE id = ?`,
    [req.session.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
      }

      if (user.has_voted) {
        return res.status(400).json({ error: 'คุณได้ลงคะแนนแล้ว' });
      }

      // Record vote
      db.run(
        `INSERT INTO votes (user_id, party_id) VALUES (?, ?)`,
        [req.session.userId, party_id],
        (err) => {
          if (err) {
            return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
          }

          // Update user's voted status
          db.run(
            `UPDATE users SET has_voted = 1 WHERE id = ?`,
            [req.session.userId],
            (err) => {
              if (err) {
                return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
              }

              req.session.hasVoted = 1;

              // Update party vote count
              db.run(
                `UPDATE parties SET vote_count = vote_count + 1 WHERE id = ?`,
                [party_id]
              );

              // Broadcast results to all connected clients
              broadcastResults();

              res.json({ success: true, message: 'ลงคะแนนสำเร็จ' });
            }
          );
        }
      );
    }
  );
});

// Get current results
app.get('/api/results', (req, res) => {
  db.all(
    `SELECT id, name, vote_count FROM parties ORDER BY vote_count DESC, name`,
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
      }
      res.json({ results });
    }
  );
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
    }
    res.json({ success: true, message: 'ออกจากระบบสำเร็จ' });
  });
});

// WebSocket for real-time results
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Broadcast results to all connected clients
const broadcastResults = () => {
  db.all(
    `SELECT id, name, vote_count FROM parties ORDER BY vote_count DESC, name`,
    (err, results) => {
      if (!err) {
        io.emit('results-update', { results });
      }
    }
  );
};

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
