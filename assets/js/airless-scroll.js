(function () {
  var story = document.querySelector(".airless-story");
  var stage = document.querySelector("[data-airless-stage]");
  var raw = document.querySelector(".airless-raw");
  var reveal = document.querySelector(".airless-reveal");
  var baseImg = document.querySelector(".airless-base img");
  if (!story || !stage || !raw || !reveal || !baseImg) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileMq = window.matchMedia("(max-width: 900px)");
  var ticking = false;
  var last = -1;
  var mask = document.createElement("canvas");
  var mctx = mask.getContext("2d");
  var rctx = reveal.getContext("2d", { alpha: true });
  var colorSrc = new Image();
  var readyImg = false;
  var dpr = 1;

  var DESKTOP = [
    [0.93, 0.3],
    [0.76, 0.2],
    [0.58, 0.32],
    [0.7, 0.5],
    [0.86, 0.42],
    [0.62, 0.64],
    [0.8, 0.76],
    [0.56, 0.82],
    [1.1, 0.46]
  ];
  var MOBILE = [
    [0.88, 0.26],
    [0.52, 0.34],
    [0.78, 0.56],
    [0.48, 0.74],
    [1.08, 0.48]
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

  function pose(p, mobile) {
    var keys = mobile ? MOBILE : DESKTOP;
    var n = keys.length - 1;
    var u = clamp(p, 0, 1) * n;
    var i = Math.min(n - 1, Math.floor(u));
    var t = ease(u - i);
    var a = keys[i];
    var b = keys[i + 1];
    var x = lerp(a[0], b[0], t);
    var y = lerp(a[1], b[1], t);
    var tilt = -16 + 14 * Math.sin(p * Math.PI * 2.1);
    return { x: x * 100, y: y * 100, rot: tilt, hide: p > 0.9 ? (p - 0.9) / 0.1 : 0 };
  }

  function samples(p, mobile) {
    var keys = mobile ? MOBILE : DESKTOP;
    var total = mobile ? 52 : 78;
    var max = Math.floor(clamp(p, 0, 1) * total);
    var pts = [];
    var n = keys.length - 1;
    for (var i = 0; i <= max; i++) {
      var u = (i / total) * n;
      var k = Math.min(n - 1, Math.floor(u));
      var t = ease(u - k);
      pts.push([lerp(keys[k][0], keys[k + 1][0], t), lerp(keys[k][1], keys[k + 1][1], t)]);
    }
    return pts;
  }

  function coverDraw(ctx, img, w, h) {
    var iw = img.naturalWidth || w;
    var ih = img.naturalHeight || h;
    var scale = Math.max(w / iw, h / ih);
    var dw = iw * scale;
    var dh = ih * scale;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) * 0.32, dw, dh);
  }

  function paintMask(p, w, h, mobile) {
    mctx.clearRect(0, 0, w, h);
    var pts = samples(p, mobile);
    var baseR = Math.min(w, h) * (mobile ? 0.26 : 0.24);
    for (var i = 0; i < pts.length; i++) {
      var jitter = 0.82 + 0.24 * Math.abs(Math.sin(i * 1.11));
      var r = baseR * jitter;
      var x = pts[i][0] * w;
      var y = pts[i][1] * h;
      var ang = -0.28 + 0.18 * Math.sin(i * 0.37);
      mctx.save();
      mctx.translate(x, y);
      mctx.rotate(ang);
      mctx.scale(1.85, 0.62);
      var g = mctx.createRadialGradient(0, 0, r * 0.06, 0, 0, r);
      g.addColorStop(0, "rgba(255,255,255,0.88)");
      g.addColorStop(0.42, "rgba(255,255,255,0.42)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      mctx.fillStyle = g;
      mctx.beginPath();
      mctx.arc(0, 0, r, 0, Math.PI * 2);
      mctx.fill();
      mctx.restore();
    }
    if (p > 0.78) {
      mctx.fillStyle = "rgba(255,255,255," + ((p - 0.78) / 0.22).toFixed(3) + ")";
      mctx.fillRect(0, 0, w, h);
    }
  }

  function paintReveal(p) {
    var w = reveal.width;
    var h = reveal.height;
    if (!w || !h || !readyImg) return;
    var mobile = mobileMq.matches;
    paintMask(p, w, h, mobile);
    rctx.clearRect(0, 0, w, h);
    rctx.globalCompositeOperation = "source-over";
    rctx.drawImage(mask, 0, 0);
    rctx.globalCompositeOperation = "source-in";
    coverDraw(rctx, colorSrc, w, h);
    rctx.globalCompositeOperation = "source-over";
    if (p > 0.02 && p < 0.9) {
      var head = pose(p, mobile);
      var hx = (head.x / 100) * w;
      var hy = (head.y / 100) * h;
      var s;
      for (s = 0; s < 16; s++) {
        rctx.fillStyle = "rgba(245,241,232," + (0.12 + (s % 4) * 0.04) + ")";
        rctx.beginPath();
        rctx.arc(hx - (14 + s * 9) * dpr, hy + Math.sin(s * 1.8 + p * 9) * 16 * dpr, (1.1 + (s % 3)) * dpr, 0, Math.PI * 2);
        rctx.fill();
      }
    }
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
    var mobile = mobileMq.matches;
    var pos = pose(p, mobile);
    var copy = p < 0.1 ? 1 : p > 0.84 ? lerp(0.78, 1, (p - 0.84) / 0.16) : lerp(1, 0.78, clamp((p - 0.1) / 0.5, 0, 1));
    var cta = p < 0.02 ? 0 : clamp((p - 0.84) / 0.12, 0, 1);
    var rawA = p > 0.86 ? 1 - (p - 0.86) / 0.14 : 1;
    stage.style.setProperty("--p", p.toFixed(4));
    stage.style.setProperty("--gx", pos.x.toFixed(2) + "%");
    stage.style.setProperty("--gy", pos.y.toFixed(2) + "%");
    stage.style.setProperty("--ga", pos.rot.toFixed(2) + "deg");
    stage.style.setProperty("--go", (1 - pos.hide).toFixed(3));
    stage.style.setProperty("--copy", copy.toFixed(3));
    stage.style.setProperty("--cta", cta.toFixed(3));
    stage.style.setProperty("--raw", rawA.toFixed(3));
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

  colorSrc.onload = function () {
    readyImg = true;
    last = -1;
    if (story.classList.contains("airless-ready")) apply(progress());
  };
  colorSrc.src = baseImg.currentSrc || baseImg.src;
  if (colorSrc.complete && colorSrc.naturalWidth) {
    readyImg = true;
  }

  sync();
  if (reduced.addEventListener) reduced.addEventListener("change", sync);
  else if (reduced.addListener) reduced.addListener(sync);
})();
