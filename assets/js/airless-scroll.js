(function () {
  var story = document.querySelector(".airless-story");
  var stage = document.querySelector("[data-airless-stage]");
  var before = document.querySelector(".airless-before");
  var reveal = document.querySelector(".airless-reveal");
  var afterImg = document.querySelector(".airless-base img");
  if (!story || !stage || !before || !reveal || !afterImg) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileMq = window.matchMedia("(max-width: 900px)");
  var ticking = false;
  var last = -1;
  var mask = document.createElement("canvas");
  var mctx = mask.getContext("2d");
  var rctx = reveal.getContext("2d", { alpha: true });
  var afterSrc = new Image();
  var readyImg = false;

  /* Walls first, windows later — avoids fighting frames between the two shots. */
  var SEEDS = [
    { x: 0.36, y: 0.48, rx: 0.32, ry: 0.34, rot: 0.06, at: 0 },
    { x: 0.48, y: 0.36, rx: 0.28, ry: 0.28, rot: -0.05, at: 0.1 },
    { x: 0.42, y: 0.64, rx: 0.3, ry: 0.26, rot: 0.04, at: 0.18 },
    { x: 0.6, y: 0.4, rx: 0.3, ry: 0.3, rot: -0.06, at: 0.34 },
    { x: 0.72, y: 0.52, rx: 0.28, ry: 0.28, rot: 0.05, at: 0.46 },
    { x: 0.54, y: 0.7, rx: 0.34, ry: 0.22, rot: 0.02, at: 0.56 }
  ];

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function ease(t) {
    return t * t * (3 - 2 * t);
  }

  function coverDraw(ctx, img, w, h, fx, fy) {
    var iw = img.naturalWidth || w;
    var ih = img.naturalHeight || h;
    var scale = Math.max(w / iw, h / ih);
    var dw = iw * scale;
    var dh = ih * scale;
    ctx.drawImage(img, (w - dw) * fx, (h - dh) * fy, dw, dh);
  }

  function paintMask(p, w, h, mobile) {
    mctx.clearRect(0, 0, w, h);
    if (p < 0.015) {
      mctx.filter = "none";
      return;
    }
    var t = ease(clamp((p - 0.015) / 0.97, 0, 1));
    mctx.filter = mobile ? "blur(12px)" : "blur(14px)";
    var i;
    for (i = 0; i < SEEDS.length; i++) {
      var s = SEEDS[i];
      var local = clamp((t - s.at) / 0.36, 0, 1);
      if (local <= 0) continue;
      var grow = ease(local);
      var rx = s.rx * w * (0.4 + grow * 0.95);
      var ry = s.ry * h * (0.5 + grow * 0.95);
      mctx.beginPath();
      mctx.ellipse(s.x * w, s.y * h, rx, ry, s.rot, 0, Math.PI * 2);
      mctx.fillStyle = "rgba(255,255,255," + (0.78 + grow * 0.22).toFixed(3) + ")";
      mctx.fill();
    }
    if (t > 0.7) {
      var fade = (t - 0.7) / 0.3;
      var R = Math.hypot(w, h) * (0.38 + fade * 0.72);
      var g = mctx.createRadialGradient(w * 0.5, h * 0.46, R * 0.08, w * 0.48, h * 0.48, R);
      g.addColorStop(0, "rgba(255,255,255," + fade.toFixed(3) + ")");
      g.addColorStop(0.68, "rgba(255,255,255," + (fade * 0.7).toFixed(3) + ")");
      g.addColorStop(1, "rgba(255,255,255,0)");
      mctx.fillStyle = g;
      mctx.fillRect(0, 0, w, h);
    }
    mctx.filter = "none";
  }

  function paintReveal(p) {
    var w = reveal.width;
    var h = reveal.height;
    if (!w || !h || !readyImg) return;
    paintMask(p, w, h, mobileMq.matches);
    rctx.clearRect(0, 0, w, h);
    rctx.globalCompositeOperation = "source-over";
    rctx.drawImage(mask, 0, 0);
    rctx.globalCompositeOperation = "source-in";
    coverDraw(rctx, afterSrc, w, h, 0.26, 0.28);
    rctx.globalCompositeOperation = "source-over";
  }

  function resize() {
    var rect = stage.getBoundingClientRect();
    var dpr = Math.min(1.25, window.devicePixelRatio || 1);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.max(1, Math.round(rect.height * dpr));
    if (reveal.width === w && reveal.height === h) return;
    reveal.width = w;
    reveal.height = h;
    mask.width = w;
    mask.height = h;
    last = -1;
  }

  function progress() {
    var start = story.offsetTop;
    var distance = Math.max(1, story.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - start) / distance, 0, 1);
  }

  function apply(p) {
    if (Math.abs(p - last) < 0.0008) return;
    last = p;
    var copy = 1;
    var cta = 1;
    var beforeA = p > 0.9 ? 1 - (p - 0.9) / 0.1 : 1;
    stage.style.setProperty("--p", p.toFixed(4));
    stage.style.setProperty("--copy", copy.toFixed(3));
    stage.style.setProperty("--cta", cta.toFixed(3));
    stage.style.setProperty("--before", beforeA.toFixed(3));
    paintReveal(p);
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      apply(progress());
    });
  }

  function enable() {
    story.classList.add("airless-ready");
    resize();
    last = -1;
    apply(progress());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () {
      resize();
      last = -1;
      onScroll();
    });
  }

  function disable() {
    story.classList.remove("airless-ready");
    window.removeEventListener("scroll", onScroll);
    stage.removeAttribute("style");
    last = -1;
  }

  function sync() {
    if (reduced.matches) disable();
    else enable();
  }

  afterSrc.onload = function () {
    readyImg = true;
    last = -1;
    if (story.classList.contains("airless-ready")) apply(progress());
  };
  afterSrc.src = afterImg.currentSrc || afterImg.src;
  if (afterSrc.complete && afterSrc.naturalWidth) readyImg = true;

  sync();
  if (reduced.addEventListener) reduced.addEventListener("change", sync);
  else if (reduced.addListener) reduced.addListener(sync);
})();
