const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth } = require('../auth');

// Multer storage configs
const backgroundsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/backgrounds');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = `bg-${Date.now()}-${Math.round(Math.random() * 1E4)}${ext}`;
    cb(null, cleanName);
  }
});

const iconsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/icons');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = `icon-${Date.now()}-${Math.round(Math.random() * 1E4)}${ext}`;
    cb(null, cleanName);
  }
});

const logosStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/logos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = `logo-${Date.now()}${ext}`;
    cb(null, cleanName);
  }
});

const uploadBg = multer({
  storage: backgroundsStorage,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB
});

const uploadIcon = multer({
  storage: iconsStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadLogo = multer({
  storage: logosStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// All endpoints in this router require authentication
router.use(requireAuth);

// -------------------------------------------------------------
// 1. STATS / OVERVIEW
// -------------------------------------------------------------
router.get('/overview', async (req, res) => {
  try {
    const links = await db.getLinks(false);
    const backgrounds = await db.getBackgrounds(false);
    const settings = await db.getSettings();

    res.json({
      success: true,
      data: {
        totalLinks: links.length,
        activeLinks: links.filter(l => l.is_active).length,
        totalBackgrounds: backgrounds.length,
        activeBackgrounds: backgrounds.filter(b => b.is_active).length,
        dbType: db.getDbType(),
        settings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 2. SETTINGS
// -------------------------------------------------------------
router.get('/settings', async (req, res) => {
  try {
    const settings = await db.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const allowedKeys = [
      'title', 'subtitle', 'email', 'logoPath', 'logoFallback',
      'logoAlt', 'slideshowDelay', 'bannerEnabled', 'bannerText',
      'bannerLink', 'bannerColor', 'accentColor'
    ];

    for (const key of allowedKeys) {
      if (req.body[key] !== undefined) {
        await db.updateSetting(key, req.body[key]);
      }
    }

    const updated = await db.getSettings();
    res.json({ success: true, data: updated, message: "Paramètres enregistrés avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/upload/logo', uploadLogo.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Aucun fichier reçu." });
    }
    const relativeUrl = `uploads/logos/${req.file.filename}`;
    await db.updateSetting('logoPath', relativeUrl);
    res.json({ success: true, url: relativeUrl, message: "Logo mis à jour avec succès !" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 3. LIENS (CRUD, Réorganisation, Statut)
// -------------------------------------------------------------
router.get('/links', async (req, res) => {
  try {
    const links = await db.getLinks(false);
    res.json({ success: true, data: links });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/links', async (req, res) => {
  try {
    const newLink = await db.createLink(req.body);
    res.json({ success: true, data: newLink, message: "Lien ajouté avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/links/:id', async (req, res) => {
  try {
    const updated = await db.updateLink(req.params.id, req.body);
    res.json({ success: true, data: updated, message: "Lien mis à jour avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/links/:id', async (req, res) => {
  try {
    await db.deleteLink(req.params.id);
    res.json({ success: true, message: "Lien supprimé avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/links/reorder', async (req, res) => {
  try {
    const { items } = req.body; // [{ id: 1, sort_order: 1 }, ...]
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: "Format invalide." });
    }
    await db.reorderLinks(items);
    res.json({ success: true, message: "Ordre des liens enregistré." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/upload/icon', uploadIcon.single('icon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "Aucun fichier reçu." });
    }
    const relativeUrl = `uploads/icons/${req.file.filename}`;
    res.json({ success: true, url: relativeUrl, message: "Icône téléversée avec succès !" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 4. ARRIÈRE-PLANS & DIAPORAMA
// -------------------------------------------------------------
router.get('/backgrounds', async (req, res) => {
  try {
    const bgs = await db.getBackgrounds(false);
    res.json({ success: true, data: bgs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/backgrounds/upload', uploadBg.array('photos', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "Aucune photo reçue." });
    }

    const inserted = [];
    for (const file of req.files) {
      const url = `uploads/backgrounds/${file.filename}`;
      const record = await db.addBackground(url, file.originalname);
      inserted.push(record);
    }

    res.json({ success: true, data: inserted, message: `${inserted.length} image(s) ajoutée(s) au diaporama !` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/backgrounds/:id', async (req, res) => {
  try {
    await db.deleteBackground(req.params.id);
    res.json({ success: true, message: "Photo retirée du diaporama." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/backgrounds/:id/toggle', async (req, res) => {
  try {
    const { is_active } = req.body;
    await db.toggleBackground(req.params.id, Boolean(is_active));
    res.json({ success: true, message: "Statut de la photo mis à jour." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/backgrounds/reorder', async (req, res) => {
  try {
    const { items } = req.body; // [{ id: 1, sort_order: 1 }, ...]
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, error: "Format invalide." });
    }
    await db.reorderBackgrounds(items);
    res.json({ success: true, message: "Ordre du diaporama enregistré." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. MOT DE PASSE ADMIN
// -------------------------------------------------------------
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: "Veuillez fournir l'ancien et le nouveau mot de passe." });
    }

    const user = await db.getUserByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ success: false, error: "Utilisateur non trouvé." });
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(400).json({ success: false, error: "Mot de passe actuel incorrect." });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await db.updateUserPassword(req.user.username, newHash);

    res.json({ success: true, message: "Mot de passe modifié avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
