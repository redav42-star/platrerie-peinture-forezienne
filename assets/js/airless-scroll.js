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
  var dpr = 1;

  /* Finish spreads from the window/floor side toward the fireplace. */
  var SEEDS = [
    { x: 0.8, y: 0.72, rx: 0.4, ry: 0.34, at: 0 },
    { x: 0.64, y: 0.6, rx: 0.36, ry: 0.3, at: 0.08 },
    { x: 0.52, y: 0.76, rx: 0.34, ry: 0.28, at: 0.16 },
    { x: 0.72, y: 0.42, rx: 0.3, ry: 0.26, at: 0.24 },
    { x: 0.4, y: 0.68, rx: 0.32, ry: 0.3, at: 0.34 },
    { x: 0.36, y: 0.48, rx: 0.32, ry: 0.34, at: 0.46 },
    { x: 0.26, y: 0.72, rx: 0.3, ry: 0.28, at: 0.56 }
  ];

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
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
    if (p < 0.02) {
      mctx.filter = "none";
      return;
    }
    var t = ease(clamp((p - 0.02) / 0.96, 0, 1));
    mctx.filter = mobile ? "blur(18px)" : "blur(22px)";
    var i;
    for (i = 0; i < SEEDS.length; i++) {
      var s = SEEDS[i];
      var local = clamp((t - s.at) / 0.42, 0, 1);
      if (local <= 0) continue;
      var grow = ease(local);
      var rx = s.rx * w * (0.34 + grow * 1.02);
      var ry = s.ry * h * (0.38 + grow * 1.08);
      var cx = s.x * w + Math.sin(i * 1.7 + t * 2) * w * 0.012;
      var cy = s.y * h + Math.cos(i * 1.3 + t * 1.6) * h * 0.01;
      mctx.beginPath();
      mctx.ellipse(cx, cy, rx, ry, (i % 2 ? 0.18 : -0.12), 0, Math.PI * 2);
      mctx.fillStyle = "rgba(255,255,255," + (0.42 + grow * 0.5).toFixed(3) + ")";
      mctx.fill();
    }
    if (t > 0.72) {
      var fade = (t - 0.72) / 0.28;
      var g = mctx.createRadialGradient(w * 0.52, h * 0.68, Math.min(w, h) * 0.12, w * 0.5, h * 0.62, Math.hypot(w, h) * (0.35 + fade * 0.75));
      g.addColorStop(0, "rgba(255,255,255," + fade.toFixed(3) + ")");
      g.addColorStop(0.7, "rgba(255,255,255," + (fade * 0.62).toFixed(3) + ")");
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
    coverDraw(rctx, afterSrc, w, h, 0.36, 0.74);
    rctx.globalCompositeOperation = "source-over";
  }

  function resize() {
    var rect = stage.getBoundingClientRect();
    dpr = Math.min(1.25, window.devicePixelRatio || 1);
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
    if (Math.abs(p - last) < 0.0012) return;
    last = p;
    var copy = p < 0.08 ? 1 : p > 0.84 ? lerp(0.82, 1, (p - 0.84) / 0.16) : lerp(1, 0.82, clamp((p - 0.08) / 0.5, 0, 1));
    var cta = p < 0.02 ? 0 : clamp((p - 0.84) / 0.12, 0, 1);
    var beforeA = p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
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
