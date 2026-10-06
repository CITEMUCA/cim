/**
 * =================================================================
 * CONFIGURATION CITÉ DE L'INNOVATION MARRAKECH (CIM)
 * Base de données des liens officiels de cimmarrakech.taplink.ws
 * =================================================================
 */

const SITE_CONFIG = {
  title: "Cité de l’Innovation Marrakech",
  subtitle: "Université Cadi Ayyad — Marrakech",
  
  // Logos
  logoPath: "assets/logo-clean.png",
  logoFallback: "assets/logo.png",
  logoAlt: "Cité de l'Innovation Marrakech Logo",

  // Email & Contact
  email: "communication.cim@uca.ac.ma",

  // Diaporama automatique de fond
  slideshowDelay: 4000,
  backgrounds: [
    "assets/backgrounds/cite-innovation.png",
    "assets/backgrounds/photo1.jpg",
    "assets/backgrounds/photo2.jpg",
    "assets/backgrounds/photo3.jpg",
    "assets/backgrounds/photo4.jpg",
    "assets/backgrounds/photo5.jpg",
    "assets/backgrounds/photo6.jpg",
    "assets/backgrounds/photo7.jpg",
    "assets/backgrounds/photo8.jpg",
    "assets/backgrounds/photo9.jpg",
    "assets/backgrounds/photo10.jpg",
    "assets/backgrounds/photo11.jpg",
    "assets/backgrounds/photo12.jpg"
  ],

  // =================================================================
  // LIENS OFFICIELS (cimmarrakech.taplink.ws)
  // =================================================================
  links: [
    {
      id: "msic-2026",
      title: "Moroccan Sahara Innovation Challenge 2026",
      subtitle: "Lien d’inscription officiel",
      url: "https://msic.uca.ma",
      icon: "fa-solid fa-trophy",
      color: "#e11d48",
      featured: true
    },
    {
      id: "site-officiel",
      title: "Cité de l’Innovation - Marrakech",
      subtitle: "Site web officiel (cim.uca.ma)",
      url: "https://cim.uca.ma/",
      icon: "fa-solid fa-globe",
      color: "#0f766e"
    },
    {
      id: "instagram",
      title: "Cité de l’Innovation - Marrakech",
      subtitle: "Follow us sur Instagram (@cim_marrakech)",
      url: "https://www.instagram.com/cim_marrakech?igsh=YzlsNW1vOXk1NGF1&utm_source=qr",
      icon: "fa-brands fa-instagram",
      color: "#e1306c"
    },
    {
      id: "facebook",
      title: "Cité de l’Innovation - Marrakech",
      subtitle: "Follow us sur Facebook",
      url: "https://www.facebook.com/share/1EQQCPmehW/?mibextid=wwXIfr",
      icon: "fa-brands fa-facebook-f",
      color: "#1877f2"
    },
    {
      id: "linkedin",
      title: "Cité de l’Innovation - Marrakech",
      subtitle: "Follow us sur LinkedIn",
      url: "https://www.linkedin.com/company/88428898/admin/page-posts/published/",
      icon: "fa-brands fa-linkedin-in",
      color: "#0a66c2"
    },
    {
      id: "tiktok",
      title: "Cité de l’Innovation Marrakech",
      subtitle: "Follow us sur TikTok",
      url: "https://www.tiktok.com/@commulpu4qu?_r=1&_t=ZS-92fsVcGWjDw",
      icon: "fa-brands fa-tiktok",
      color: "#000000"
    },
    {
      id: "whatsapp",
      title: "Cité de l’Innovation Marrakech",
      subtitle: "Rejoignez notre chaîne WhatsApp",
      url: "https://whatsapp.com/channel/0029VbC7Jjj0G0XlKAilNY29",
      icon: "fa-brands fa-whatsapp",
      color: "#25d366"
    },
    {
      id: "feedback",
      title: "Visitor Feedback Form",
      subtitle: "Formulaire d'avis et retour d'expérience",
      url: "https://forms.gle/Ay7J4Q2irr2HdafJ6",
      icon: "fa-solid fa-clipboard-check",
      color: "#f59e0b"
    },
    {
      id: "email",
      title: "Contact us",
      subtitle: "communication.cim@uca.ac.ma",
      url: "mailto:communication.cim@uca.ac.ma",
      icon: "fa-solid fa-envelope",
      color: "#3b82f6"
    }
  ]
};

window.SITE_CONFIG = SITE_CONFIG;
