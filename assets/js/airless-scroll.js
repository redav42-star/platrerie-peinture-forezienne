(function () {
  var story = document.querySelector(".airless-story");
  var stage = document.querySelector("[data-airless-stage]");
  var before = document.querySelector(".airless-before");
  var reveal = document.querySelector(".airless-reveal");
  var afterImg = document.querySelector(".airless-base img");
  if (!story || !stage || !before || !reveal || !afterImg) return;
  before.style.opacity = "1";
  var beforeImg = before.querySelector("img");
  if (beforeImg) beforeImg.setAttribute("fetchpriority", "high");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileMq = window.matchMedia("(max-width: 900px)");
  var ticking = false;
  var last = -1;
  var mask = document.createElement("canvas");
  var mctx = mask.getContext("2d");
  var rctx = reveal.getContext("2d", { alpha: true });
  var afterSrc = new Image();
  var readyImg = false;

  /* The finish advances as one connected, irregular front so architectural elements never float as isolated islands. */

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
    if (p < 0.012) {
      mctx.filter = "none";
      return;
    }
    var t = ease(clamp((p - 0.012) / 0.976, 0, 1));
    var front = w * (-0.14 + t * 1.30);
    var step = Math.max(8, Math.round(h / 52));
    mctx.filter = mobile ? "blur(8px)" : "blur(10px)";
    mctx.fillStyle = "rgba(255,255,255,.98)";
    mctx.beginPath();
    mctx.moveTo(-w * 0.12, -h * 0.08);
    for (var y = -h * 0.08; y <= h * 1.08; y += step) {
      var yn = y / h;
      var wave = Math.sin(yn * Math.PI * 3.2 + 0.8) * w * 0.045;
      wave += Math.sin(yn * Math.PI * 8.1 + 1.7) * w * 0.016;
      wave += Math.sin(yn * Math.PI * 15.4 + 0.3) * w * 0.007;
      var diagonal = (0.48 - yn) * w * 0.09;
      mctx.lineTo(front + wave + diagonal, y);
    }
    mctx.lineTo(-w * 0.12, h * 1.08);
    mctx.closePath();
    mctx.fill();
    mctx.filter = "none";
    if (t > 0.94) {
      var finish = ease((t - 0.94) / 0.06);
      mctx.fillStyle = "rgba(255,255,255," + finish.toFixed(3) + ")";
      mctx.fillRect(0, 0, w, h);
    }
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
    before.style.removeProperty("opacity");
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
