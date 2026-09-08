(() => {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('site-menu');
  if (!toggle || !menu) return;
  let previousFocus;
  const background = [...document.querySelectorAll('.site-header,main,.site-footer,.mobile-cta')];
  function setOpen(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
    background.forEach(el => { el.inert = open; });
    if (open) {
      previousFocus = document.activeElement;
      menu.querySelector('.menu-close').focus();
    } else if (previousFocus) previousFocus.focus();
  }
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  menu.querySelector('.menu-close').addEventListener('click', () => setOpen(false));
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
    if (event.key !== 'Tab') return;
    const items = [...menu.querySelectorAll('button,a[href]')].filter(el => el.getClientRects().length);
    const first = items[0], last = items[items.length-1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
