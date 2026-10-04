/* Motion follows scrolling; product photographs and text keep their geometry. */
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const scene = document.querySelector('[data-stitch-scene]');
  const sceneInner = scene?.querySelector('.stitch-scene-inner');
  const board = scene?.querySelector('.patchwork-board');
  const hero = document.querySelector('.hero');
  const heroBoard = hero?.querySelector('.hero-board');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const chapterLinks = [...document.querySelectorAll('.chapter-links a')];
  const progressLine = document.querySelector('.chapter-progress');
  const activeAnimations = new Set();
  let frame = 0;
  let observer;
  let textObserver;
  const enteredTexts = new WeakSet();
  const textTargets = new Map();
  document.querySelectorAll('.hero-copy, .stitch-copy, .section-head, .card-copy, .set-copy, .workshop-copy, .page-intro, .detail-copy, .steps li, main > .narrow').forEach(group => {
    group.querySelectorAll('h1, h2, h3, p').forEach((text, index) => {
      if (!text.matches('.gallery-caption, .gallery-note, .form-result') && text.textContent.trim())
        textTargets.set(text, Math.min(index * 70, 180));
    });
  });
  let entered = false;
  const clamp = value => Math.min(1, Math.max(0, value));
  const rules = [...document.querySelectorAll('main > section:not(.hero):not(.stitch-scene), .footer')].map(section => {
    const rule = document.createElement('span');
    rule.className = 'seam-rule';
    rule.setAttribute('aria-hidden', 'true');
    section.classList.add('seamed-section');
    section.prepend(rule);
    return rule;
  });
  function animate(element, keyframes, options) {
    if (!element || reducedMotion.matches || typeof element.animate !== 'function') return;
    const animation = element.animate(keyframes, options);
    activeAnimations.add(animation);
    animation.finished.then(() => activeAnimations.delete(animation), () => activeAnimations.delete(animation));
  }
  function entrance() {
    if (entered || !heroBoard || reducedMotion.matches) return;
    entered = true;
    const distance = window.matchMedia('(max-width: 1100px)').matches ? 16 : 36;
    const offsets = {left: `translateX(-${distance}px)`, right: `translateX(${distance}px)`, bottom: 'translateY(32px)'};
    heroBoard.querySelectorAll('[data-assemble]').forEach((piece, index) => {
      animate(piece, [{transform: offsets[piece.dataset.assemble]}, {transform: 'translate(0,0)'}],
        {duration: 950, delay: index * 110, easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'backwards'});
    });
    animate(heroBoard.querySelector('.hero-thread'), [{clipPath: 'inset(0 100% 0 0)'}, {clipPath: 'inset(0 0 0 0)'}],
      {duration: 800, delay: 700, easing: 'ease-in-out', fill: 'backwards'});
  }
  function update() {
    frame = 0;
    if (document.hidden) return;
    const height = window.innerHeight;
    const sceneRect = scene?.getBoundingClientRect();
    const sceneInnerRect = sceneInner?.getBoundingClientRect();
    const scenePin = sceneInner ? parseFloat(getComputedStyle(sceneInner).top) || 0 : 0;
    const heroRect = hero?.getBoundingClientRect();
    const chapterRects = chapters.map(chapter => chapter.getBoundingClientRect());
    const pageRange = Math.max(1, root.scrollHeight - height);
    const pageProgress = clamp(window.scrollY / pageRange);
    let selected = -1;
    chapterRects.forEach((rect, index) => { if (rect.top <= height * .42) selected = index; });
    chapterLinks.forEach(link => {
      if (link.hash === '#' + chapters[selected]?.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    progressLine?.style.setProperty('--reading-progress', pageProgress.toFixed(4));
    if (reducedMotion.matches) return;
    if (sceneRect && board && sceneRect.bottom > 0 && sceneRect.top < height) {
      // Finish at the sticky release: the next section is already at the bottom edge.
      const progress = clamp((scenePin - sceneRect.top) / Math.max(1, sceneRect.height - sceneInnerRect.height));
      const assembly = clamp(progress / .62);
      const stitching = clamp((progress - .62) / .38);
      board.style.setProperty('--spread', Math.pow(1 - assembly, 2).toFixed(4));
      board.style.setProperty('--vertical-stitch', clamp(stitching * 2).toFixed(4));
      board.style.setProperty('--horizontal-stitch', clamp(stitching * 2 - 1).toFixed(4));
    }
    if (heroRect && heroBoard && heroRect.bottom > 0) {
      heroBoard.style.setProperty('--hero-drift', (clamp(-heroRect.top / Math.max(1, heroRect.height)) * Math.min(24, heroRect.left * .6)).toFixed(2) + 'px');
    }
  }
  function requestUpdate() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(update);
  }
  function configure() {
    observer?.disconnect();
    textObserver?.disconnect();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    activeAnimations.forEach(animation => animation.cancel());
    activeAnimations.clear();
    root.classList.toggle('motion-enabled', !reducedMotion.matches);
    board?.removeAttribute('style');
    heroBoard?.style.removeProperty('--hero-drift');
    if (reducedMotion.matches) rules.forEach(rule => rule.classList.add('is-drawn'));
    else if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
            observer.unobserve(entry.target);
          }
        });
      }, {rootMargin: '0px 0px -8% 0px', threshold: 0});
      rules.forEach(rule => {rule.classList.remove('is-drawn'); observer.observe(rule);});
    } else rules.forEach(rule => rule.classList.add('is-drawn'));
    if (!reducedMotion.matches && 'IntersectionObserver' in window) {
      textObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || enteredTexts.has(entry.target)) return;
          const text = entry.target;
          enteredTexts.add(text);
          textObserver.unobserve(text);
          animate(text, [{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}],
            {duration: 600, delay: textTargets.get(text), easing: 'cubic-bezier(.2,.65,.25,1)', fill: 'backwards'});
        });
      }, {rootMargin: '0px 0px -6% 0px', threshold: 0});
      textTargets.forEach((delay, text) => {if (!enteredTexts.has(text)) textObserver.observe(text);});
    }
    requestUpdate();
    entrance();
  }
  const pendingLoads = new WeakMap();
  const galleryObserver = new MutationObserver(records => {
    records.forEach(record => {
      if (record.oldValue === record.target.getAttribute('src')) return;
      const image = record.target;
      const previous = pendingLoads.get(image);
      if (previous) image.removeEventListener('load', previous);
      pendingLoads.delete(image);
      const ready = () => {
        pendingLoads.delete(image);
        animate(image, [{opacity: .45}, {opacity: 1}], {duration: 220, easing: 'ease-out'});
      };
      if (image.complete) ready();
      else {pendingLoads.set(image, ready); image.addEventListener('load', ready, {once: true});}
    });
  });
  document.querySelectorAll('.detail-image, .viewer-image').forEach(image => {
    galleryObserver.observe(image, {attributes: true, attributeFilter: ['src'], attributeOldValue: true});
  });
  window.addEventListener('scroll', requestUpdate, {passive: true});
  window.addEventListener('resize', requestUpdate, {passive: true});
  window.addEventListener('pageshow', requestUpdate);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && frame) {cancelAnimationFrame(frame); frame = 0;}
    else requestUpdate();
  });
  reducedMotion.addEventListener('change', configure);
  configure();
})();
