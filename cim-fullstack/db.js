const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let dbType = 'postgres'; // 'postgres' or 'sqlite'
let pgPool = null;
let sqliteDb = null;

// Initial seed data from CIM config
const INITIAL_SETTINGS = {
  title: "Cité de l’Innovation Marrakech",
  subtitle: "Université Cadi Ayyad — Marrakech",
  email: "communication.cim@uca.ac.ma",
  logoPath: "assets/logo_cim-removebg-preview-1.png",
  logoFallback: "assets/logo-clean.png",
  logoAlt: "Cité de l'Innovation Marrakech Logo",
  slideshowDelay: "4000",
  bannerEnabled: "true",
  bannerText: "🚀 Inscriptions ouvertes : Moroccan Sahara Innovation Challenge 2026 !",
  bannerLink: "https://msic.uca.ma",
  bannerColor: "#e11d48",
  accentColor: "#0284c7"
};

const INITIAL_LINKS = [
  {
    link_id: "msic-2026",
    title: "Moroccan Sahara Innovation Challenge 2026",
    subtitle: "Lien d’inscription officiel au Hackathon",
    url: "https://msic.uca.ma",
    icon: "fa-solid fa-trophy",
    icon_type: "fontawesome",
    color: "#e11d48",
    featured: true,
    badge_text: "Hackathon 2026",
    badge_color: "#e11d48",
    sort_order: 1,
    is_active: true
  },
  {
    link_id: "msic-coachs",
    title: "Inscription des Coachs & Mentors",
    subtitle: "Moroccan Sahara Innovation Challenge 2026",
    url: "https://www.uca.ma/forms/moroccan-sahara-innovation-challenge-2026/coachs",
    icon: "fa-solid fa-chalkboard-user",
    icon_type: "fontawesome",
    color: "#0284c7",
    featured: true,
    badge_text: "Coachs & Mentors",
    badge_color: "#0284c7",
    sort_order: 2,
    is_active: true
  },
  {
    link_id: "site-officiel",
    title: "Site Web Officiel",
    subtitle: "cim.uca.ma",
    url: "https://cim.uca.ma/",
    icon: "fa-solid fa-globe",
    icon_type: "fontawesome",
    color: "#0f766e",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 3,
    is_active: true
  },
  {
    link_id: "instagram-cim",
    title: "Instagram — CIM Marrakech",
    subtitle: "Compte officiel Cité de l'Innovation (@cim_marrakech)",
    url: "https://www.instagram.com/cim_marrakech?igsh=YzlsNW1vOXk1NGF1&utm_source=qr",
    icon: "fa-brands fa-instagram",
    icon_type: "fontawesome",
    color: "#e1306c",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 4,
    is_active: true
  },
  {
    link_id: "facebook",
    title: "Facebook",
    subtitle: "Rejoignez notre page Facebook",
    url: "https://www.facebook.com/share/1EQQCPmehW/?mibextid=wwXIfr",
    icon: "fa-brands fa-facebook-f",
    icon_type: "fontawesome",
    color: "#1877f2",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 5,
    is_active: true
  },
  {
    link_id: "linkedin",
    title: "LinkedIn",
    subtitle: "Suivez notre page LinkedIn",
    url: "https://www.linkedin.com/company/88428898/admin/page-posts/published/",
    icon: "fa-brands fa-linkedin-in",
    icon_type: "fontawesome",
    color: "#0a66c2",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 6,
    is_active: true
  },
  {
    link_id: "tiktok",
    title: "TikTok",
    subtitle: "Suivez notre compte TikTok",
    url: "https://www.tiktok.com/@commulpu4qu?_r=1&_t=ZS-92fsVcGWjDw",
    icon: "fa-brands fa-tiktok",
    icon_type: "fontawesome",
    color: "#000000",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 7,
    is_active: true
  },
  {
    link_id: "whatsapp",
    title: "Chaîne WhatsApp",
    subtitle: "Rejoignez notre canal officiel WhatsApp",
    url: "https://whatsapp.com/channel/0029VbC7Jjj0G0XlKAilNY29",
    icon: "fa-brands fa-whatsapp",
    icon_type: "fontawesome",
    color: "#25d366",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 8,
    is_active: true
  },
  {
    link_id: "instagram-uca-innov",
    title: "Instagram — Club UCA INNOV",
    subtitle: "Compte officiel du Club (@uca.innov)",
    url: "https://www.instagram.com/uca.innov/",
    icon: "fa-brands fa-instagram",
    icon_type: "fontawesome",
    color: "#c13584",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 9,
    is_active: true
  },
  {
    link_id: "feedback",
    title: "Formulaire d'avis visiteurs",
    subtitle: "Votre retour d'expérience",
    url: "https://forms.gle/Ay7J4Q2irr2HdafJ6",
    icon: "fa-solid fa-clipboard-check",
    icon_type: "fontawesome",
    color: "#f59e0b",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 10,
    is_active: true
  },
  {
    link_id: "email",
    title: "Contactez-nous par e-mail",
    subtitle: "communication.cim@uca.ac.ma",
    url: "mailto:communication.cim@uca.ac.ma",
    icon: "fa-solid fa-envelope",
    icon_type: "fontawesome",
    color: "#3b82f6",
    featured: false,
    badge_text: "",
    badge_color: "",
    sort_order: 11,
    is_active: true
  }
];

// Helper to execute query across either Postgres or SQLite
async function query(sql, params = []) {
  if (dbType === 'postgres') {
    // Convert ? to $1, $2, ... for postgres compatibility if needed
    let pgSql = sql;
    let paramIndex = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${paramIndex++}`);
    }
    const res = await pgPool.query(pgSql, params);
    return res.rows;
  } else {
    // SQLite mode
    let sqliteSql = sql;
    // Replace $1, $2 with ? for SQLite
    sqliteSql = sqliteSql.replace(/\$\d+/g, '?');
    return new Promise((resolve, reject) => {
      const isSelect = /^\s*(SELECT|PRAGMA)/i.test(sqliteSql);
      if (isSelect) {
        sqliteDb.all(sqliteSql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      } else {
        sqliteDb.run(sqliteSql, params, function (err) {
          if (err) reject(err);
          else resolve([{ id: this.lastID, changes: this.changes }]);
        });
      }
    });
  }
}

// Ensure PostgreSQL database exists or try connecting
async function tryConnectPostgres() {
  const user = process.env.PG_USER || 'postgres';
  const password = process.env.PG_PASSWORD || 'postgres';
  const host = process.env.PG_HOST || 'localhost';
  const port = process.env.PG_PORT || 5432;
  const database = process.env.PG_DATABASE || 'cim_db';

  try {
    // 1. Try connecting to default postgres DB first to create cim_db if missing
    const rootPool = new Pool({
      user,
      password,
      host,
      port,
      database: 'postgres',
      connectionTimeoutMillis: 3000
    });
    
    try {
      const client = await rootPool.connect();
      const dbCheck = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [database]);
      if (dbCheck.rowCount === 0) {
        console.log(`[PostgreSQL] Création de la base de données '${database}'...`);
        await client.query(`CREATE DATABASE ${database}`);
      }
      client.release();
      await rootPool.end();
    } catch (createErr) {
      // If we couldn't create or connect to 'postgres', ignore and try direct connection
      await rootPool.end().catch(() => {});
    }

    // 2. Connect to the target DB
    const pool = new Pool({
      user,
      password,
      host,
      port,
      database,
      connectionTimeoutMillis: 3000
    });

    const client = await pool.connect();
    client.release();
    pgPool = pool;
    dbType = 'postgres';
    console.log(`✅ [PostgreSQL] Connecté avec succès à '${database}' sur ${host}:${port}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ [PostgreSQL] Connexion impossible (${err.message}). Utilisation du mode SQLite local avec synchronisation automatique.`);
    return false;
  }
}

// SQLite fallback initialization
async function initSqlite() {
  dbType = 'sqlite';
  const dbPath = path.join(__dirname, 'cim_data.sqlite');
  return new Promise((resolve, reject) => {
    sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Erreur ouverture SQLite :", err);
        reject(err);
      } else {
        console.log(`✅ [SQLite] Connecté à la base locale '${dbPath}'`);
        resolve(true);
      }
    });
  });
}

// Initialize tables and default seed data
async function initDb() {
  const pgConnected = await tryConnectPostgres();
  if (!pgConnected) {
    await initSqlite();
  }

  // Schema creation
  if (dbType === 'postgres') {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS links (
        id SERIAL PRIMARY KEY,
        link_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        subtitle TEXT,
        url TEXT NOT NULL,
        icon VARCHAR(100),
        icon_type VARCHAR(50) DEFAULT 'fontawesome',
        custom_icon_url TEXT,
        color VARCHAR(50) DEFAULT '#0284c7',
        featured BOOLEAN DEFAULT false,
        badge_text VARCHAR(100),
        badge_color VARCHAR(50),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS backgrounds (
        id SERIAL PRIMARY KEY,
        url TEXT NOT NULL,
        filename VARCHAR(255),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'admin'
      );
    `);
  } else {
    // SQLite schema
    await query(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        link_id TEXT,
        title TEXT NOT NULL,
        subtitle TEXT,
        url TEXT NOT NULL,
        icon TEXT,
        icon_type TEXT DEFAULT 'fontawesome',
        custom_icon_url TEXT,
        color TEXT DEFAULT '#0284c7',
        featured INTEGER DEFAULT 0,
        badge_text TEXT,
        badge_color TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS backgrounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        filename TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin'
      );
    `);
  }

  // Seed default settings
  for (const [key, value] of Object.entries(INITIAL_SETTINGS)) {
    const existing = await query("SELECT value FROM settings WHERE key = ?", [key]);
    if (existing.length === 0) {
      await query("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
    }
  }

  // Seed default links if empty
  const existingLinks = await query("SELECT count(*) as count FROM links");
  const countLinks = parseInt(existingLinks[0].count || 0, 10);
  if (countLinks === 0) {
    console.log("🌱 Insertion des liens initiaux de la Cité de l'Innovation...");
    for (const link of INITIAL_LINKS) {
      await query(`
        INSERT INTO links (link_id, title, subtitle, url, icon, icon_type, color, featured, badge_text, badge_color, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        link.link_id, link.title, link.subtitle, link.url, link.icon, link.icon_type,
        link.color, link.featured ? 1 : 0, link.badge_text, link.badge_color, link.sort_order, link.is_active ? 1 : 0
      ]);
    }
  }

  // Seed default 29 backgrounds if empty
  const existingBg = await query("SELECT count(*) as count FROM backgrounds");
  const countBg = parseInt(existingBg[0].count || 0, 10);
  if (countBg === 0) {
    console.log("🌱 Insertion des 29 photos de diaporama initiales...");
    for (let i = 1; i <= 29; i++) {
      const url = `assets/backgrounds/photo${i}.jpg`;
      await query(`
        INSERT INTO backgrounds (url, filename, sort_order, is_active)
        VALUES (?, ?, ?, 1)
      `, [url, `photo${i}.jpg`, i]);
    }
  }

  // Seed default admin user
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const existingUser = await query("SELECT * FROM users WHERE username = ?", [adminUser]);
  if (existingUser.length === 0) {
    const hash = await bcrypt.hash(adminPass, 10);
    await query("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')", [adminUser, hash]);
    console.log(`👤 Compte administrateur initial créé : '${adminUser}' (mot de passe: '${adminPass}')`);
  }
}

// Helpers for settings
async function getSettings() {
  const rows = await query("SELECT key, value FROM settings");
  const map = {};
  for (const r of rows) {
    map[r.key] = r.value;
  }
  return map;
}

async function updateSetting(key, value) {
  const existing = await query("SELECT key FROM settings WHERE key = ?", [key]);
  if (existing.length > 0) {
    await query("UPDATE settings SET value = ? WHERE key = ?", [String(value), key]);
  } else {
    await query("INSERT INTO settings (key, value) VALUES (?, ?)", [key, String(value)]);
  }
}

// Helpers for links
async function getLinks(onlyActive = false) {
  let sql = "SELECT * FROM links";
  if (onlyActive) {
    sql += " WHERE is_active = 1 OR is_active = true";
  }
  sql += " ORDER BY sort_order ASC, id ASC";
  const rows = await query(sql);
  return rows.map(r => ({
    ...r,
    featured: Boolean(r.featured == 1 || r.featured === true || r.featured === 'true'),
    is_active: Boolean(r.is_active == 1 || r.is_active === true || r.is_active === 'true')
  }));
}

async function createLink(data) {
  const orderRes = await query("SELECT MAX(sort_order) as max_order FROM links");
  const nextOrder = (orderRes[0]?.max_order || 0) + 1;
  const isFeatured = data.featured ? 1 : 0;
  const isActive = (data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1);

  if (dbType === 'postgres') {
    const res = await pgPool.query(`
      INSERT INTO links (link_id, title, subtitle, url, icon, icon_type, custom_icon_url, color, featured, badge_text, badge_color, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      data.link_id || `link-${Date.now()}`,
      data.title || "Nouveau Lien",
      data.subtitle || "",
      data.url || "#",
      data.icon || "fa-solid fa-link",
      data.icon_type || "fontawesome",
      data.custom_icon_url || null,
      data.color || "#0284c7",
      isFeatured,
      data.badge_text || null,
      data.badge_color || null,
      nextOrder,
      isActive
    ]);
    return res.rows[0];
  } else {
    const res = await query(`
      INSERT INTO links (link_id, title, subtitle, url, icon, icon_type, custom_icon_url, color, featured, badge_text, badge_color, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.link_id || `link-${Date.now()}`,
      data.title || "Nouveau Lien",
      data.subtitle || "",
      data.url || "#",
      data.icon || "fa-solid fa-link",
      data.icon_type || "fontawesome",
      data.custom_icon_url || null,
      data.color || "#0284c7",
      isFeatured,
      data.badge_text || null,
      data.badge_color || null,
      nextOrder,
      isActive
    ]);
    const inserted = await query("SELECT * FROM links WHERE id = ?", [res[0].id]);
    return inserted[0];
  }
}

async function updateLink(id, data) {
  const isFeatured = data.featured ? 1 : 0;
  const isActive = (data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1);

  await query(`
    UPDATE links
    SET title = ?, subtitle = ?, url = ?, icon = ?, icon_type = ?, custom_icon_url = ?, color = ?, featured = ?, badge_text = ?, badge_color = ?, is_active = ?
    WHERE id = ?
  `, [
    data.title,
    data.subtitle || "",
    data.url,
    data.icon || "fa-solid fa-link",
    data.icon_type || "fontawesome",
    data.custom_icon_url || null,
    data.color || "#0284c7",
    isFeatured,
    data.badge_text || null,
    data.badge_color || null,
    isActive,
    id
  ]);
  const rows = await query("SELECT * FROM links WHERE id = ?", [id]);
  return rows[0];
}

async function deleteLink(id) {
  await query("DELETE FROM links WHERE id = ?", [id]);
  return true;
}

async function reorderLinks(items) {
  // items: [{ id: 1, sort_order: 1 }, ...]
  for (const item of items) {
    await query("UPDATE links SET sort_order = ? WHERE id = ?", [item.sort_order, item.id]);
  }
  return true;
}

// Helpers for backgrounds
async function getBackgrounds(onlyActive = false) {
  let sql = "SELECT * FROM backgrounds";
  if (onlyActive) {
    sql += " WHERE is_active = 1 OR is_active = true";
  }
  sql += " ORDER BY sort_order ASC, id ASC";
  const rows = await query(sql);
  return rows.map(r => ({
    ...r,
    is_active: Boolean(r.is_active == 1 || r.is_active === true || r.is_active === 'true')
  }));
}

async function addBackground(url, filename) {
  const orderRes = await query("SELECT MAX(sort_order) as max_order FROM backgrounds");
  const nextOrder = (orderRes[0]?.max_order || 0) + 1;
  await query(`
    INSERT INTO backgrounds (url, filename, sort_order, is_active)
    VALUES (?, ?, ?, 1)
  `, [url, filename, nextOrder]);
  const rows = await query("SELECT * FROM backgrounds ORDER BY id DESC LIMIT 1");
  return rows[0];
}

async function deleteBackground(id) {
  await query("DELETE FROM backgrounds WHERE id = ?", [id]);
  return true;
}

async function toggleBackground(id, isActive) {
  const val = isActive ? 1 : 0;
  await query("UPDATE backgrounds SET is_active = ? WHERE id = ?", [val, id]);
  return true;
}

async function reorderBackgrounds(items) {
  for (const item of items) {
    await query("UPDATE backgrounds SET sort_order = ? WHERE id = ?", [item.sort_order, item.id]);
  }
  return true;
}

// User / Auth helpers
async function getUserByUsername(username) {
  const rows = await query("SELECT * FROM users WHERE username = ?", [username]);
  return rows[0] || null;
}

async function updateUserPassword(username, newHash) {
  await query("UPDATE users SET password_hash = ? WHERE username = ?", [newHash, username]);
  return true;
}

module.exports = {
  initDb,
  query,
  getDbType: () => dbType,
  getSettings,
  updateSetting,
  getLinks,
  createLink,
  updateLink,
  deleteLink,
  reorderLinks,
  getBackgrounds,
  addBackground,
  deleteBackground,
  toggleBackground,
  reorderBackgrounds,
  getUserByUsername,
  updateUserPassword
};
