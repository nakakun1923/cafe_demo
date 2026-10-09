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

const products = {
  lunch: { title: 'ひるごはん', label: 'ランチ', image: 'lunch', alt: '主菜と野菜の副菜、ごはん、汁物を並べたランチのイメージ', description: '主菜と|野菜の|副菜、|ごはん、|汁物を|並べた|お盆は、|出したい|ごはんの|イメージです。|おなかいっぱいに|なって、|毎日来ても|困らない|値段に|したいと|思っています。' },
  coffee: { title: 'コーヒー', label: 'コーヒー', image: 'coffee', alt: '湯気の立つコーヒーを白いカップで出した、カフェの席のイメージ', description: 'ゆっくり|話したい日も、|ひとりで|少し|休みたい日も、|気軽に|頼める|一杯に|したいです。' },
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

// iOS only fires :active when some touch listener exists.
document.addEventListener('touchstart', () => {}, { passive: true });

const root = document.documentElement;
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  root.classList.add('js-motion');
  window.__capriceMotion = true;
  // Hero: start once the photo is ready (or after 1.2s at most), so the settle is not played on a blank frame.
  const heroImage = $('.hero-photo img');
  const heroGo = () => requestAnimationFrame(() => root.classList.add('hero-go'));
  if (!heroImage || heroImage.complete) heroGo();
  else { heroImage.addEventListener('load', heroGo, { once: true }); heroImage.addEventListener('error', heroGo, { once: true }); setTimeout(heroGo, 1200); }

  const show = (element) => {
    if (element.classList.contains('visible')) return;
    element.classList.add('visible');
    if (element.classList.contains('tl-time')) element.closest('.tl-item')?.classList.add('icons-on');
    setTimeout(() => element.classList.add('done'), 2600);
  };
  let observerFired = false;
  const revealObserver = new IntersectionObserver((entries) => {
    observerFired = true;
    entries.forEach((entry) => {
      if (entry.isIntersecting) { show(entry.target); revealObserver.unobserve(entry.target); }
    });
  }, { threshold: 0.15 });
  const targets = [...document.querySelectorAll('.reveal')];
  targets.forEach((element) => revealObserver.observe(element));

  // The scroll sweep is the main trigger for clipped photos (a fully clipped target may never "intersect") and a safety net for the rest:
  // anything at or above ~85% of the viewport height (on screen or already scrolled past) is shown.
  const sweep = () => targets.forEach((element) => {
    if (!element.classList.contains('visible') && element.getBoundingClientRect().top < innerHeight * 0.85) show(element);
  });
  requestAnimationFrame(sweep);
  let sweepQueued = false;
  const queueSweep = () => { if (sweepQueued) return; sweepQueued = true; requestAnimationFrame(() => { sweepQueued = false; sweep(); }); };
  addEventListener('scroll', queueSweep, { passive: true });
  addEventListener('resize', queueSweep);
  setTimeout(() => { if (!observerFired) targets.forEach(show); sweep(); }, 3000);
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
    const mapNote = $('.map-note'); if (mapNote) mapNote.innerHTML = phrases('地図は|住所を|もとに|表示しています。');
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

