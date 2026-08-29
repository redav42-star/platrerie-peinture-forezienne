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

  /* Nozzle stays on the right half so the spray paints into the room. */
  var DESKTOP = [
    [1.12, 0.58],
    [0.84, 0.46],
    [0.62, 0.6],
    [0.78, 0.76],
    [0.5, 0.68],
    [0.7, 0.84],
    [0.44, 0.8],
    [1.16, 0.62]
  ];
  var MOBILE = [
    [1.1, 0.42],
    [0.7, 0.5],
    [0.84, 0.7],
    [0.52, 0.78],
    [1.14, 0.58]
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
    var tilt = -8 + 7 * Math.sin(p * Math.PI * 1.7);
    return {
      x: lerp(a[0], b[0], t) * 100,
      y: lerp(a[1], b[1], t) * 100,
      rot: tilt,
      hide: p > 0.9 ? (p - 0.9) / 0.1 : 0
    };
  }

  function samples(p, mobile) {
    var keys = mobile ? MOBILE : DESKTOP;
    if (p < 0.035) return [];
    var total = mobile ? 48 : 72;
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

  function coverDraw(ctx, img, w, h, fx, fy) {
    var iw = img.naturalWidth || w;
    var ih = img.naturalHeight || h;
    var scale = Math.max(w / iw, h / ih);
    var dw = iw * scale;
    var dh = ih * scale;
    ctx.drawImage(img, (w - dw) * fx, (h - dh) * fy, dw, dh);
  }

  function sprayFan(ctx, x, y, len, spread, strength) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI);
    var i;
    for (i = 0; i < 5; i++) {
      var t = i / 4;
      var L = len * (0.42 + t * 0.68);
      var S = spread * (0.4 + t * 0.85) * (0.86 + 0.2 * Math.sin(i * 1.7 + x * 0.008));
      var ox = L * 0.48;
      var oy = Math.sin(i * 2.3 + y * 0.01) * spread * 0.16;
      ctx.beginPath();
      ctx.moveTo(2, oy * 0.2);
      ctx.lineTo(L * 0.92, -S + oy);
      ctx.quadraticCurveTo(L * 1.06, oy, L * 0.92, S + oy);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255," + (strength * (0.34 - t * 0.05)).toFixed(3) + ")";
      ctx.fill();
    }
    ctx.restore();
  }

  function paintMask(p, w, h, mobile) {
    mctx.clearRect(0, 0, w, h);
    var pts = samples(p, mobile);
    if (!pts.length) {
      mctx.filter = "none";
      return;
    }
    var reach = Math.min(w, h) * (mobile ? 0.4 : 0.38);
    mctx.lineCap = "round";
    mctx.lineJoin = "round";
    mctx.filter = mobile ? "blur(8px)" : "blur(9px)";
    var pass;
    for (pass = 0; pass < 3; pass++) {
      mctx.beginPath();
      var ox = -reach * (0.55 + pass * 0.08);
      var oy = Math.sin(pass * 1.7) * reach * 0.07;
      mctx.moveTo(pts[0][0] * w + ox, pts[0][1] * h + oy);
      var i;
      for (i = 1; i < pts.length; i++) {
        mctx.lineTo(
          pts[i][0] * w + ox + Math.sin(i * 0.9) * reach * 0.05,
          pts[i][1] * h + oy + Math.cos(i * 0.7) * reach * 0.04
        );
      }
      mctx.strokeStyle = "rgba(255,255,255," + (0.62 - pass * 0.12).toFixed(3) + ")";
      mctx.lineWidth = reach * (0.72 + pass * 0.22);
      mctx.stroke();
    }
    var head = pts[pts.length - 1];
    sprayFan(mctx, head[0] * w, head[1] * h, reach * 1.05, reach * 0.26, 0.42);
    if (p > 0.82) {
      var fade = (p - 0.82) / 0.18;
      var cx = w * 0.52;
      var cy = h * 0.7;
      var R = Math.hypot(w, h) * (0.32 + fade * 0.85);
      var g = mctx.createRadialGradient(cx, cy, R * 0.12, cx, cy, R);
      g.addColorStop(0, "rgba(255,255,255," + fade.toFixed(3) + ")");
      g.addColorStop(0.72, "rgba(255,255,255," + (fade * 0.5).toFixed(3) + ")");
      g.addColorStop(1, "rgba(255,255,255,0)");
      mctx.fillStyle = g;
      mctx.fillRect(0, 0, w, h);
    }
    mctx.filter = "none";
  }

  function paintSprayDots(p, w, h, mobile) {
    if (p < 0.04 || p > 0.9) return;
    var head = pose(p, mobile);
    var hx = (head.x / 100) * w;
    var hy = (head.y / 100) * h;
    var s;
    for (s = 0; s < 48; s++) {
      var cone = (s / 48 - 0.5) * 0.78;
      var dist = (10 + (s % 12) * 14 + ((s * 13) % 11)) * dpr;
      var px = hx - Math.cos(cone) * dist;
      var py = hy + Math.sin(cone) * dist * 0.7;
      var alpha = 0.34 - (s / 48) * 0.2;
      rctx.fillStyle = "rgba(236,228,210," + alpha.toFixed(3) + ")";
      rctx.beginPath();
      rctx.arc(px, py, (0.9 + (s % 5) * 0.5) * dpr, 0, Math.PI * 2);
      rctx.fill();
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
    coverDraw(rctx, afterSrc, w, h, 0.36, 0.74);
    rctx.globalCompositeOperation = "source-over";
    paintSprayDots(p, w, h, mobile);
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
    var copy = p < 0.08 ? 1 : p > 0.84 ? lerp(0.78, 1, (p - 0.84) / 0.16) : lerp(1, 0.78, clamp((p - 0.08) / 0.5, 0, 1));
    var cta = p < 0.02 ? 0 : clamp((p - 0.84) / 0.12, 0, 1);
    var beforeA = p > 0.88 ? 1 - (p - 0.88) / 0.12 : 1;
    stage.style.setProperty("--p", p.toFixed(4));
    stage.style.setProperty("--gx", pos.x.toFixed(2) + "%");
    stage.style.setProperty("--gy", pos.y.toFixed(2) + "%");
    stage.style.setProperty("--ga", pos.rot.toFixed(2) + "deg");
    stage.style.setProperty("--go", (1 - pos.hide).toFixed(3));
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
