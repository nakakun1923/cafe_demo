const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const navToggle = $('.nav-toggle');
const navigation = $('#navigation');
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

const hero = $('.hero');
const slides = [...document.querySelectorAll('.hero-image')];
const heroLabels = ['焼きたてのクロワッサンとコーヒー', '栗のモンブランとカフェラテ', 'クロワッサンを並べるパン職人の手元'];
const pause = $('#hero-pause');
const progress = $('#hero-progress');
let slideIndex = 0;
let autoplay = !reducedMotion.matches;
let timer;
let heroVisible = true;
let hovering = false;
let focusWithin = false;
function scheduleSlide() {
  if (!hero) return;
  clearTimeout(timer);
  progress.classList.remove('playing');
  // Reset the progress clock together with the slide timer, including after tab changes.
  void progress.offsetWidth;
  if (autoplay && heroVisible && !hovering && !focusWithin && !document.hidden && !document.querySelector('dialog[open]')) {
    progress.classList.add('playing');
    timer = setTimeout(() => changeSlide(1), 6500);
  }
}
function updatePause() {
  pause.setAttribute('aria-label', autoplay ? 'スライドの自動再生を停止' : 'スライドの自動再生を開始');
  pause.firstElementChild.textContent = autoplay ? 'Ⅱ' : '▷';
}
function changeSlide(direction, announce = false) {
  slideIndex = (slideIndex + direction + slides.length) % slides.length;
  slides.forEach((slide, index) => slide.classList.toggle('active', index === slideIndex));
  $('#hero-count').innerHTML = `0${slideIndex + 1} <span class="muted">/ 03</span>`;
  if (announce) $('#hero-status').textContent = `${slideIndex + 1} / 3：${heroLabels[slideIndex]}`;
  scheduleSlide();
}
if (hero) {
$('#hero-prev').addEventListener('click', () => changeSlide(-1, true));
$('#hero-next').addEventListener('click', () => changeSlide(1, true));
pause.addEventListener('click', () => { autoplay = !autoplay; updatePause(); scheduleSlide(); });
hero.addEventListener('mouseenter', () => { hovering = true; scheduleSlide(); });
hero.addEventListener('mouseleave', () => { hovering = false; scheduleSlide(); });
hero.addEventListener('focusin', () => { focusWithin = true; scheduleSlide(); });
hero.addEventListener('focusout', (event) => {
  if (!hero.contains(event.relatedTarget)) { focusWithin = false; scheduleSlide(); }
});
document.addEventListener('visibilitychange', scheduleSlide);
reducedMotion.addEventListener('change', () => { autoplay = !reducedMotion.matches; updatePause(); scheduleSlide(); });
new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; scheduleSlide(); }).observe(hero);
updatePause();
scheduleSlide();
}

const picks = [
  { label: 'SEASONAL MENU', title: '秋のひと休みに。', description: '栗の甘さに、コーヒーの香りを添えて。', tag: 'AUTUMN SPECIAL', image: 'seasonal', alt: '栗のモンブランとカフェラテ', detail: 'seasonal' },
  { label: 'BAKERY & COFFEE', title: '朝は、焼きたてから。', description: 'さくっと、ふわっと。お気に入りの一杯と。', tag: 'GOOD MORNING', image: 'hero', alt: '焼きたてのクロワッサンとコーヒー', detail: 'bakery' },
  { label: 'OUR DAILY BREAD', title: 'ひとつずつ、丁寧に。', description: '香ばしい焼き色と、バターのやさしい香り。', tag: 'FRESH FROM THE OVEN', image: 'story', alt: 'パン職人がクロワッサンを並べる手元', detail: 'bakery' },
];
let pickIndex = 0;
function changePick(direction) {
  pickIndex = (pickIndex + direction + picks.length) % picks.length;
  const pick = picks[pickIndex];
  $('#pickup-image').src = `assets/${pick.image}.jpg`;
  $('#pickup-image').alt = pick.alt;
  $('#pickup-label').textContent = pick.label;
  $('#pickup-title').textContent = pick.title;
  $('#pickup-description').textContent = pick.description;
  $('#pickup-tag').textContent = pick.tag;
  $('#pickup-detail').dataset.detail = pick.detail;
  $('#pickup-count').innerHTML = `0${pickIndex + 1} <span class="muted">— 03</span>`;
  $('#pickup-count').setAttribute('aria-label', `3件中${pickIndex + 1}件目`);
}
$('#pickup-prev')?.addEventListener('click', () => changePick(-1));
$('#pickup-next')?.addEventListener('click', () => changePick(1));
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
enableSwipe(hero, (direction) => changeSlide(direction, true));
enableSwipe($('.pickup-visual'), changePick);

const products = {
  coffee: { title: 'いつものブレンド', label: 'COFFEE', image: 'coffee', alt: '陶器のカップに注がれたブレンドコーヒー', description: 'ひと口目は香ばしく、あと味はすっきり。パンにもスイーツにも合わせたくなる、毎日の一杯。湯気と一緒に立ちのぼる香りを、ゆっくり楽しんで。', sub: '香ばしく、すっきりとしたあと味' },
  bakery: { title: 'バタークロワッサン', label: 'BAKERY', image: 'hero', alt: '香ばしく焼き上がったクロワッサン', description: '幾重にも重なった、さくさくの層。中はふんわり、バターの香りが広がります。朝のコーヒーにも、午後の小腹がすいた時間にも。', sub: 'バターの香りと、さくさくの食感' },
  seasonal: { title: '栗のモンブラン', label: 'AUTUMN SPECIAL', image: 'seasonal', alt: '栗のクリームを絞ったモンブラン', description: 'なめらかな栗のクリームに、香ばしい土台を合わせて。栗のやさしい甘さとコーヒーのほろ苦さを、一緒にゆっくり楽しむ秋のひと皿です。', sub: '季節のスイーツ' },
  cheesecake: { title: 'ベイクドチーズケーキ', label: 'SWEETS', image: 'cheesecake', alt: 'こんがり焼き色のついたチーズケーキ', description: 'しっとり濃厚なチーズのコクと、こんがり焼けた表面の香ばしさ。少しずつ味わいたくなる、午後のコーヒーによく合うケーキです。', sub: 'しっとり濃厚、ほどよい甘さ' },
};
const dialog = $('#detail-dialog');
const dialogContent = $('#dialog-content');
let opener = null;
function showDetail(key) {
  if (!dialog.open) opener = document.activeElement;
  const note = '<p class="detail-note">掲載メニュー・写真はデモ用のイメージです。実際の提供内容・価格は準備中です。</p>';
  if (products[key]) {
    const product = products[key];
    dialogContent.innerHTML = `<img class="detail-photo" src="assets/${product.image}.jpg" alt="${product.alt}"><div class="detail-body"><p class="eyebrow">${product.label}</p><h2 id="dialog-title">${product.title}</h2><p>${product.description}</p>${note}</div>`;
  } else return;
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  document.body.classList.add('modal-open');
  $('.dialog-close').focus();
  scheduleSlide();
}
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-detail]');
  if (trigger) showDetail(trigger.dataset.detail);
});
$('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (opener?.isConnected) opener.focus();
  scheduleSlide();
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

// Menu page filtering keeps the initial HTML useful even without JavaScript.
const categoryButtons = [...document.querySelectorAll('[data-category]')];
const catalogItems = [...document.querySelectorAll('[data-product-category]')];
categoryButtons.forEach((button) => button.addEventListener('click', () => {
  const category = button.dataset.category;
  categoryButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  catalogItems.forEach((item) => { item.hidden = category !== 'all' && item.dataset.productCategory !== category; });
  $('#catalog-count').textContent = `${catalogItems.filter((item) => !item.hidden).length}品のメニュー`;
}));

const galleryTrack = $('#gallery-track');
if (galleryTrack) {
  const galleryButtons = [...galleryTrack.querySelectorAll('[data-gallery]')];
  const galleryDialog = $('#gallery-dialog');
  const galleryImage = $('#gallery-full-image');
  const left = $('#gallery-scroll-prev');
  const right = $('#gallery-scroll-next');
  let galleryIndex = 0;
  let galleryOpener;
  function setGalleryPhoto(index) {
    galleryIndex = (index + galleryButtons.length) % galleryButtons.length;
    const photo = galleryButtons[galleryIndex].querySelector('img');
    $('#gallery-error').hidden = true;
    galleryImage.src = photo.src;
    galleryImage.alt = photo.alt;
    $('#gallery-counter').textContent = `${String(galleryIndex + 1).padStart(2, '0')} / ${String(galleryButtons.length).padStart(2, '0')}`;
    $('#gallery-full-caption').textContent = photo.alt;
  }
  function updateGalleryArrows() {
    left.disabled = galleryTrack.scrollLeft < 2;
    right.disabled = galleryTrack.scrollLeft + galleryTrack.clientWidth >= galleryTrack.scrollWidth - 2;
  }
  left.addEventListener('click', () => galleryTrack.scrollBy({ left: -galleryTrack.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
  right.addEventListener('click', () => galleryTrack.scrollBy({ left: galleryTrack.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
  galleryTrack.addEventListener('scroll', updateGalleryArrows, { passive: true });
  new ResizeObserver(updateGalleryArrows).observe(galleryTrack);
  galleryButtons.forEach((button, index) => button.addEventListener('click', () => {
    galleryOpener = button;
    setGalleryPhoto(index);
    galleryDialog.showModal();
    document.body.classList.add('modal-open');
    $('#gallery-close').focus();
    scheduleSlide();
  }));
  $('#gallery-prev').addEventListener('click', () => setGalleryPhoto(galleryIndex - 1));
  $('#gallery-next').addEventListener('click', () => setGalleryPhoto(galleryIndex + 1));
  $('#gallery-close').addEventListener('click', () => galleryDialog.close());
  galleryImage.addEventListener('error', () => { $('#gallery-error').hidden = false; });
  galleryDialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); setGalleryPhoto(galleryIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  galleryDialog.addEventListener('click', (event) => {
    const rect = galleryDialog.getBoundingClientRect();
    if (event.target === galleryDialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) galleryDialog.close();
  });
  galleryDialog.addEventListener('close', () => {
    document.body.classList.remove('modal-open');
    galleryOpener?.focus();
    scheduleSlide();
  });
  enableSwipe(galleryImage, (direction) => setGalleryPhoto(galleryIndex + direction));
  updateGalleryArrows();
}

const settings = window.CAPRICE_SETTINGS || {};
if (settings.address) document.querySelectorAll('[data-address]').forEach((element) => { element.textContent = settings.address; });
if (settings.hours) document.querySelectorAll('[data-hours]').forEach((element) => { element.textContent = settings.hours; });
const map = $('#access-map');
if (map && settings.mapEmbedUrl) {
  if (map.src !== settings.mapEmbedUrl) map.src = settings.mapEmbedUrl;
  if (!settings.mapIsPlaceholder) {
    map.title = 'cafe&BAR Caprice アクセスマップ';
    $('.map-note').textContent = settings.address || '地図で所在地をご確認ください。';
    $('.map-fallback a').href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address || 'cafe&BAR Caprice')}`;
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
      const message = $('.instagram-action p');
      if (message) message.textContent = '新しいタブでInstagramを開きます。';
    }
  } catch { /* Invalid or unset account keeps the clearly labeled preparation state. */ }
}
