const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const db = require('./db');
const { generateToken, verifyToken } = require('./auth');
const publicApiRoutes = require('./routes/api');
const adminApiRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Identifiant et mot de passe requis." });
    }

    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ success: false, error: "Identifiants invalides." });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: "Identifiants invalides." });
    }

    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie('cim_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Erreur serveur lors de la connexion." });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('cim_token');
  res.json({ success: true, message: "Déconnexion réussie." });
});

app.get('/api/auth/me', (req, res) => {
  let token = req.cookies?.cim_token;
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') token = parts[1];
  }

  if (!token) {
    return res.json({ authenticated: false });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return res.json({ authenticated: false });
  }

  res.json({ authenticated: true, user: payload });
});

// Mount Routes
app.use('/api/public', publicApiRoutes);
app.use('/api/admin', adminApiRoutes);

// Admin SPA routing helper:
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/login.html'));
});

// Start Server
async function start() {
  try {
    await db.initDb();
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Serveur CIM Marrakech démarré sur http://localhost:${PORT}`);
      console.log(`🌐 Portail Public     : http://localhost:${PORT}`);
      console.log(`🔐 Espace Admin        : http://localhost:${PORT}/admin`);
      console.log(`💾 Base de données    : Mode ${db.getDbType().toUpperCase()}`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error("❌ Échec critique du démarrage :", err);
    process.exit(1);
  }
}

start();
