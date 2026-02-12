const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
// also accept form-encoded bodies (some clients / forms send this)
app.use(express.urlencoded({ extended: true }));

const AUTH_SECRET = process.env.AUTH_SECRET || 'dev_secret_should_be_changed';

// Persistent user store: try lowdb (pure-JS) and fall back to users.json
let useLowdb = false;
let lowdb; let db; let usersFilePath;
try {
  lowdb = require('lowdb');
  const FileSync = require('lowdb/adapters/FileSync');
  usersFilePath = 'db.json';
  const adapter = new FileSync(usersFilePath);
  db = lowdb(adapter);
  db.defaults({ users: [] }).write();
  // if a legacy users.json exists, import it into lowdb so users survive restarts
  try {
    const fs = require('fs');
    const path = require('path');
    const legacy = path.join(__dirname, 'users.json');
    if (fs.existsSync(legacy)) {
      const data = JSON.parse(fs.readFileSync(legacy, 'utf8') || '[]');
      let imported = 0;
      data.forEach(u => {
        if (!db.get('users').find({ email: u.email }).value()) {
          db.get('users').push(u).write();
          imported++;
        }
      });
      if (imported) {
        try { fs.renameSync(legacy, legacy + '.imported'); } catch (e) { /* ignore */ }
        console.log(`Imported ${imported} users from users.json into db.json`);
      }
    }
  } catch (e) {
    console.error('Failed to import legacy users.json', e);
  }
  useLowdb = true;
  console.log('Using lowdb persistence (db.json)');
} catch (err) {
  // fallback to file-backed JSON
  const fs = require('fs');
  const path = require('path');
  usersFilePath = path.join(__dirname, 'users.json');
  console.log('lowdb not available, falling back to users.json');

  function loadUsers() {
    try {
      if (!fs.existsSync(usersFilePath)) return [];
      const txt = fs.readFileSync(usersFilePath, 'utf8');
      return JSON.parse(txt || '[]');
    } catch (err) {
      console.error('Failed to load users.json', err);
      return [];
    }
  }

  function saveUsers(users) {
    try {
      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save users.json', err);
    }
  }

  global.__loadUsers = loadUsers;
  global.__saveUsers = saveUsers;
}

function findUserByEmail(email) {
  if (!email) return null;
  const key = (email || '').toLowerCase();
  if (useLowdb) return db.get('users').find({ email: key }).value();
  const users = global.__loadUsers();
  return users.find(u => u.email === key) || null;
}

function createUser(name, email, passwordHash) {
  const key = (email || '').toLowerCase();
  if (useLowdb) {
    const ids = db.get('users').map('id').value();
    const id = (ids.length ? Math.max(...ids) : 0) + 1;
    const user = { id, name: name || '', email: key, passwordHash };
    db.get('users').push(user).write();
    return { id: user.id, name: user.name, email: user.email, passwordHash: user.passwordHash };
  }
  const users = global.__loadUsers();
  const id = (users.reduce((m, u) => Math.max(m, u.id || 0), 0) || 0) + 1;
  const user = { id, name: name || '', email: key, passwordHash };
  users.push(user);
  global.__saveUsers(users);
  return { id: user.id, name: user.name, email: user.email, passwordHash: user.passwordHash };
}

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, AUTH_SECRET, { expiresIn: '2h' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, AUTH_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'invalid token' });
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  return res.status(403).json({ error: 'Registration is disabled. Only administrators can access this system.' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    console.warn('Login: missing email/password', { path: req.path, body: req.body });
    return res.status(400).json({ error: 'email and password required' });
  }
  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = createToken(user);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const u = findUserByEmail((req.user.email || '').toLowerCase());
  if (!u) return res.status(404).json({ error: 'user not found' });
  res.json({ id: u.id, name: u.name, email: u.email });
});

// VirusTotal proxy endpoint (requires VT_API_KEY in env)
const VT_API_KEY = process.env.VT_API_KEY || '';
if (!VT_API_KEY) {
  console.warn('VT_API_KEY not set — VirusTotal endpoints will return errors until you set it in the environment');
}

async function doFetch(url, opts) {
  // dynamic import to support node-fetch v3 in CommonJS
  const fetchModule = await import('node-fetch');
  const fetch = fetchModule.default || fetchModule;
  return fetch(url, opts);
}

app.post('/api/vt/lookup', async (req, res) => {
  const { type, resource } = req.body || {};
  if (!type || !resource) return res.status(400).json({ error: 'type and resource required' });
  if (!VT_API_KEY) return res.status(500).json({ error: 'VT_API_KEY not configured on server' });

  try {
    if (type === 'url') {
      // submit URL for analysis
      const params = new URLSearchParams();
      params.append('url', resource);
      const resp = await doFetch('https://www.virustotal.com/api/v3/urls', {
        method: 'POST',
        headers: { 'x-apikey': VT_API_KEY, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await resp.json();
      return res.json({ type, data });
    }

    let url;
    if (type === 'domain') url = `https://www.virustotal.com/api/v3/domains/${encodeURIComponent(resource)}`;
    else if (type === 'ip') url = `https://www.virustotal.com/api/v3/ip_addresses/${encodeURIComponent(resource)}`;
    else if (type === 'file') url = `https://www.virustotal.com/api/v3/files/${encodeURIComponent(resource)}`;
    else return res.status(400).json({ error: 'unsupported type' });

    const resp = await doFetch(url, { method: 'GET', headers: { 'x-apikey': VT_API_KEY } });
    const data = await resp.json();
    res.json({ type, data });
  } catch (err) {
    console.error('VT lookup error', err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(port, () => console.log(`Auth server listening on ${port}`));
