const $ = (selector) => document.querySelector(selector);
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
  if (!document.getElementById(decodeURIComponent(destination.hash.slice(1)))) return;
  event.preventDefault();
  if (location.hash !== destination.hash) history.pushState(null, '', destination.hash);
  focusSection(destination.hash, true);
});
if (location.hash) requestAnimationFrame(() => focusSection(location.hash));
window.addEventListener('hashchange', () => focusSection(location.hash));

if (navToggle && navigation) {
  function closeNavigation(restoreFocus = false) {
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'ナビゲーションを開く');
    navigation.classList.remove('open');
    if (restoreFocus) navToggle.focus();
  }
  function navigationIsOpen() {
    return navToggle.getAttribute('aria-expanded') === 'true';
  }
  navToggle.addEventListener('click', () => {
    if (navigationIsOpen()) closeNavigation();
    else {
      navToggle.setAttribute('aria-expanded', 'true');
      navToggle.setAttribute('aria-label', 'ナビゲーションを閉じる');
      navigation.classList.add('open');
      navigation.querySelector('a')?.focus();
    }
  });
  navigation.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link || !navigationIsOpen()) return;
    closeNavigation();
  });
  document.addEventListener('pointerdown', (event) => {
    if (navigationIsOpen() && !navigation.contains(event.target) && !navToggle.contains(event.target)) {
      closeNavigation(navigation.contains(document.activeElement));
    }
  });
  document.addEventListener('keydown', (event) => {
    if (!navigationIsOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeNavigation(true);
    } else if (event.key === 'Tab') {
      const controls = [navToggle, ...navigation.querySelectorAll('a[href]')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
  window.addEventListener('resize', () => {
    if (getComputedStyle(navToggle).display === 'none' && navigationIsOpen()) closeNavigation();
  }, { passive: true });
}

function enableSwipe(element, callback) {
  if (!element) return;
  let start = null;
  element.addEventListener('touchstart', (event) => {
    start = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  element.addEventListener('touchend', (event) => {
    if (!start || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - start.x;
    const dy = event.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) callback(dx < 0 ? 1 : -1);
    start = null;
  }, { passive: true });
  element.addEventListener('touchcancel', () => { start = null; }, { passive: true });
}

function updateModalState() {
  document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
}
function bindDialogClose(dialog, closeButton, getOpener) {
  closeButton?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => {
    updateModalState();
    const opener = getOpener();
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
}

const products = {
  lunch: {
    title: '日替わりごはん', label: 'ランチ', image: 'lunch',
    alt: '主菜、野菜の副菜、ごはん、汁物を並べたランチプレートのイメージ',
    description: '主菜と野菜の副菜、ごはん、汁物を並べたプレートは、私たちが目指す日々のごはんのイメージです。しっかり食べられて、栄養のバランスにも、お財布にも気を配る。毎日の食事として選びやすいごはんを目指しています。',
  },
  coffee: {
    title: 'コーヒー', label: 'コーヒー', image: 'coffee',
    alt: '陶器のカップに注がれたコーヒーのイメージ',
    description: 'ひとりで気持ちをゆるめる時間にも、同僚と話す時間にも。日々のひと休みに寄り添う一杯をイメージしました。具体的な豆や淹れ方、提供内容は準備中です。',
  },
  cheesecake: {
    title: 'チーズケーキ', label: 'スイーツ', image: 'cheesecake',
    alt: '焼き色のついたチーズケーキのイメージ',
    description: 'ごはんのあとや、ひと休みの時間に。コーヒーと一緒に楽しむ小さな甘い時間をイメージしたサンプルです。具体的なスイーツの種類や提供内容は準備中です。',
  },
};
const detailDialog = $('#detail-dialog');
const dialogContent = $('#dialog-content');
if (detailDialog && dialogContent) {
  let detailOpener;
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-detail]');
    const product = trigger && products[trigger.dataset.detail];
    if (!product) return;
    detailOpener = trigger;
    // Product copy is authored locally; no settings or user input becomes HTML.
    dialogContent.innerHTML = `<img class="detail-photo" src="../assets/${product.image}.jpg" alt="${product.alt}" width="1536" height="1024"><div class="detail-body"><p class="eyebrow">${product.label}</p><h2 id="dialog-title">${product.title}</h2><p>${product.description}</p><p class="detail-note">写真・メニューはデモ用のイメージです。実際の提供内容・価格・食材やアレルギーに関する情報は未確定です。</p><p class="detail-error" role="status" hidden>写真を読み込めませんでした。説明文をご覧ください。</p></div>`;
    dialogContent.querySelector('img').addEventListener('error', () => { dialogContent.querySelector('.detail-error').hidden = false; });
    if (!detailDialog.open) detailDialog.showModal();
    detailDialog.scrollTop = 0;
    updateModalState();
    detailDialog.querySelector('.dialog-close')?.focus();
  });
  bindDialogClose(detailDialog, detailDialog.querySelector('.dialog-close'), () => detailOpener);
}

const categoryButtons = [...document.querySelectorAll('[data-category]')];
const catalogItems = [...document.querySelectorAll('[data-product-category]')];
if (categoryButtons.length && catalogItems.length) {
  function filterCatalog(category, updateUrl = false) {
    const active = categoryButtons.find((button) => button.dataset.category === category) || categoryButtons[0];
    category = active.dataset.category;
    categoryButtons.forEach((button) => button.setAttribute('aria-pressed', String(button === active)));
    catalogItems.forEach((item) => { item.hidden = category !== 'all' && item.dataset.productCategory !== category; });
    const count = catalogItems.filter((item) => !item.hidden).length;
    if ($('#catalog-count')) $('#catalog-count').textContent = `${count}件のイメージ`;
    if ($('#catalog-empty')) $('#catalog-empty').hidden = count > 0;
    if (updateUrl) {
      const url = new URL(location.href);
      if (category === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', category);
      history.replaceState(null, '', url);
    }
  }
  const initialCategory = new URL(location.href).searchParams.get('category');
  filterCatalog(initialCategory || 'all');
  categoryButtons.forEach((button) => button.addEventListener('click', () => filterCatalog(button.dataset.category, true)));
}

const galleryGrid = $('#gallery-grid');
const galleryDialog = $('#gallery-dialog');
const galleryImage = $('#gallery-full-image');
if (galleryGrid && galleryDialog && galleryImage) {
  const galleryButtons = [...galleryGrid.querySelectorAll('[data-gallery]')];
  let galleryIndex = 0;
  let galleryOpener;
  function setGalleryPhoto(index) {
    if (!galleryButtons.length) return;
    galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
    const button = galleryButtons[galleryIndex];
    const photo = button.querySelector('img');
    const caption = button.querySelector('.gallery-caption > span')?.textContent || photo.alt;
    $('#gallery-error').hidden = true;
    galleryImage.setAttribute('aria-busy', 'true');
    galleryImage.src = photo.src;
    galleryImage.alt = photo.alt;
    $('#gallery-counter').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryButtons.length).padStart(2, '0')}`;
    $('#gallery-full-caption').textContent = caption;
  }
  galleryButtons.forEach((button, index) => button.addEventListener('click', () => {
    galleryOpener = button;
    setGalleryPhoto(index);
    galleryDialog.showModal();
    updateModalState();
    $('#gallery-close')?.focus();
  }));
  $('#gallery-prev')?.addEventListener('click', () => setGalleryPhoto(galleryIndex - 1));
  $('#gallery-next')?.addEventListener('click', () => setGalleryPhoto(galleryIndex + 1));
  galleryImage.addEventListener('load', () => galleryImage.setAttribute('aria-busy', 'false'));
  galleryImage.addEventListener('error', () => {
    galleryImage.setAttribute('aria-busy', 'false');
    $('#gallery-error').hidden = false;
  });
  galleryDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      setGalleryPhoto(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  bindDialogClose(galleryDialog, $('#gallery-close'), () => galleryOpener);
  enableSwipe(galleryImage, (direction) => setGalleryPhoto(galleryIndex + direction));
}

// A single page may show section location; the separate menu keeps aria-current=page.
const sectionLinks = navigation ? [...navigation.querySelectorAll('a')].filter((link) => {
  const url = new URL(link.href);
  return isCurrentDocument(url) && Boolean(url.hash);
}) : [];
if (sectionLinks.length && 'IntersectionObserver' in window) {
  const sections = sectionLinks.map((link) => document.getElementById(new URL(link.href).hash.slice(1))).filter(Boolean);
  function updateSectionLocation() {
    const headerBottom = $('.site-header')?.getBoundingClientRect().bottom || 0;
    const activeSection = sections.find((section) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= headerBottom + 100 && rect.bottom > headerBottom + 100;
    });
    sectionLinks.forEach((link) => {
      if (activeSection && new URL(link.href).hash === `#${activeSection.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  let frame;
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(() => { updateSectionLocation(); frame = null; });
  }, { passive: true });
  window.addEventListener('resize', updateSectionLocation, { passive: true });
  updateSectionLocation();
}

// The static HTML already has the known address and a working map without JS.
const settings = window.CAPRICE_SETTINGS || {};
const address = typeof settings.address === 'string' ? settings.address.trim() : '';
if (address) document.querySelectorAll('[data-address]').forEach((element) => { element.textContent = address; });
if (typeof settings.hours === 'string' && settings.hours.trim()) {
  document.querySelectorAll('[data-hours]').forEach((element) => { element.textContent = settings.hours; });
}
const map = $('#access-map');
if (map && typeof settings.mapEmbedUrl === 'string') {
  try {
    const url = new URL(settings.mapEmbedUrl);
    if (url.protocol === 'https:' && ['maps.google.com', 'www.google.com', 'google.com'].includes(url.hostname) && map.src !== url.href) map.src = url.href;
  } catch { /* Keep the working address-based map when settings are invalid. */ }
}
if (address) {
  document.querySelectorAll('.map-external-link').forEach((link) => {
    link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  });
}
if (typeof settings.instagramUrl === 'string' && settings.instagramUrl.trim()) {
  try {
    const url = new URL(settings.instagramUrl);
    if (url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname)) {
      document.querySelectorAll('.instagram-link').forEach((placeholder) => {
        const link = document.createElement('a');
        link.className = placeholder.className;
        link.href = url.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Instagramを見る ↗';
        link.setAttribute('aria-label', 'Instagramを見る（新しいタブ）');
        placeholder.replaceWith(link);
      });
      document.querySelectorAll('.instagram-message').forEach((element) => { element.textContent = '新しいタブでInstagramを開きます。'; });
    }
  } catch { /* An invalid account keeps the clearly labeled preparation state. */ }
}

// Smooth scrolling follows the user's system preference; the site has no autoplay.
function syncMotionPreference() {
  document.documentElement.classList.toggle('reduced-motion', reducedMotion.matches);
}
reducedMotion.addEventListener('change', syncMotionPreference);
syncMotionPreference();
