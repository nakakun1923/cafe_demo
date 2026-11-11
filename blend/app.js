// Caprice ブレンド案（ブラッシュアップ案の構成 × 最初の配色 × Tsukihi の形）。JavaScriptが無効でも、本文と写真はすべて読めます。
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

/* ---- スマホの下の近道：冒頭を過ぎてから出す（最初の写真に重ねない） ---- */
const quickbar = $('.quickbar');
if (quickbar) {
  const toggle = () => quickbar.classList.toggle('is-shown', scrollY > innerHeight * 0.6);
  addEventListener('scroll', toggle, { passive: true });
  toggle();
}

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

/* ---- Capriceの一日：スクロールに合わせて日が暮れていく ----
   「動きを減らす」設定の端末では何もしません（章ごとの背景色のまま表示）。 */
const day = $('.day');
const chapters = $$('.chapter', day || document);
const calm = matchMedia('(prefers-reduced-motion: reduce)');
if (day && chapters.length === 3 && !calm.matches) {
  const tones = [[248, 244, 235], [243, 230, 204], [36, 26, 18]]; // ひる・ごご・よる の地色（紙色 → 生成り → 焦げ茶）
  const dusk = [201, 138, 92]; // ごご→よる の途中で通る夕焼け色（灰色に濁らせないため）
  const names = ['ひる', 'ごご', 'よる'];
  const mix = (from, to, t) => from.map((value, i) => Math.round(value + (to[i] - value) * t));
  const ease = (t) => t * t * (3 - 2 * t);

  const clock = document.createElement('p');
  clock.className = 'day-clock';
  clock.setAttribute('aria-hidden', 'true');
  clock.textContent = names[0];
  chapters[0].before(clock);
  day.classList.add('is-tinted');
  chapters[2].removeAttribute('data-theme'); // 色は .day 全体で切り替えるので、章ごとの指定は外す

  let current = 0;
  let queued = false;
  function update() {
    queued = false;
    const viewport = innerHeight;
    const band = viewport * 0.6; // この高さをかけて、次の章の色へ移る
    let tone = tones[0];
    let active = 0;
    let nightness = 0;
    for (let i = 1; i < chapters.length; i += 1) {
      const top = chapters[i].getBoundingClientRect().top;
      const t = ease(Math.min(1, Math.max(0, (viewport * 0.55 - top + band / 2) / band)));
      if (i === 2) {
        tone = t < 0.5 ? mix(tone, dusk, t * 2) : mix(dusk, tones[2], t * 2 - 1);
        nightness = t;
      } else {
        tone = mix(tone, tones[i], t);
      }
      if (t > 0.5) active = i;
    }
    day.style.setProperty('--day-bg', `rgb(${tone.join(' ')})`);
    const night = nightness > 0.7; // 地が十分暗くなってから、色のテーマを夜（dusk）に
    day.classList.toggle('is-night', night);
    if (night) day.dataset.theme = 'dusk'; else delete day.dataset.theme;
    if (active !== current) {
      current = active;
      clock.classList.add('is-changing');
      setTimeout(() => { clock.textContent = names[current]; clock.classList.remove('is-changing'); }, 300);
    }
  }
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();
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
        const handle = url.pathname.split('/').filter(Boolean)[0];
        link.textContent = handle ? `@${handle}` : 'Instagramを見る';
        element.replaceChildren(link);
      });
      // Instagramの帯と、スマホの近道にも出す
      const handle = url.pathname.split('/').filter(Boolean)[0];
      $$('[data-instagram-link]').forEach((link) => { link.href = url.href; link.hidden = false; });
      $$('[data-instagram-handle]').forEach((element) => { element.textContent = handle ? `@${handle}` : ''; });
      $$('[data-instagram-pending]').forEach((element) => { element.hidden = true; });
    }
  } catch { /* 不正なURLのときは「準備中」のまま */ }
}

// 地図：お店のページ（mapUrl）と検索語（mapQuery）があればそれを、なければ所在地を使う
const mapHosts = ['maps.app.goo.gl', 'goo.gl', 'www.google.com', 'google.com', 'maps.google.com', 'www.google.co.jp'];
let placeUrl = '';
try {
  const url = new URL(settings.mapUrl || '');
  if (url.protocol === 'https:' && mapHosts.includes(url.hostname)) placeUrl = url.href;
} catch { /* 空欄や不正なURLのときは、所在地での検索に戻す */ }
if (settings.mapQuery || settings.address) {
  const query = encodeURIComponent(settings.mapQuery || settings.address);
  const map = $('#map');
  const embed = `https://maps.google.com/maps?q=${query}&output=embed`;
  if (map && map.getAttribute('src') !== embed) map.src = embed;
  const mapLink = $('#map-link');
  if (mapLink) mapLink.href = placeUrl || `https://www.google.com/maps/search/?api=1&query=${query}`;
}
