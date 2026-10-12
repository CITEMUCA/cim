/**
 * CITÉ DE L'INNOVATION MARRAKECH — FRONTEND DYNAMIQUE
 * Connecté à l'API Node.js / PostgreSQL
 */

document.addEventListener("DOMContentLoaded", () => {
  const linkList = document.getElementById("linkList");
  const siteTitle = document.getElementById("siteTitle");
  const siteSubtitle = document.getElementById("siteSubtitle");
  const siteLogo = document.getElementById("siteLogo");
  const pageTitle = document.getElementById("pageTitle");
  const bgContainer = document.getElementById("bgSlideshowContainer");
  const bannerEl = document.getElementById("announcementBanner");

  let bgSlides = [];
  let currentBgIndex = 0;
  let slideshowInterval = null;

  // Load configuration from API
  fetchConfig();

  async function fetchConfig() {
    try {
      const response = await fetch('/api/public/config');
      if (!response.ok) throw new Error("Erreur de récupération de la configuration");
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      applyConfig(result.data);
    } catch (err) {
      console.error("Impossible de charger la configuration API :", err);
      // Fallback display
      if (linkList) {
        linkList.innerHTML = `<div style="color: white; text-align: center; padding: 2rem;">Chargement des informations en cours...</div>`;
      }
    }
  }

  function applyConfig(config) {
    // 1. Titles & Metadata
    if (siteTitle && config.title) siteTitle.textContent = config.title;
    if (siteSubtitle && config.subtitle) siteSubtitle.textContent = config.subtitle;
    if (pageTitle && config.title) pageTitle.textContent = `${config.title} — ${config.subtitle || 'Portail officiel'}`;

    // 2. Logo
    if (siteLogo && config.logoPath) {
      siteLogo.src = config.logoPath;
      siteLogo.alt = config.logoAlt || "Logo Cité de l'Innovation";
      siteLogo.onerror = () => {
        if (config.logoFallback) siteLogo.src = config.logoFallback;
      };
    }

    // 3. Announcement Banner
    if (bannerEl && config.banner) {
      if (config.banner.enabled && config.banner.text) {
        bannerEl.style.display = "flex";
        bannerEl.style.backgroundColor = config.banner.color || "#e11d48";
        let content = `<span>${escapeHtml(config.banner.text)}</span>`;
        if (config.banner.link) {
          content += ` <a href="${escapeHtml(config.banner.link)}" target="_blank" rel="noopener noreferrer">En savoir plus <i class="fa-solid fa-arrow-right"></i></a>`;
        }
        bannerEl.innerHTML = content;
      } else {
        bannerEl.style.display = "none";
      }
    }

    // 4. Accent color
    if (config.accentColor) {
      document.documentElement.style.setProperty('--primary-accent', config.accentColor);
    }

    // 5. Render Links
    renderLinks(config.links || []);

    // 6. Init Background Slideshow
    initSlideshow(config.backgrounds || [], config.slideshowDelay || 4000);
  }

  function renderLinks(links) {
    if (!linkList) return;
    linkList.innerHTML = "";

    if (links.length === 0) {
      linkList.innerHTML = `<p style="color: #94a3b8; text-align: center;">Aucun lien configuré pour le moment.</p>`;
      return;
    }

    links.forEach((link, idx) => {
      const a = document.createElement("a");
      a.className = `link-pill ${link.featured ? "featured" : ""}`;
      a.href = link.url;
      a.target = link.url.startsWith("mailto:") ? "_self" : "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", `${link.title}${link.subtitle ? " - " + link.subtitle : ""}`);

      // Icon display (Custom uploaded image or FontAwesome class)
      let iconHtml = "";
      if (link.iconType === "custom" && link.customIconUrl) {
        iconHtml = `<img src="${escapeHtml(link.customIconUrl)}" alt="" class="link-custom-icon" />`;
      } else {
        const iconClass = link.icon || "fa-solid fa-arrow-up-right-from-square";
        iconHtml = `<i class="${escapeHtml(iconClass)}" aria-hidden="true"></i>`;
      }

      // Badge display
      let badgeHtml = "";
      if (link.badge) {
        const badgeBg = link.badgeColor || link.color || "#e11d48";
        badgeHtml = `<span class="link-badge" style="background-color: ${badgeBg}">${escapeHtml(link.badge)}</span>`;
      }

      const cardColor = link.color || "#0284c7";

      a.innerHTML = `
        <div class="link-icon-box" style="background-color: ${cardColor}">
          ${iconHtml}
        </div>
        <div class="link-content">
          <div class="link-title">${escapeHtml(link.title)}</div>
          ${link.subtitle ? `<div class="link-subtitle">${escapeHtml(link.subtitle)}</div>` : ""}
        </div>
        ${badgeHtml}
        <i class="fa-solid fa-chevron-right link-arrow" aria-hidden="true"></i>
      `;

      linkList.appendChild(a);
    });
  }

  // Background Slideshow Engine
  function initSlideshow(backgrounds, delay) {
    if (!bgContainer || backgrounds.length === 0) return;

    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
    }

    bgContainer.innerHTML = "";
    bgSlides = [];
    currentBgIndex = 0;

    backgrounds.forEach((bgUrl, index) => {
      const slide = document.createElement("div");
      slide.className = `bg-slide ${index === 0 ? "active" : ""}`;
      slide.style.backgroundImage = `url('${bgUrl}')`;
      bgContainer.appendChild(slide);
      bgSlides.push(slide);
    });

    if (backgrounds.length > 1) {
      slideshowInterval = setInterval(nextBackground, delay);
    }
  }

  function nextBackground() {
    if (bgSlides.length === 0) return;
    bgSlides[currentBgIndex].classList.remove("active");
    currentBgIndex = (currentBgIndex + 1) % bgSlides.length;
    bgSlides[currentBgIndex].classList.add("active");
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
