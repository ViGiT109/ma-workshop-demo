for (const gallery of document.querySelectorAll('[data-photo-gallery]')) {
  const image = gallery.querySelector('.detail-image');
  const full = gallery.querySelector('.gallery-full');
  const caption = gallery.querySelector('.gallery-caption');
  const links = [...gallery.querySelectorAll('.gallery-thumb')];
  const photos = links.length ? links.map(link => ({
    src: link.href, alt: link.querySelector('img').alt, caption: link.dataset.caption,
  })) : [{ src: full.href, alt: image.alt, caption: caption.textContent }];
  const dialog = gallery.querySelector('.photo-viewer');
  const largeImage = dialog.querySelector('.viewer-image');
  image.draggable = largeImage.draggable = false;
  const counter = gallery.querySelector('.gallery-count');
  let index = 0;
  function show(next) {
    index = (next + photos.length) % photos.length;
    const photo = photos[index];
    image.src = photo.src;
    image.alt = photo.alt;
    full.href = photo.src;
    caption.textContent = photo.caption;
    largeImage.src = photo.src;
    largeImage.alt = photo.alt;
    dialog.querySelector('.viewer-caption').textContent = photo.caption;
    counter.textContent = dialog.querySelector('.viewer-count').textContent = `${index + 1} / ${photos.length}`;
    links.forEach((link, n) => {
      if (n === index) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }
  function ordinaryClick(event) {
    return !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0;
  }
  links.forEach((link, n) => link.addEventListener('click', event => {
    if (!ordinaryClick(event)) return;
    event.preventDefault();
    show(n);
  }));
  for (const [selector, direction] of [['.gallery-prev', -1], ['.gallery-next', 1], ['.viewer-prev', -1], ['.viewer-next', 1]]) {
    const button = gallery.querySelector(selector);
    button.hidden = photos.length < 2;
    button.addEventListener('click', () => show(index + direction));
  }
  counter.hidden = photos.length < 2;
  full.addEventListener('click', event => {
    if (!ordinaryClick(event) || typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    show(index);
    dialog.showModal();
    document.body.classList.add('photo-viewer-open');
  });
  dialog.querySelector('.viewer-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('photo-viewer-open'));
  gallery.addEventListener('keydown', event => {
    if (photos.length < 2 || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    show(index + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  for (const stage of [gallery.querySelector('.gallery-stage'), dialog.querySelector('.viewer-stage')]) {
    let start = null;
    let swiped = false;
    stage.addEventListener('pointerdown', event => {
      start = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY } : null;
      swiped = false;
    });
    stage.addEventListener('pointerup', event => {
      if (!start || !event.isPrimary || photos.length < 2) { start = null; return; }
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        show(index + (dx < 0 ? 1 : -1));
        swiped = true;
        setTimeout(() => { swiped = false; }, 400);
      }
    });
    stage.addEventListener('pointercancel', () => { start = null; });
    stage.addEventListener('click', event => {
      if (swiped) { event.preventDefault(); event.stopPropagation(); swiped = false; }
    }, true);
  }
  show(0);
}
