(function () {
  document.documentElement.classList.add("has-js");
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

  var servicePreview = document.querySelector(".service-preview");
  document.querySelectorAll(".service-line[data-photo]").forEach(function (line) {
    line.addEventListener("mouseenter", function () {
      if (!servicePreview || !window.matchMedia("(hover: hover) and (min-width: 901px)").matches) return;
      servicePreview.style.backgroundImage = "url('" + line.getAttribute("data-photo") + "')";
      servicePreview.classList.add("is-on");
    });
  });

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
