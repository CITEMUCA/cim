const express = require('express');
const router = express.Router();
const db = require('../db');

// Public API - returns configuration consumed by the public portal
router.get('/config', async (req, res) => {
  try {
    const settings = await db.getSettings();
    const links = await db.getLinks(true); // only active links
    const backgrounds = await db.getBackgrounds(true); // only active backgrounds

    res.json({
      success: true,
      data: {
        title: settings.title || "Cité de l’Innovation Marrakech",
        subtitle: settings.subtitle || "Université Cadi Ayyad — Marrakech",
        email: settings.email || "communication.cim@uca.ac.ma",
        logoPath: settings.logoPath || "assets/logo_cim-removebg-preview-1.png",
        logoFallback: settings.logoFallback || "assets/logo-clean.png",
        logoAlt: settings.logoAlt || "Cité de l'Innovation Marrakech Logo",
        slideshowDelay: parseInt(settings.slideshowDelay || 4000, 10),
        accentColor: settings.accentColor || "#0284c7",
        banner: {
          enabled: settings.bannerEnabled === 'true' || settings.bannerEnabled === true,
          text: settings.bannerText || "",
          link: settings.bannerLink || "",
          color: settings.bannerColor || "#e11d48"
        },
        backgrounds: backgrounds.map(b => b.url),
        links: links.map(l => ({
          id: l.link_id,
          title: l.title,
          subtitle: l.subtitle,
          url: l.url,
          icon: l.icon,
          iconType: l.icon_type,
          customIconUrl: l.custom_icon_url,
          color: l.color,
          featured: l.featured,
          badge: l.badge_text,
          badgeColor: l.badge_color
        }))
      }
    });
  } catch (err) {
    console.error("Erreur API /config :", err);
    res.status(500).json({ success: false, error: "Erreur serveur lors de la récupération de la configuration." });
  }
});

module.exports = router;
