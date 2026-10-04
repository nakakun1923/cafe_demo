const $ = (selector) => document.querySelector(selector);
// Wrap each phrase (separated by "|") in a no-break span so Japanese text only wraps at phrase boundaries.
const phrases = (text) => text.split('|').map((part) => `<span class="nw">${part}</span>`).join('');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const navToggle = $('.nav-toggle');
const navigation = $('#navigation');
const documentPath = (pathname) => pathname.replace(/\/index\.html$/, '/');
const isCurrentDocument = (url) => url.origin === location.origin && documentPath(url.pathname) === documentPath(location.pathname);

function focusSection(hash, scroll = false) {
  let section;
  try { section = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { return; }
  if (!section) return;
  const focusTarget = section.querySelector('h1, h2') || section;
  const temporaryFocus = !focusTarget.hasAttribute('tabindex');
  if (temporaryFocus) focusTarget.setAttribute('tabindex', '-1');
  focusTarget.focus({ preventScroll: true });
  if (scroll) section.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
  if (temporaryFocus) focusTarget.addEventListener('blur', () => focusTarget.removeAttribute('tabindex'), { once: true });
}

// The directory URL and index.html are the same page, including on GitHub Pages.
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target.closest('a[href]');
  if (!link || link.target || link.hasAttribute('download')) return;
  const destination = new URL(link.href);
  if (!destination.hash || !isCurrentDocument(destination)) return;
  let targetId;
  try { targetId = decodeURIComponent(destination.hash.slice(1)); } catch { return; }
  if (!document.getElementById(targetId)) return;
  event.preventDefault();
  if (location.hash !== destination.hash) history.pushState(null, '', destination.hash);
  focusSection(destination.hash, true);
});
if (location.hash) requestAnimationFrame(() => focusSection(location.hash));
window.addEventListener('hashchange', () => focusSection(location.hash));
function closeNavigation() {
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'メニューを開く');
  navigation.classList.remove('open');
}
navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') !== 'true';
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  navigation.classList.toggle('open', open);
});
navigation.addEventListener('click', (event) => { if (event.target.closest('a')) closeNavigation(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
    closeNavigation(); navToggle.focus();
  }
});

function enableSwipe(element, callback) {
  if (!element) return;
  let start = null;
  element.addEventListener('touchstart', (event) => {
    start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  element.addEventListener('touchend', (event) => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) callback(dx < 0 ? 1 : -1);
    start = null;
  }, { passive: true });
  element.addEventListener('touchcancel', () => { start = null; }, { passive: true });
}

const products = {
  lunch: { title: 'ひるごはん', label: 'ランチ', image: 'lunch', alt: '主菜と野菜の副菜、ごはん、汁物を並べたランチのイメージ', description: '主菜と野菜の|副菜、|ごはん、|汁物を|並べたお盆は、|私たちが|目指す|日々の|ごはんの|イメージです。|適度に|お腹を|満たせて、|栄養の|バランスにも、|お財布にも|気を配る。|「近くに|ちょうどいい|お店があって|助かる」と|思って|もらえる|ごはんを|目指しています。' },
  coffee: { title: 'ひと息・コーヒー', label: 'コーヒー', image: 'coffee', alt: '湯気の立つコーヒーを白いカップで出した、カフェの席のイメージ', description: 'ひとりで|気持ちを|ゆるめる時間にも、|同僚と|話す時間にも。|日々の|ひと息に|寄り添う|一杯を|イメージしました。' },
  cheesecake: { title: 'スイーツ', label: 'スイーツ', image: 'cheesecake', alt: '焼き色のついたチーズケーキの一切れとフォークのイメージ', description: '少し甘いものと|一緒に、|肩の力を|抜く|ひと休みを。|気楽に|過ごす|午後の|時間を|イメージした|写真です。' },
};
function closeDialog(target) {
  if (!target?.open || target.classList.contains('is-closing')) return;
  if (reducedMotion.matches) { target.close(); return; }
  target.classList.add('is-closing');
  let fallback;
  const finish = () => {
    clearTimeout(fallback);
    target.removeEventListener('animationend', onAnimationEnd);
    target.classList.remove('is-closing');
    target.close();
  };
  const onAnimationEnd = (event) => {
    if (event.target === target && event.animationName === 'dialog-out') finish();
  };
  target.addEventListener('animationend', onAnimationEnd);
  fallback = setTimeout(finish, 450);
}
document.querySelectorAll('dialog').forEach((target) => {
  target.addEventListener('cancel', (event) => { event.preventDefault(); closeDialog(target); });
});

const dialog = $('#detail-dialog');
const dialogContent = $('#dialog-content');
let opener = null;
function showDetail(key) {
  if (!dialog.open) opener = document.activeElement;
  const note = `<p class="detail-note">${phrases('写真は|イメージです。|提供内容は|決まり次第|お知らせします。')}</p>`;
  if (products[key]) {
    const product = products[key];
    dialogContent.innerHTML = `<img class="detail-photo" src="../assets/${product.image}.jpg" alt="${product.alt}"><div class="detail-body"><p class="label">${product.label}</p><h2 id="dialog-title">${product.title}</h2><p>${phrases(product.description)}</p>${note}</div>`;
  } else return;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
  $('.dialog-close').focus();
}
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-detail]');
  if (trigger) showDetail(trigger.dataset.detail);
});
$('.dialog-close').addEventListener('click', () => closeDialog(dialog));
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (opener?.isConnected) opener.focus();
});

if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('js-motion');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));
}

const galleryButtons = [...document.querySelectorAll('[data-gallery]')];
if (galleryButtons.length) {
  const galleryDialog = $('#gallery-dialog');
  const galleryImage = $('#gallery-full-image');
  let galleryIndex = 0;
  let galleryOpener;
  let galleryTransition = 0;
  async function setGalleryPhoto(index) {
    galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
    const photo = galleryButtons[galleryIndex].querySelector('img');
    const transition = ++galleryTransition;
    if (galleryDialog.open && !reducedMotion.matches) {
      galleryImage.classList.add('is-changing');
      const nextImage = new Image(); nextImage.src = photo.src;
      await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 200)),
        Promise.race([nextImage.decode().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1500))]),
      ]);
    }
    if (transition !== galleryTransition) return;
    $('#gallery-error').hidden = true;
    galleryImage.src = photo.src;
    galleryImage.alt = photo.alt;
    $('#gallery-counter').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryButtons.length).padStart(2, '0')}`;
    const captionSource = galleryButtons[galleryIndex].querySelector('.gallery-caption');
    if (captionSource) $('#gallery-full-caption').innerHTML = captionSource.innerHTML; else $('#gallery-full-caption').textContent = photo.alt;
    requestAnimationFrame(() => galleryImage.classList.remove('is-changing'));
  }
  galleryButtons.forEach((button, index) => button.addEventListener('click', () => {
    galleryOpener = button;
    setGalleryPhoto(index);
    galleryDialog.showModal();
    document.body.classList.add('modal-open');
    $('#gallery-close').focus();
  }));
  $('#gallery-prev').addEventListener('click', () => setGalleryPhoto(galleryIndex - 1));
  $('#gallery-next').addEventListener('click', () => setGalleryPhoto(galleryIndex + 1));
  $('#gallery-close').addEventListener('click', () => closeDialog(galleryDialog));
  galleryImage.addEventListener('error', () => { $('#gallery-error').hidden = false; });
  galleryDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); setGalleryPhoto(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  galleryDialog.addEventListener('click', (event) => {
    const rect = galleryDialog.getBoundingClientRect();
    if (event.target === galleryDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(galleryDialog);
  });
  galleryDialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    galleryOpener?.focus();
  });
  enableSwipe(galleryImage, (direction) => setGalleryPhoto(galleryIndex + direction));
}

const settings = window.CAPRICE_SETTINGS || {};
// Keep the postal code and each address part unbroken so a line never splits mid-word.
function renderAddress(element, address) {
  const match = address.trim().match(/^(〒\s*[\d０-９-－]+)?\s*(.*)$/);
  const parts = match[2].match(/.+?[都道府県郡市区町村]|.+$/g) || [];
  element.replaceChildren();
  const add = (text, className) => {
    const span = document.createElement('span'); span.className = className; span.textContent = text; element.append(span);
  };
  if (match[1]) add(match[1].replace(/\s+/g, ''), 'addr-zip');
  parts.forEach((part) => add(part, 'addr-part'));
}
if (settings.address) document.querySelectorAll('[data-address]').forEach((element) => renderAddress(element, settings.address));
if (settings.hours) document.querySelectorAll('[data-hours]').forEach((element) => { element.textContent = settings.hours; });
const map = $('#access-map');
if (map && settings.mapEmbedUrl) {
  if (map.src !== settings.mapEmbedUrl) map.src = settings.mapEmbedUrl;
  if (!settings.mapIsPlaceholder) {
    map.title = 'cafe&BAR Caprice アクセスマップ';
    const mapNote = $('.map-note'); if (mapNote) mapNote.innerHTML = phrases('地図は|指定住所を|もとに|表示しています。');
    const fallbackLink = $('.map-fallback a');
    if (fallbackLink) fallbackLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'cafe&BAR Caprice')}`;
  }
}
if (settings.instagramUrl) {
  try {
    const url = new URL(settings.instagramUrl);
    if (url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname)) {
      document.querySelectorAll('.instagram-link').forEach((link) => {
        link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.removeAttribute('aria-disabled'); link.textContent = 'Instagramを見る ↗';
      });
    }
  } catch { /* Invalid or unset account keeps the preparation state. */ }
}

/* ---------- Color themes (comparison tool) ---------- */
const THEMES = [
  { id: 'terracotta', name: 'テラコッタ', accent: '#B5532F', paper: '#FBF8F2' },
  { id: 'sage', name: 'セージ', accent: '#4F7036', paper: '#F8FAF4' },
  { id: 'indigo', name: '藍', accent: '#2B4C8C', paper: '#FAFBFD' },
  { id: 'mustard', name: 'からし', accent: '#E3A71F', paper: '#FFFBF0' },
  { id: 'sakura', name: 'さくら', accent: '#B04F64', paper: '#FFF9F8' },
  { id: 'sky', name: 'そら', accent: '#2A78AD', paper: '#F9FCFE' },
];
const THEME_KEY = 'concept-theme';
const themeById = (id) => THEMES.find((theme) => theme.id === id);
const readUrlTheme = () => { try { return new URLSearchParams(location.search).get('theme'); } catch { return null; } };
const readStoredTheme = () => { try { return localStorage.getItem(THEME_KEY); } catch { return null; } };
let currentTheme = themeById(readUrlTheme()) || themeById(readStoredTheme()) || THEMES[0];

function faviconFor(theme) {
  return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><rect width='40' height='40' rx='10' fill='${theme.accent}'/><path d='M9 13h19v12a7 7 0 0 1-7 7h-5a7 7 0 0 1-7-7zm19 2h3a5 5 0 0 1 0 10h-3' fill='none' stroke='${theme.paper}' stroke-width='3'/></svg>`)}`;
}
function withThemeParam(href, theme) {
  const url = new URL(href, location.href);
  url.searchParams.set('theme', theme.id);
  return url;
}
function syncLinks() {
  if (!readUrlTheme()) return;
  document.querySelectorAll('a[href]').forEach((link) => {
    const raw = link.getAttribute('href');
    if (!/^(index\.html|menu\.html)(#|\?|$)/.test(raw)) return;
    const url = withThemeParam(raw, currentTheme);
    link.setAttribute('href', `${raw.split(/[?#]/)[0]}?theme=${currentTheme.id}${url.hash}`);
  });
}
function applyTheme(theme, { persist = false, animate = false } = {}) {
  const root = document.documentElement;
  if (animate && !reducedMotion.matches) {
    root.classList.add('theme-fade');
    clearTimeout(applyTheme.timer);
    applyTheme.timer = setTimeout(() => root.classList.remove('theme-fade'), 300);
  }
  currentTheme = theme;
  root.dataset.theme = theme.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme.paper;
  const icon = document.querySelector('link[rel="icon"]');
  if (icon) icon.href = faviconFor(theme);
  if (persist) {
    try { localStorage.setItem(THEME_KEY, theme.id); } catch { /* storage unavailable */ }
    try {
      const url = withThemeParam(location.href, theme);
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    } catch { /* ignore */ }
  }
  syncLinks();
}
applyTheme(currentTheme);

function buildSwitcher() {
  const root = document.createElement('div');
  root.className = 'theme-switcher';
  root.innerHTML = `<div class="theme-panel" id="theme-panel" hidden><p class="theme-panel-title">カラーを比べる</p><div class="theme-options" role="radiogroup" aria-label="カラーテーマ"></div></div>` +
    `<button type="button" class="theme-toggle" aria-expanded="false" aria-controls="theme-panel"><span class="swatch" aria-hidden="true"></span><span class="theme-toggle-label">カラー</span></button>`;
  const toggle = root.querySelector('.theme-toggle');
  const panel = root.querySelector('.theme-panel');
  const group = root.querySelector('.theme-options');
  const setSwatch = (el, theme) => { el.style.setProperty('--sw-a', theme.accent); el.style.setProperty('--sw-p', theme.paper); };
  const options = THEMES.map((theme) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'theme-option'; button.setAttribute('role', 'radio'); button.dataset.theme = theme.id;
    button.innerHTML = '<span class="swatch" aria-hidden="true"></span><span class="theme-name"></span>';
    button.querySelector('.theme-name').textContent = theme.name;
    setSwatch(button.querySelector('.swatch'), theme);
    group.append(button);
    return button;
  });
  const refresh = () => {
    options.forEach((button) => {
      const on = button.dataset.theme === currentTheme.id;
      button.setAttribute('aria-checked', String(on));
      button.tabIndex = on ? 0 : -1;
    });
    setSwatch(toggle.querySelector('.swatch'), currentTheme);
    toggle.setAttribute('aria-label', `カラー(現在: ${currentTheme.name})`);
  };
  const choose = (index, focus = true) => {
    const next = (index + THEMES.length) % THEMES.length;
    applyTheme(THEMES[next], { persist: true, animate: true });
    refresh();
    if (focus) options[next].focus();
  };
  const setOpen = (open, returnFocus = false) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    if (open) options.find((button) => button.tabIndex === 0).focus();
    else if (returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  options.forEach((button, index) => {
    button.addEventListener('click', () => choose(index));
    button.addEventListener('keydown', (event) => {
      const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (event.key in keys) { event.preventDefault(); choose(index + keys[event.key]); }
      else if (event.key === 'Home') { event.preventDefault(); choose(0); }
      else if (event.key === 'End') { event.preventDefault(); choose(THEMES.length - 1); }
    });
  });
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) { event.stopPropagation(); setOpen(false, true); }
  });
  document.addEventListener('click', (event) => { if (!panel.hidden && !root.contains(event.target)) setOpen(false); });
  refresh();
  document.body.append(root);
  document.body.classList.add('has-theme-switcher');
}
buildSwitcher();
