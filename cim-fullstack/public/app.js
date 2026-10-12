/**
 * =================================================================
 * CITÉ DE L'INNOVATION MARRAKECH — DYNAMIC SLIDESHOW & LINKTREE APP
 * Design 100% identique au site officiel, alimenté par l'API
 * =================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const linkList = document.getElementById("linkList");
  const siteTitle = document.getElementById("siteTitle");
  const siteSubtitle = document.getElementById("siteSubtitle");
  const siteLogo = document.getElementById("siteLogo");
  const pageTitle = document.getElementById("pageTitle");
  const bgContainer = document.getElementById("bgSlideshowContainer");
  const bannerEl = document.getElementById("announcementBanner");

  let currentBgIndex = 0;
  let bgSlides = [];
  let slideshowInterval = null;

  // Charge la configuration depuis l'API REST
  fetchConfig();

  async function fetchConfig() {
    try {
      const response = await fetch('/api/public/config');
      if (!response.ok) throw new Error("Erreur de récupération de la configuration");
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      applyConfig(result.data);
    } catch (err) {
      console.error("Erreur API :", err);
    }
  }

  function applyConfig(config) {
    // 1. Titres & Marque
    if (siteTitle && config.title) siteTitle.textContent = config.title;
    if (siteSubtitle && config.subtitle) siteSubtitle.textContent = config.subtitle;
    if (pageTitle && config.title) pageTitle.textContent = `${config.title} — ${config.subtitle || 'Université Cadi Ayyad'}`;

    // 2. Logo
    if (siteLogo) {
      siteLogo.src = config.logoPath || "assets/logo_cim-removebg-preview-1.png";
      siteLogo.alt = config.logoAlt || "Logo Cité de l'Innovation Marrakech";
      siteLogo.onerror = () => {
        if (config.logoFallback) siteLogo.src = config.logoFallback;
      };
    }

    // 3. Bandeau d'annonce
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

    // 4. Liens pilules (Rendu 100% identique au design d'origine)
    renderLinks(config.links || []);

    // 5. Diaporama d'arrière-plan
    initSlideshow(config.backgrounds || [], config.slideshowDelay || 4000);
  }

  // Rendu des boutons pilules
  function renderLinks(links) {
    if (!linkList) return;

    linkList.innerHTML = links.map(link => {
      const isFeatured = link.featured ? 'featured' : '';
      const badgeText = link.badge || (link.featured ? 'Hackathon 2026' : '');
      const badgeColor = link.badgeColor || link.color || '#e11d48';
      const badgeHtml = badgeText ? `<span class="featured-badge" style="background-color: ${badgeColor}">${escapeHtml(badgeText)}</span>` : '';
      const customColor = link.color || '#0f766e';

      // Icône : FontAwesome ou image personnalisée uploadée
      let iconInner = '';
      if (link.iconType === 'custom' && link.customIconUrl) {
        iconInner = `<img src="/${link.customIconUrl}" alt="" style="width: 24px; height: 24px; object-fit: contain;" />`;
      } else {
        iconInner = `<i class="${link.icon || 'fa-solid fa-link'}"></i>`;
      }

      return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-pill ${isFeatured}">
          ${badgeHtml}
          <div class="pill-icon" style="border-color: ${customColor}; color: ${customColor}; --hover-color: ${customColor};">
            ${iconInner}
          </div>
          <div class="pill-content">
            <span class="pill-title">${escapeHtml(link.title)}</span>
            ${link.subtitle ? `<span class="pill-subtitle">${escapeHtml(link.subtitle)}</span>` : ''}
          </div>
        </a>
      `;
    }).join('');
  }

  // Moteur automatique de diaporama (Fonctionnement identique au fichier d'origine)
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
