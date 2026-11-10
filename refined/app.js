// Caprice ブラッシュアップ案。JavaScriptが無効でも、本文と写真はすべて読めます。
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/* ---- ナビゲーション（スマホ） ---- */
const navToggle = $('.nav-toggle');
const nav = $('#site-nav');
function setNav(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'ナビゲーションを閉じる' : 'ナビゲーションを開く');
  nav.classList.toggle('is-open', open);
}
navToggle.addEventListener('click', () => setNav(navToggle.getAttribute('aria-expanded') !== 'true'));
nav.addEventListener('click', (event) => { if (event.target.closest('a')) setNav(false); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') { setNav(false); navToggle.focus(); }
});

/* ---- 写真の拡大 ---- */
const dialog = $('#zoom-dialog');
if (dialog) {
  let opener = null;
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-zoom]');
    if (!trigger) return;
    const photo = $('img', trigger);
    opener = trigger;
    $('#zoom-image').src = photo.currentSrc || photo.src;
    $('#zoom-image').alt = photo.alt;
    $('#zoom-caption').textContent = trigger.dataset.caption || photo.alt;
    $('#zoom-note').textContent = trigger.dataset.note || '';
    $('#zoom-note').hidden = !trigger.dataset.note;
    dialog.showModal();
  });
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  // 写真の外側（背景）を押したら閉じる
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus(); });
}

/* ---- site-settings.js の内容を反映 ---- */
const settings = window.CAPRICE_SETTINGS || {};
const fill = (key, value) => {
  if (!value) return;
  $$(`[data-setting="${key}"]`).forEach((element) => { element.textContent = value; });
};
['address', 'hours', 'closed', 'parking'].forEach((key) => fill(key, settings[key]));

if (settings.phone) {
  $$('[data-setting="phone"]').forEach((element) => {
    const link = document.createElement('a');
    link.href = `tel:${settings.phone.replace(/[^\d+]/g, '')}`;
    link.textContent = settings.phone;
    element.replaceChildren(link);
  });
}

if (settings.instagramUrl) {
  try {
    const url = new URL(settings.instagramUrl);
    if (url.protocol === 'https:' && ['instagram.com', 'www.instagram.com'].includes(url.hostname)) {
      $$('[data-setting="instagram"]').forEach((element) => {
        const link = document.createElement('a');
        link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer';
        link.textContent = 'Instagramを見る';
        element.replaceChildren(link);
      });
    }
  } catch { /* 不正なURLのときは「準備中」のまま */ }
}

if (settings.address) {
  const query = encodeURIComponent(settings.address);
  const map = $('#map');
  const embed = `https://maps.google.com/maps?q=${query}&output=embed`;
  if (map && map.getAttribute('src') !== embed) map.src = embed;
  const mapLink = $('#map-link');
  if (mapLink) mapLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
}
