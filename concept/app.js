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
const heroLabels = ['テーブルを囲んで会話を楽しむ人たちのイメージ', '主菜と野菜、ごはん、汁物を並べたランチのイメージ', '木のテーブルと落ち着いた色の椅子が並ぶ店内イメージ'];
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
    timer = setTimeout(() => changeSlide(1), 8500);
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
  { label: 'EVERYDAY MEAL', title: 'ちゃんと食べて、\nほっとする。', description: '栄養のバランスにも、お財布にも気を配って。日々の食事として選びやすいごはんを目指しています。', tag: 'DAILY LUNCH / イメージ', image: 'lunch', alt: '主菜と野菜の副菜、ごはん、汁物を並べたランチのイメージ', detail: 'lunch' },
  { label: 'YOUR LITTLE BREAK', title: 'ひと息の、\nいつもの一杯。', description: 'ひとりで気持ちをゆるめる時間にも、同僚と話す時間にも。日々のひと休みに寄り添う一杯を。', tag: 'COFFEE BREAK / イメージ', image: 'coffee', alt: '陶器のカップに注がれたコーヒーのイメージ', detail: 'coffee' },
  { label: 'A LITTLE SWEET', title: '午後に、\n小さな甘い時間。', description: '仕事の合間も、なんでもない日も。少し甘いものと一緒に、肩の力を抜くひと休みを。', tag: 'SWEET MOMENT / イメージ', image: 'cheesecake', alt: '焼き色のついたチーズケーキのイメージ', detail: 'cheesecake' },
];
let pickIndex = 0;
let pickTransition = 0;
async function changePick(direction) {
  pickIndex = (pickIndex + direction + picks.length) % picks.length;
  const pick = picks[pickIndex];
  const transition = ++pickTransition;
  const visual = $('.pickup-visual');
  const text = $('#pickup-text');
  const nextImage = new Image();
  nextImage.src = `../assets/${pick.image}.jpg`;
  if (!reducedMotion.matches) {
    visual?.classList.add('is-changing'); text?.classList.add('is-changing');
    await Promise.all([
      new Promise((resolve) => setTimeout(resolve, 280)),
      Promise.race([nextImage.decode().catch(() => {}), new Promise((resolve) => setTimeout(resolve, 1500))]),
    ]);
  }
  if (transition !== pickTransition) return;
  $('#pickup-image').src = `../assets/${pick.image}.jpg`;
  $('#pickup-image').alt = pick.alt;
  $('#pickup-label').textContent = pick.label;
  $('#pickup-title').textContent = pick.title;
  $('#pickup-description').textContent = pick.description;
  $('#pickup-tag').textContent = pick.tag;
  $('#pickup-detail').dataset.detail = pick.detail;
  $('#pickup-count').innerHTML = `0${pickIndex + 1} <span class="muted">— 03</span>`;
  $('#pickup-count').setAttribute('aria-label', `3件中${pickIndex + 1}件目`);
  requestAnimationFrame(() => { visual?.classList.remove('is-changing'); text?.classList.remove('is-changing'); });
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
  lunch: { title: '日替わりごはん', label: 'LUNCH', image: 'lunch', alt: '主菜と野菜の副菜、ごはん、汁物を並べたランチのイメージ', description: '主菜と野菜の副菜、ごはん、汁物を並べたプレートは、私たちが目指す日々のごはんのイメージです。適度にお腹を満たせて、栄養のバランスにも、お財布にも気を配る。「近くにちょうどいいお店があって助かる」と思ってもらえるごはんを目指しています。' },
  coffee: { title: 'コーヒー', label: 'COFFEE', image: 'coffee', alt: '陶器のカップに注がれたコーヒーのイメージ', description: 'ひとりで気持ちをゆるめる時間にも、同僚と話す時間にも。日々のひと休みに寄り添う一杯をイメージしました。具体的な豆や淹れ方、提供内容は準備中です。' },
  cheesecake: { title: 'チーズケーキ', label: 'SWEETS', image: 'cheesecake', alt: '焼き色のついたチーズケーキのイメージ', description: '少し甘いものと一緒に、肩の力を抜くひと休みを。写真は、気楽に過ごす午後の時間をイメージしたものです。実際のスイーツの種類や提供内容は、決まり次第ご案内します。' },
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
  const note = '<p class="detail-note">写真・メニューはデモ用のイメージです。実際の提供内容・価格・食材やアレルギーに関する情報は未確定です。</p>';
  if (products[key]) {
    const product = products[key];
    dialogContent.innerHTML = `<img class="detail-photo" src="../assets/${product.image}.jpg" alt="${product.alt}"><div class="detail-body"><p class="eyebrow">${product.label}</p><h2 id="dialog-title">${product.title}</h2><p>${product.description}</p>${note}</div>`;
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
$('.dialog-close').addEventListener('click', () => closeDialog(dialog));
dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) closeDialog(dialog);
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
  $('#catalog-count').textContent = `${catalogItems.filter((item) => !item.hidden).length}件のメニューイメージ`;
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
    $('#gallery-full-caption').textContent = photo.alt;
    requestAnimationFrame(() => galleryImage.classList.remove('is-changing'));
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
    $('.map-note').textContent = '地図は指定住所をもとに表示しています。';
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

