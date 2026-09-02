(function () {
  document.documentElement.classList.add("has-js");
  var auditStyle = document.createElement("style");
  auditStyle.setAttribute("data-production-polish", "v4.2");
  auditStyle.textContent = '.home .site-header{position:fixed;left:0;right:0;background:linear-gradient(180deg,rgba(23,23,20,.82) 0%,rgba(23,23,20,.20) 72%,transparent 100%);border:0;transition:background .28s ease,border-color .28s ease,backdrop-filter .28s ease,min-height .28s ease}.home .site-header.is-scrolled{background:rgba(23,23,20,.94);border-bottom:1px solid rgba(243,239,230,.12);backdrop-filter:blur(12px);min-height:88px}.home .site-header.is-scrolled .brand img{height:72px}.airless-story .airless-stage::after{content:"";position:absolute;inset:0;z-index:6;pointer-events:none;background:linear-gradient(90deg,rgba(23,23,20,.74) 0%,rgba(23,23,20,.55) 24%,rgba(23,23,20,.18) 48%,rgba(23,23,20,0) 72%)}.airless-story .hero-intro::before{display:none!important}.review-grid.review-editorial{grid-template-columns:1.4fr .9fr;gap:0 64px}@media(max-width:900px){.home .site-header{position:fixed;background:linear-gradient(180deg,rgba(23,23,20,.88),transparent)}.home .site-header.is-scrolled .brand img{height:58px}.airless-story .airless-stage::after{background:linear-gradient(180deg,rgba(23,23,20,.74) 0%,rgba(23,23,20,.38) 34%,rgba(23,23,20,.08) 62%,rgba(23,23,20,.20) 100%)}.review-grid.review-editorial{grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}}@media(max-width:680px){.review-grid.review-editorial{grid-template-columns:1fr;gap:0}}@media(max-width:580px){.airless-story .hero-cta-block{display:none}.airless-story .airless-before img{transform:scale(1.58);transform-origin:42% 10%}.airless-story .airless-base img,.airless-story .airless-reveal{transform:scale(1.58);transform-origin:30% 16%}.airless-story .airless-scene{background-size:auto 158%;background-position:42% 10%}}';
  document.head.appendChild(auditStyle);

  var heroLayoutFix = document.createElement("style");
  heroLayoutFix.setAttribute("data-hero-layout-fix", "20260829");
  heroLayoutFix.textContent = '@media(min-width:901px){.airless-story .airless-stage{display:grid!important;grid-template-columns:minmax(0,min(48rem,58vw)) minmax(0,1fr);grid-template-rows:auto minmax(16px,1fr) auto;align-items:start}.airless-story .hero-intro,.airless-story .hero-cta-block{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;max-width:none!important}.airless-story .hero-intro{grid-column:1;grid-row:1;padding:124px clamp(22px,4vw,64px) 0!important}.airless-story .hero-cta-block{grid-column:1;grid-row:3;padding:0 clamp(22px,4vw,64px) clamp(22px,4vh,40px)!important}.airless-story .hero-works{display:none!important}.airless-story h1{font-size:clamp(3.35rem,5.7vw,6.25rem)!important;line-height:.9!important;margin:14px 0 18px!important}.airless-story .h1-line{white-space:normal!important}.airless-story .hero-intro p{font-size:clamp(.94rem,1.15vw,1.04rem)!important;line-height:1.55!important;max-width:36rem!important;margin-bottom:0}.airless-story .hero-actions{margin-top:16px!important}}@media(min-width:901px) and (max-height:820px){.airless-story .hero-intro{padding-top:118px!important}.airless-story h1{font-size:clamp(3rem,5vw,5rem)!important;line-height:.88!important;margin:10px 0 14px!important}.airless-story .hero-intro p{font-size:.93rem!important;line-height:1.42!important;max-width:34rem!important}.airless-story .hero-cta-block{padding-bottom:18px!important}.airless-story .hero-actions{gap:8px!important;margin-top:10px!important}.airless-story .hero-actions .btn{padding:10px 15px!important;font-size:13px!important}}';
  document.head.appendChild(heroLayoutFix);
  document.querySelectorAll('a[href="index.html"]').forEach(function (a) { a.setAttribute("href", "./"); });
  var toggle = document.querySelector(".menu-toggle");
  var menu = document.getElementById("site-menu");
  var closeBtn = menu && menu.querySelector(".menu-close");
  var preview = menu && menu.querySelector(".menu-preview");
  var lastFocus = null;
  var open = false;

  function focusables() {
    if (!menu) return [];
    return Array.prototype.slice.call(
      menu.querySelectorAll('a[href], button:not([disabled])')
    ).filter(function (el) {
      return el.offsetParent !== null || el.getClientRects().length;
    });
  }

  function setOpen(next) {
    if (!toggle || !menu) return;
    open = !!next;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    if (open) {
      menu.removeAttribute("hidden");
      document.body.classList.add("menu-open");
      lastFocus = document.activeElement;
      var items = focusables();
      if (items.length) items[0].focus();
    } else {
      menu.setAttribute("hidden", "");
      document.body.classList.remove("menu-open");
      if (preview) {
        preview.style.backgroundImage = "";
        preview.classList.remove("is-on");
      }
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }
  }

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      setOpen(!open);
    });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
    menu.querySelectorAll(".menu-list a").forEach(function (link) {
      link.addEventListener("mouseenter", function () {
        if (!preview || !window.matchMedia("(hover: hover) and (min-width: 901px)").matches) return;
        var src = link.getAttribute("data-photo");
        if (!src) {
          preview.classList.remove("is-on");
          return;
        }
        preview.style.backgroundImage = "url('" + src + "')";
        preview.classList.add("is-on");
      });
    });
  }


  var header = document.querySelector(".site-header");
  if (header && document.body.classList.contains("home")) {
    var headerTicking = false;
    function syncHeader() {
      headerTicking = false;
      var threshold = Math.max(72, window.innerHeight * 0.82);
      header.classList.toggle("is-scrolled", window.scrollY > threshold);
    }
    window.addEventListener("scroll", function () {
      if (headerTicking) return;
      headerTicking = true;
      requestAnimationFrame(syncHeader);
    }, { passive: true });
    window.addEventListener("resize", syncHeader);
    syncHeader();
  }

  var servicePreview = document.querySelector(".service-preview");
  var serviceLines = Array.prototype.slice.call(document.querySelectorAll(".service-line[data-photo]"));
  var servicesSection = servicePreview && servicePreview.closest(".services-editorial");
  var serviceTicking = false;

  function setServicePreview(line) {
    if (!servicePreview || !line || !window.matchMedia("(min-width: 901px)").matches) return;
    servicePreview.style.backgroundImage = "url('" + line.getAttribute("data-photo") + "')";
    servicePreview.classList.add("is-on");
  }

  function syncServicePreview() {
    serviceTicking = false;
    if (!servicePreview || !servicesSection || !serviceLines.length || !window.matchMedia("(min-width: 901px)").matches) return;
    var sectionRect = servicesSection.getBoundingClientRect();
    if (sectionRect.bottom < 0 || sectionRect.top > window.innerHeight) return;
    var target = window.innerHeight * 0.45;
    var best = serviceLines[0];
    var bestDistance = Infinity;
    serviceLines.forEach(function (line) {
      var rect = line.getBoundingClientRect();
      var center = (rect.top + rect.bottom) / 2;
      var distance = Math.abs(center - target);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = line;
      }
    });
    setServicePreview(best);
  }

  serviceLines.forEach(function (line) {
    line.addEventListener("mouseenter", function () {
      if (!window.matchMedia("(hover: hover) and (min-width: 901px)").matches) return;
      setServicePreview(line);
    });
    line.addEventListener("focusin", function () { setServicePreview(line); });
  });
  window.addEventListener("scroll", function () {
    if (serviceTicking) return;
    serviceTicking = true;
    requestAnimationFrame(syncServicePreview);
  }, { passive: true });
  window.addEventListener("resize", syncServicePreview);
  syncServicePreview();

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nodes = document.querySelectorAll(".reveal");
  if (!nodes.length) return;
  if (reduced || !("IntersectionObserver" in window)) {
    nodes.forEach(function (el) { el.classList.add("is-in"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  nodes.forEach(function (el) { io.observe(el); });
})();
