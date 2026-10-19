(() => {
  'use strict';
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduce.matches;
  let observer;
  const animate = () => {
    if (paused || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.09 });
    document.querySelectorAll('.reveal, .photo-reveal').forEach(el => observer.observe(el));
    root.classList.add('enhanced');
  };
  animate();
  const toggle = document.querySelector('.motion-toggle');
  const setMotion = value => {
    paused = value; root.classList.toggle('paused', value);
    toggle.setAttribute('aria-pressed', String(value));
    toggle.setAttribute('aria-label', value ? 'Включить анимацию' : 'Остановить анимацию');
    toggle.textContent = value ? '▶' : 'Ⅱ';
  };
  setMotion(paused);
  toggle.addEventListener('click', () => setMotion(!paused));
  reduce.addEventListener('change', event => { setMotion(event.matches); if (event.matches) observer?.disconnect(); else animate(); });

  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navigation');
  const closeMenu = () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Открыть меню'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('open',open); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && nav.classList.contains('open')){closeMenu();menu.focus();}});

  const card = document.querySelector('[data-tilt]');
  card.addEventListener('animationend', () => { card.style.animation = 'none'; }, { once: true });
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let frame;
    card.addEventListener('pointermove', event => {
      if (paused) return;
      const box = card.getBoundingClientRect();
      const x = (event.clientX-box.left)/box.width-.5;
      const y = (event.clientY-box.top)/box.height-.5;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(()=>{card.style.transform=`perspective(1000px) rotateY(${x*5}deg) rotateX(${-y*4}deg) rotate(4deg)`;});
    });
    card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);card.style.transform='';});
  }

  const gallery = [...document.querySelectorAll('.gallery-photo')];
  const dialog = document.querySelector('.lightbox');
  const photo = dialog.querySelector('.lightbox-image');
  const caption = dialog.querySelector('.lightbox-caption');
  const count = dialog.querySelector('.lightbox-count');
  let index=0, opener;
  const show = i => { index=(i+gallery.length)%gallery.length; const item=gallery[index];photo.src=item.dataset.full;photo.alt=item.querySelector('img').alt;caption.textContent=item.dataset.caption;count.textContent=`${index+1} / ${gallery.length}`; };
  gallery.forEach((item,i)=>item.addEventListener('click',()=>{opener=item;show(i);if(typeof dialog.showModal==='function')dialog.showModal();else window.open(item.dataset.full,'_blank','noopener');}));
  dialog.querySelector('.lightbox-close').addEventListener('click',()=>dialog.close());
  dialog.querySelector('.lightbox-prev').addEventListener('click',()=>show(index-1));
  dialog.querySelector('.lightbox-next').addEventListener('click',()=>show(index+1));
  dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>opener?.focus());
})();
