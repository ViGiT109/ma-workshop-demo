/* One decorative assembly. Content and product photographs stay visible. */
const composition = document.querySelector('.hero-composition');
if (composition && typeof Element.prototype.animate === 'function') {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const animations = [];
  if (!reducedMotion.matches) {
    const offsets = { left: 'translateX(-18px)', right: 'translateX(16px)', bottom: 'translateY(16px)' };
    composition.querySelectorAll('[data-assemble]').forEach((piece, index) => {
      animations.push(piece.animate(
        [{ transform: offsets[piece.dataset.assemble] }, { transform: 'translate(0, 0)' }],
        { duration: 680, delay: index * 65, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'backwards' }
      ));
    });
    const thread = composition.querySelector('.hero-thread');
    if (thread) animations.push(thread.animate(
      [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
      { duration: 520, delay: 480, easing: 'ease-in-out', fill: 'backwards' }
    ));
  }
  reducedMotion.addEventListener('change', event => {
    if (event.matches) animations.forEach(animation => animation.finish());
  });
}
