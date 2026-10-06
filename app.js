/**
 * =================================================================
 * CITÉ DE L'INNOVATION MARRAKECH — AUTOMATIC SLIDESHOW & LINKTREE APP
 * =================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const config = window.SITE_CONFIG || {};

  let currentBgIndex = 0;
  let bgSlides = [];
  const backgrounds = config.backgrounds || [];
  const delay = config.slideshowDelay || 4000;

  // DOM Elements
  const bgContainer = document.getElementById("bgSlideshowContainer");
  const siteLogo = document.getElementById("siteLogo");
  const siteTitle = document.getElementById("siteTitle");
  const siteSubtitle = document.getElementById("siteSubtitle");
  const linkList = document.getElementById("linkList");

  function init() {
    renderBranding();
    renderLinks();
    initSlideshow();
  }

  // Render Header Branding
  function renderBranding() {
    if (siteTitle) siteTitle.textContent = config.title || "Cité de l’Innovation Marrakech";
    if (siteSubtitle) siteSubtitle.textContent = config.subtitle || "Université Cadi Ayyad — Marrakech";

    if (siteLogo) {
      siteLogo.src = config.logoPath || "assets/logo-clean.png";
      siteLogo.alt = config.logoAlt || "Cité de l'Innovation Logo";
      siteLogo.onerror = () => {
        if (config.logoFallback) siteLogo.src = config.logoFallback;
      };
    }
  }

  // Render Linktree Pill Buttons List
  function renderLinks() {
    if (!linkList || !config.links) return;

    linkList.innerHTML = config.links.map(link => {
      const isFeatured = link.featured ? 'featured' : '';
      const badgeText = link.badge || (link.featured ? 'Événement' : '');
      const badgeHtml = badgeText ? `<span class="featured-badge">${escapeHtml(badgeText)}</span>` : '';
      const customColor = link.color || '#0f766e';

      return `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="link-pill ${isFeatured}">
          ${badgeHtml}
          <div class="pill-icon" style="border-color: ${customColor}; color: ${customColor};">
            <i class="${link.icon || 'fa-solid fa-link'}"></i>
          </div>
          <div class="pill-content">
            <span class="pill-title">${escapeHtml(link.title)}</span>
            ${link.subtitle ? `<span class="pill-subtitle">${escapeHtml(link.subtitle)}</span>` : ''}
          </div>
        </a>
      `;
    }).join('');
  }

  // Automatic Background Slideshow Engine
  function initSlideshow() {
    if (!bgContainer || backgrounds.length === 0) return;

    bgContainer.innerHTML = "";
    bgSlides = [];

    // Create a slide element for each background image in config.js
    backgrounds.forEach((bgUrl, index) => {
      const slide = document.createElement("div");
      slide.className = `bg-slide ${index === 0 ? "active" : ""}`;
      slide.style.backgroundImage = `url('${bgUrl}')`;
      bgContainer.appendChild(slide);
      bgSlides.push(slide);
    });

    // Start automatic background slideshow timer
    if (backgrounds.length > 1) {
      setInterval(nextBackground, delay);
    }
  }

  function nextBackground() {
    if (bgSlides.length === 0) return;

    // Remove active class from current slide
    bgSlides[currentBgIndex].classList.remove("active");

    // Move to next slide index
    currentBgIndex = (currentBgIndex + 1) % bgSlides.length;

    // Add active class to new slide
    bgSlides[currentBgIndex].classList.add("active");
  }

  // Helper function to escape HTML strings safely
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  init();
});
