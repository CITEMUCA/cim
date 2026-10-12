/**
 * CITÉ DE L'INNOVATION MARRAKECH — LOGIQUE PANEL ADMIN
 * Conçu pour une utilisation ultra-simple et visuelle par des non-développeurs
 */

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Vérification de l'authentification
  await checkAuth();

  // 2. Initialisation des composants
  initTabs();
  initColorPickers();
  initBannerPreview();
  initBackgroundsUpload();
  initLogoUpload();
  initCustomIconUpload();
  initForms();
  initLogout();

  // 3. Chargement des données
  await loadOverview();
  await loadLinks();
  await loadBackgrounds();
  await loadSettings();
});

// Toast Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}"></i>
    <span>${escapeHtml(message)}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// 1. Vérification de session
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (!data.authenticated) {
      window.location.href = '/admin/login';
    }
  } catch (err) {
    window.location.href = '/admin/login';
  }
}

// 2. Gestion des onglets
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const contentEl = document.getElementById(target);
      if (contentEl) contentEl.classList.add('active');
    });
  });
}

// 3. Vue d'ensemble & Base de données
async function loadOverview() {
  try {
    const res = await fetch('/api/admin/overview');
    const data = await res.json();
    if (data.success) {
      const dbBadge = document.getElementById('dbName');
      if (dbBadge) {
        dbBadge.textContent = data.data.dbType === 'postgres' ? 'PostgreSQL' : 'SQLite (Local)';
      }
    }
  } catch (err) {
    console.error("Overview error:", err);
  }
}

// =================================================================
// 4. GESTION DES LIENS
// =================================================================
let currentLinks = [];

async function loadLinks() {
  try {
    const res = await fetch('/api/admin/links');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    currentLinks = data.data || [];
    renderLinksList();
  } catch (err) {
    showToast("Impossible de charger les liens", "error");
  }
}

function renderLinksList() {
  const container = document.getElementById('linksListContainer');
  if (!container) return;
  container.innerHTML = "";

  if (currentLinks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
        <i class="fa-solid fa-link-slash" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
        Aucun lien configuré. Cliquez sur "Ajouter un nouveau lien" ci-dessus.
      </div>
    `;
    return;
  }

  currentLinks.forEach((link, idx) => {
    const card = document.createElement('div');
    card.className = `admin-link-card ${link.is_active ? '' : 'inactive'}`;

    // Icon render
    let iconHtml = '';
    if (link.icon_type === 'custom' && link.custom_icon_url) {
      iconHtml = `<img src="/${link.custom_icon_url}" alt="" />`;
    } else {
      iconHtml = `<i class="${link.icon || 'fa-solid fa-link'}"></i>`;
    }

    const badgeHtml = link.badge_text ? `
      <span class="admin-badge-tag" style="background-color: ${link.badge_color || link.color || '#e11d48'}">
        ${escapeHtml(link.badge_text)}
      </span>
    ` : '';

    const starHtml = link.featured ? `<i class="fa-solid fa-star featured-star" title="Mis en avant"></i>` : '';

    card.innerHTML = `
      <div class="link-info-left">
        <!-- Reorder buttons -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <button class="btn btn-secondary btn-sm" style="padding: 2px 6px;" title="Monter" onclick="moveLink(${link.id}, -1)" ${idx === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-up"></i>
          </button>
          <button class="btn btn-secondary btn-sm" style="padding: 2px 6px;" title="Descendre" onclick="moveLink(${link.id}, 1)" ${idx === currentLinks.length - 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-arrow-down"></i>
          </button>
        </div>

        <div class="link-icon-preview" style="background-color: ${link.color || '#0284c7'}">
          ${iconHtml}
        </div>

        <div class="link-details">
          <div class="link-title-row">
            <span class="admin-link-title">${escapeHtml(link.title)}</span>
            ${badgeHtml}
            ${starHtml}
          </div>
          ${link.subtitle ? `<div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">${escapeHtml(link.subtitle)}</div>` : ''}
          <div class="admin-link-url"><i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.7rem;"></i> ${escapeHtml(link.url)}</div>
        </div>
      </div>

      <div class="link-card-actions">
        <!-- Active/Inactive Toggle -->
        <label class="switch" title="Activer / Désactiver">
          <input type="checkbox" ${link.is_active ? 'checked' : ''} onchange="toggleLinkActive(${link.id}, this.checked)" />
          <span class="slider"></span>
        </label>

        <!-- Edit Button -->
        <button class="btn btn-secondary btn-sm" onclick="editLink(${link.id})" title="Modifier">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>

        <!-- Delete Button -->
        <button class="btn btn-danger btn-sm" onclick="deleteLink(${link.id})" title="Supprimer">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    container.appendChild(card);
  });
}

// Switch Link Active
window.toggleLinkActive = async (id, is_active) => {
  const link = currentLinks.find(l => l.id === id);
  if (!link) return;
  link.is_active = is_active;

  try {
    const res = await fetch(`/api/admin/links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...link, is_active })
    });
    const data = await res.json();
    if (data.success) {
      showToast(is_active ? "Lien activé sur le site" : "Lien masqué du site");
      renderLinksList();
    }
  } catch (err) {
    showToast("Erreur lors de la mise à jour", "error");
  }
};

// Reorder Links
window.moveLink = async (id, direction) => {
  const index = currentLinks.findIndex(l => l.id === id);
  if (index < 0) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= currentLinks.length) return;

  // Swap
  const temp = currentLinks[index];
  currentLinks[index] = currentLinks[targetIndex];
  currentLinks[targetIndex] = temp;

  renderLinksList();

  // Save new order to backend
  const items = currentLinks.map((l, i) => ({ id: l.id, sort_order: i + 1 }));
  try {
    await fetch('/api/admin/links/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    showToast("Nouvel ordre enregistré !");
  } catch (err) {
    showToast("Erreur d'enregistrement de l'ordre", "error");
  }
};

// Delete Link
window.deleteLink = async (id) => {
  const link = currentLinks.find(l => l.id === id);
  if (!link) return;
  if (!confirm(`Êtes-vous sûr de vouloir supprimer le bouton "${link.title}" ?`)) return;

  try {
    const res = await fetch(`/api/admin/links/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast("Lien supprimé !");
      await loadLinks();
    }
  } catch (err) {
    showToast("Erreur lors de la suppression", "error");
  }
};

// Edit Link Modal Trigger
window.editLink = (id) => {
  const link = currentLinks.find(l => l.id === id);
  if (!link) return;

  document.getElementById('editLinkId').value = link.id;
  document.getElementById('modalTitle').textContent = "Modifier le lien";
  document.getElementById('modalLinkTitle').value = link.title || '';
  document.getElementById('modalLinkSubtitle').value = link.subtitle || '';
  document.getElementById('modalLinkUrl').value = link.url || '';
  document.getElementById('modalLinkColorPicker').value = link.color || '#0284c7';
  document.getElementById('modalLinkColorText').value = link.color || '#0284c7';
  document.getElementById('modalBadgeText').value = link.badge_text || '';
  document.getElementById('modalBadgeColor').value = link.badge_color || '#e11d48';
  document.getElementById('modalFeaturedCheck').checked = Boolean(link.featured);

  if (link.icon_type === 'custom' && link.custom_icon_url) {
    switchIconTab('custom');
    document.getElementById('customIconUrlValue').value = link.custom_icon_url;
    document.getElementById('customIconPreviewImg').src = `/${link.custom_icon_url}`;
    document.getElementById('customIconPreviewArea').style.display = 'block';
  } else {
    switchIconTab('fontawesome');
    document.getElementById('modalLinkFaClass').value = link.icon || 'fa-solid fa-link';
    updateFaPreview(link.icon || 'fa-solid fa-link', link.color || '#0284c7');
  }

  document.getElementById('linkModal').classList.add('open');
};

// Open Add Link Modal
const openAddBtn = document.getElementById('openAddLinkModalBtn');
if (openAddBtn) {
  openAddBtn.addEventListener('click', () => {
    document.getElementById('editLinkId').value = '';
    document.getElementById('modalTitle').textContent = "Ajouter un nouveau lien";
    document.getElementById('modalLinkTitle').value = '';
    document.getElementById('modalLinkSubtitle').value = '';
    document.getElementById('modalLinkUrl').value = '';
    document.getElementById('modalLinkColorPicker').value = '#0284c7';
    document.getElementById('modalLinkColorText').value = '#0284c7';
    document.getElementById('modalBadgeText').value = '';
    document.getElementById('modalBadgeColor').value = '#e11d48';
    document.getElementById('modalFeaturedCheck').checked = false;
    document.getElementById('customIconUrlValue').value = '';
    document.getElementById('customIconPreviewArea').style.display = 'none';

    switchIconTab('fontawesome');
    document.getElementById('modalLinkFaClass').value = 'fa-solid fa-link';
    updateFaPreview('fa-solid fa-link', '#0284c7');

    document.getElementById('linkModal').classList.add('open');
  });
}

// Close Modal
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
if (closeModalBtn) closeModalBtn.addEventListener('click', () => document.getElementById('linkModal').classList.remove('open'));
if (cancelModalBtn) cancelModalBtn.addEventListener('click', () => document.getElementById('linkModal').classList.remove('open'));

// Save Link (Create or Update)
const saveLinkBtn = document.getElementById('saveLinkBtn');
if (saveLinkBtn) {
  saveLinkBtn.addEventListener('click', async () => {
    const editId = document.getElementById('editLinkId').value;
    const title = document.getElementById('modalLinkTitle').value.trim();
    const subtitle = document.getElementById('modalLinkSubtitle').value.trim();
    const url = document.getElementById('modalLinkUrl').value.trim();
    const color = document.getElementById('modalLinkColorText').value.trim() || '#0284c7';
    const badge_text = document.getElementById('modalBadgeText').value.trim();
    const badge_color = document.getElementById('modalBadgeColor').value;
    const featured = document.getElementById('modalFeaturedCheck').checked;

    if (!title || !url) {
      alert("Veuillez renseigner au minimum le titre et l'adresse URL du bouton.");
      return;
    }

    const isCustom = document.getElementById('btnIconCustom').classList.contains('active');
    const icon_type = isCustom ? 'custom' : 'fontawesome';
    const custom_icon_url = document.getElementById('customIconUrlValue').value || null;
    const icon = document.getElementById('modalLinkFaClass').value.trim() || 'fa-solid fa-link';

    const payload = {
      title,
      subtitle,
      url,
      color,
      icon,
      icon_type,
      custom_icon_url,
      badge_text: badge_text || null,
      badge_color: badge_text ? badge_color : null,
      featured
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`/api/admin/links/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/admin/links', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (data.success) {
        showToast(editId ? "Lien modifié avec succès !" : "Lien ajouté avec succès !");
        document.getElementById('linkModal').classList.remove('open');
        await loadLinks();
      } else {
        showToast(data.error || "Erreur lors de l'enregistrement", "error");
      }
    } catch (err) {
      showToast("Erreur serveur", "error");
    }
  });
}

// Icon Tab Switch
function switchIconTab(type) {
  const btnFa = document.getElementById('btnIconFontawesome');
  const btnCustom = document.getElementById('btnIconCustom');
  const faSec = document.getElementById('faSelectorSection');
  const customSec = document.getElementById('customIconSection');

  if (type === 'fontawesome') {
    btnFa.classList.add('active');
    btnCustom.classList.remove('active');
    faSec.style.display = 'block';
    customSec.style.display = 'none';
  } else {
    btnFa.classList.remove('active');
    btnCustom.classList.add('active');
    faSec.style.display = 'none';
    customSec.style.display = 'block';
  }
}

const btnFa = document.getElementById('btnIconFontawesome');
const btnCustom = document.getElementById('btnIconCustom');
if (btnFa) btnFa.addEventListener('click', () => switchIconTab('fontawesome'));
if (btnCustom) btnCustom.addEventListener('click', () => switchIconTab('custom'));

// FA Class preview & quick buttons
function updateFaPreview(cls, color) {
  const iconEl = document.getElementById('faPreviewIcon');
  const box = document.getElementById('faPreviewBox');
  if (iconEl) iconEl.className = cls;
  if (box && color) box.style.backgroundColor = color;
}

const modalFaInput = document.getElementById('modalLinkFaClass');
if (modalFaInput) {
  modalFaInput.addEventListener('input', (e) => {
    updateFaPreview(e.target.value, document.getElementById('modalLinkColorText').value);
  });
}

document.querySelectorAll('.fa-quick-btn').forEach(b => {
  b.addEventListener('click', () => {
    const iconClass = b.dataset.icon;
    document.getElementById('modalLinkFaClass').value = iconClass;
    updateFaPreview(iconClass, document.getElementById('modalLinkColorText').value);
  });
});

// Custom Icon Upload
function initCustomIconUpload() {
  const triggerBtn = document.getElementById('triggerCustomIconUpload');
  const fileInput = document.getElementById('customIconFileInput');

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const fd = new FormData();
      fd.append('icon', file);

      try {
        const res = await fetch('/api/admin/upload/icon', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          document.getElementById('customIconUrlValue').value = data.url;
          document.getElementById('customIconPreviewImg').src = `/${data.url}`;
          document.getElementById('customIconPreviewArea').style.display = 'block';
          showToast("Icône téléversée avec succès !");
        } else {
          showToast(data.error || "Erreur upload", "error");
        }
      } catch (err) {
        showToast("Erreur upload icône", "error");
      }
    });
  }
}

// Color Swatches in Link Modal
function initColorPickers() {
  const picker = document.getElementById('modalLinkColorPicker');
  const text = document.getElementById('modalLinkColorText');

  if (picker && text) {
    picker.addEventListener('input', (e) => {
      text.value = e.target.value;
      updateFaPreview(document.getElementById('modalLinkFaClass').value, e.target.value);
    });
    text.addEventListener('input', (e) => {
      picker.value = e.target.value;
      updateFaPreview(document.getElementById('modalLinkFaClass').value, e.target.value);
    });
  }

  document.querySelectorAll('#colorSwatchesContainer .color-swatch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.dataset.color;
      if (picker) picker.value = color;
      if (text) text.value = color;
      updateFaPreview(document.getElementById('modalLinkFaClass').value, color);
    });
  });
}

// =================================================================
// 5. GESTION DES PHOTOS D'ARRIÈRE-PLAN
// =================================================================
let currentBackgrounds = [];

async function loadBackgrounds() {
  try {
    const res = await fetch('/api/admin/backgrounds');
    const data = await res.json();
    if (!data.success) throw new Error(data.error);

    currentBackgrounds = data.data || [];
    renderBackgroundsGrid();
  } catch (err) {
    showToast("Impossible de charger le diaporama", "error");
  }
}

function renderBackgroundsGrid() {
  const container = document.getElementById('backgroundsGridContainer');
  const countEl = document.getElementById('bgCount');
  if (countEl) countEl.textContent = currentBackgrounds.length;
  if (!container) return;

  container.innerHTML = "";

  currentBackgrounds.forEach((bg, idx) => {
    const card = document.createElement('div');
    card.className = 'bg-card-item';

    card.innerHTML = `
      <div class="bg-thumb-wrap">
        <span class="bg-badge-order">#${idx + 1}</span>
        <img src="/${bg.url}" alt="Photo ${idx + 1}" loading="lazy" />
      </div>
      <div class="bg-card-footer">
        <div class="bg-order-arrows">
          <button class="btn btn-secondary btn-sm btn-arrow" onclick="moveBackground(${bg.id}, -1)" title="Déplacer vers la gauche / plus tôt" ${idx === 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <button class="btn btn-secondary btn-sm btn-arrow" onclick="moveBackground(${bg.id}, 1)" title="Déplacer vers la droite / plus tard" ${idx === currentBackgrounds.length - 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <label class="switch" title="Activer / Désactiver du diaporama">
            <input type="checkbox" ${bg.is_active ? 'checked' : ''} onchange="toggleBackgroundActive(${bg.id}, this.checked)" />
            <span class="slider"></span>
          </label>
          <button class="btn btn-danger btn-sm" style="padding: 4px 8px;" onclick="deleteBackgroundItem(${bg.id})" title="Supprimer du diaporama">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

window.moveBackground = async (id, direction) => {
  const index = currentBackgrounds.findIndex(b => b.id === id);
  if (index < 0) return;
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= currentBackgrounds.length) return;

  // Swap dans le tableau local
  const temp = currentBackgrounds[index];
  currentBackgrounds[index] = currentBackgrounds[targetIndex];
  currentBackgrounds[targetIndex] = temp;

  renderBackgroundsGrid();

  // Envoi du nouvel ordre au serveur
  const items = currentBackgrounds.map((b, i) => ({ id: b.id, sort_order: i + 1 }));
  try {
    const res = await fetch('/api/admin/backgrounds/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    if (data.success) {
      showToast("Ordre du diaporama mis à jour !");
    } else {
      showToast(data.error || "Erreur de réorganisation", "error");
    }
  } catch (err) {
    showToast("Erreur lors de la réorganisation", "error");
  }
};

window.toggleBackgroundActive = async (id, is_active) => {
  try {
    const res = await fetch(`/api/admin/backgrounds/${id}/toggle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active })
    });
    const data = await res.json();
    if (data.success) {
      showToast(is_active ? "Photo activée dans le diaporama" : "Photo masquée du diaporama");
      await loadBackgrounds();
    }
  } catch (err) {
    showToast("Erreur lors de la mise à jour", "error");
  }
};

window.deleteBackgroundItem = async (id) => {
  if (!confirm("Retirer cette photo du diaporama ?")) return;

  try {
    const res = await fetch(`/api/admin/backgrounds/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      showToast("Photo retirée !");
      await loadBackgrounds();
    }
  } catch (err) {
    showToast("Erreur suppression", "error");
  }
};

function initBackgroundsUpload() {
  const dropzone = document.getElementById('bgDropzone');
  const fileInput = document.getElementById('bgFileInput');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length > 0) uploadPhotos(files);
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) uploadPhotos(e.target.files);
    });
  }

  // Slideshow Delay Select
  const delaySelect = document.getElementById('slideshowDelaySelect');
  if (delaySelect) {
    delaySelect.addEventListener('change', async (e) => {
      const delay = e.target.value;
      try {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slideshowDelay: delay })
        });
        showToast(`Vitesse du diaporama réglée sur ${delay / 1000}s`);
      } catch (err) {
        showToast("Erreur de sauvegarde de la vitesse", "error");
      }
    });
  }
}

async function uploadPhotos(files) {
  const fd = new FormData();
  for (let i = 0; i < files.length; i++) {
    fd.append('photos', files[i]);
  }

  showToast(`Téléversement de ${files.length} photo(s)...`);

  try {
    const res = await fetch('/api/admin/backgrounds/upload', {
      method: 'POST',
      body: fd
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message || "Photos ajoutées avec succès !");
      await loadBackgrounds();
    } else {
      showToast(data.error || "Erreur upload", "error");
    }
  } catch (err) {
    showToast("Erreur téléversement photos", "error");
  }
}

// =================================================================
// 6. GESTION DU BANDEAU D'ANNONCE
// =================================================================
function initBannerPreview() {
  const textInput = document.getElementById('bannerText');
  const colorPicker = document.getElementById('bannerColorPicker');
  const colorText = document.getElementById('bannerColorText');
  const preview = document.getElementById('bannerPreview');

  function update() {
    if (!preview) return;
    preview.textContent = textInput.value || "Aperçu du message de votre annonce";
    preview.style.backgroundColor = colorPicker.value || "#e11d48";
  }

  if (textInput) textInput.addEventListener('input', update);
  if (colorPicker && colorText) {
    colorPicker.addEventListener('input', (e) => {
      colorText.value = e.target.value;
      update();
    });
    colorText.addEventListener('input', (e) => {
      colorPicker.value = e.target.value;
      update();
    });
  }

  const saveBannerBtn = document.getElementById('saveBannerBtn');
  if (saveBannerBtn) {
    saveBannerBtn.addEventListener('click', async () => {
      const enabled = document.getElementById('bannerEnabled').checked;
      const text = document.getElementById('bannerText').value.trim();
      const link = document.getElementById('bannerLink').value.trim();
      const color = document.getElementById('bannerColorPicker').value;

      try {
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bannerEnabled: enabled ? 'true' : 'false',
            bannerText: text,
            bannerLink: link,
            bannerColor: color
          })
        });
        const data = await res.json();
        if (data.success) {
          showToast("Bandeau d'annonce enregistré !");
        } else {
          showToast(data.error || "Erreur d'enregistrement", "error");
        }
      } catch (err) {
        showToast("Erreur serveur", "error");
      }
    });
  }
}

// =================================================================
// 7. IDENTITÉ DU SITE & LOGO
// =================================================================
async function loadSettings() {
  try {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    if (!data.success) return;

    const s = data.data;

    // Site Identity
    if (document.getElementById('siteTitleInput')) document.getElementById('siteTitleInput').value = s.title || '';
    if (document.getElementById('siteSubtitleInput')) document.getElementById('siteSubtitleInput').value = s.subtitle || '';
    if (document.getElementById('siteEmailInput')) document.getElementById('siteEmailInput').value = s.email || '';
    if (document.getElementById('accentColorPicker')) document.getElementById('accentColorPicker').value = s.accentColor || '#0284c7';
    if (document.getElementById('accentColorText')) document.getElementById('accentColorText').value = s.accentColor || '#0284c7';

    // Logo
    if (s.logoPath && document.getElementById('logoPreviewImg')) {
      document.getElementById('logoPreviewImg').src = `/${s.logoPath}`;
    }
    if (s.logoPath && document.getElementById('headerLogoImg')) {
      document.getElementById('headerLogoImg').src = `/${s.logoPath}`;
    }

    // Banner
    if (document.getElementById('bannerEnabled')) document.getElementById('bannerEnabled').checked = s.bannerEnabled === 'true';
    if (document.getElementById('bannerText')) document.getElementById('bannerText').value = s.bannerText || '';
    if (document.getElementById('bannerLink')) document.getElementById('bannerLink').value = s.bannerLink || '';
    if (document.getElementById('bannerColorPicker')) document.getElementById('bannerColorPicker').value = s.bannerColor || '#e11d48';
    if (document.getElementById('bannerColorText')) document.getElementById('bannerColorText').value = s.bannerColor || '#e11d48';
    if (document.getElementById('bannerPreview')) {
      document.getElementById('bannerPreview').textContent = s.bannerText || 'Aperçu du message';
      document.getElementById('bannerPreview').style.backgroundColor = s.bannerColor || '#e11d48';
    }

    // Slideshow delay
    if (document.getElementById('slideshowDelaySelect') && s.slideshowDelay) {
      document.getElementById('slideshowDelaySelect').value = s.slideshowDelay;
    }
  } catch (err) {
    console.error("Settings load error:", err);
  }
}

function initLogoUpload() {
  const triggerBtn = document.getElementById('triggerLogoUploadBtn');
  const fileInput = document.getElementById('logoFileInput');

  if (triggerBtn && fileInput) {
    triggerBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const fd = new FormData();
      fd.append('logo', file);

      showToast("Téléversement du nouveau logo...");
      try {
        const res = await fetch('/api/admin/upload/logo', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || "Logo mis à jour !");
          document.getElementById('logoPreviewImg').src = `/${data.url}`;
          document.getElementById('headerLogoImg').src = `/${data.url}`;
        } else {
          showToast(data.error || "Erreur téléversement", "error");
        }
      } catch (err) {
        showToast("Erreur téléversement logo", "error");
      }
    });
  }

  // Accent color sync
  const accentPicker = document.getElementById('accentColorPicker');
  const accentText = document.getElementById('accentColorText');
  if (accentPicker && accentText) {
    accentPicker.addEventListener('input', (e) => accentText.value = e.target.value);
    accentText.addEventListener('input', (e) => accentPicker.value = e.target.value);
  }

  // Save General Settings Button
  const saveGeneralBtn = document.getElementById('saveGeneralSettingsBtn');
  if (saveGeneralBtn) {
    saveGeneralBtn.addEventListener('click', async () => {
      const title = document.getElementById('siteTitleInput').value.trim();
      const subtitle = document.getElementById('siteSubtitleInput').value.trim();
      const email = document.getElementById('siteEmailInput').value.trim();
      const accentColor = document.getElementById('accentColorPicker').value;

      try {
        const res = await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, subtitle, email, accentColor })
        });
        const data = await res.json();
        if (data.success) {
          showToast("Paramètres du site enregistrés !");
        } else {
          showToast(data.error || "Erreur de sauvegarde", "error");
        }
      } catch (err) {
        showToast("Erreur serveur", "error");
      }
    });
  }
}

// =================================================================
// 8. SÉCURITÉ & CHANGEMENT DE MOT DE PASSE
// =================================================================
function initForms() {
  const changePassForm = document.getElementById('changePasswordForm');
  if (changePassForm) {
    changePassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword !== confirmPassword) {
        showToast("Les nouveaux mots de passe ne correspondent pas.", "error");
        return;
      }

      try {
        const res = await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword, newPassword })
        });
        const data = await res.json();
        if (data.success) {
          showToast(data.message || "Mot de passe modifié avec succès !");
          changePassForm.reset();
        } else {
          showToast(data.error || "Erreur de modification", "error");
        }
      } catch (err) {
        showToast("Erreur serveur", "error");
      }
    });
  }
}

// 9. DÉCONNEXION
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        localStorage.removeItem('cim_token');
        window.location.href = '/admin/login';
      } catch (err) {
        window.location.href = '/admin/login';
      }
    });
  }
}

// Helper to escape HTML safely
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
