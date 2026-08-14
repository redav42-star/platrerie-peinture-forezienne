(function () {
  var roots = document.querySelectorAll("[data-gallery]");
  if (!roots.length) return;

  var links = [];
  roots.forEach(function (root) {
    Array.prototype.push.apply(
      links,
      root.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".webp"]')
    );
  });
  if (!links.length) return;

  var dialog = null;
  var img = null;
  var caption = null;
  var index = 0;
  var lastFocus = null;

  function ensureDialog() {
    if (dialog) return;
    dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "Agrandissement de la photo");
    dialog.innerHTML =
      '<button type="button" class="lightbox-close" aria-label="Fermer">Fermer</button>' +
      '<button type="button" class="lightbox-prev" aria-label="Photo précédente">‹</button>' +
      '<img alt="">' +
      '<button type="button" class="lightbox-next" aria-label="Photo suivante">›</button>' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(dialog);
    img = dialog.querySelector("img");
    caption = dialog.querySelector(".lightbox-caption");
    dialog.querySelector(".lightbox-close").addEventListener("click", close);
    dialog.querySelector(".lightbox-prev").addEventListener("click", function () {
      show(index - 1);
    });
    dialog.querySelector(".lightbox-next").addEventListener("click", function () {
      show(index + 1);
    });
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog) close();
    });
    dialog.addEventListener("close", function () {
      if (lastFocus) lastFocus.focus();
    });
  }

  function show(i) {
    ensureDialog();
    index = (i + links.length) % links.length;
    var a = links[index];
    var thumb = a.querySelector("img");
    img.src = a.getAttribute("href");
    img.alt = thumb ? thumb.alt : "";
    var fig = a.closest("figure");
    var cap = fig ? fig.querySelector("figcaption") : null;
    caption.textContent = cap ? cap.textContent : "";
  }

  function close() {
    if (dialog && dialog.open) dialog.close();
  }

  links.forEach(function (a, i) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      lastFocus = document.activeElement;
      show(i);
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      dialog.querySelector(".lightbox-close").focus();
    });
  });

  document.addEventListener("keydown", function (e) {
    if (!dialog || !dialog.open) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
