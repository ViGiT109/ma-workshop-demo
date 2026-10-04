for (const gallery of document.querySelectorAll('[data-photo-gallery]')) {
  const image = gallery.querySelector('.detail-image');
  const full = gallery.querySelector('.gallery-full');
  const caption = gallery.querySelector('.gallery-caption');
  const links = gallery.querySelectorAll('.gallery-thumb');
  for (const link of links) link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    image.src = link.href;
    image.alt = link.querySelector('img').alt;
    image.removeAttribute('width');
    image.removeAttribute('height');
    full.href = link.href;
    caption.textContent = link.dataset.caption;
    for (const other of links) other.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'true');
  });
}
