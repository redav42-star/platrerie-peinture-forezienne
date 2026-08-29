(function () {
  var story = document.querySelector(".paint-story");
  var stage = document.querySelector("[data-paint-stage]");
  if (!story || !stage) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileMq = window.matchMedia("(max-width: 900px)");
  var ticking = false;
  var lastP = -1;

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function smooth(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function pose(p, mobile) {
    var x, y, rot, hide;
    if (mobile) {
      if (p < 0.46) {
        var t = p / 0.46;
        x = lerp(4, 104, t);
        y = 32;
        rot = 10;
      } else if (p < 0.84) {
        var t2 = (p - 0.46) / 0.38;
        x = lerp(104, 4, t2);
        y = 72;
        rot = -10;
      } else {
        var t3 = (p - 0.84) / 0.16;
        x = lerp(4, 112, t3);
        y = lerp(72, 48, t3);
        rot = lerp(-10, -28, t3);
        hide = t3;
      }
    } else if (p < 0.3) {
      var a = p / 0.3;
      x = lerp(4, 104, a);
      y = 16;
      rot = 8;
    } else if (p < 0.58) {
      var b = (p - 0.3) / 0.28;
      x = lerp(104, 4, b);
      y = 49;
      rot = -8;
    } else if (p < 0.82) {
      var c = (p - 0.58) / 0.24;
      x = lerp(4, 104, c);
      y = 82;
      rot = 8;
    } else {
      var d = (p - 0.82) / 0.18;
      x = lerp(104, 118, d);
      y = lerp(82, 36, d);
      rot = lerp(8, -30, d);
      hide = d;
    }
    return { x: x, y: y, rot: rot, hide: hide || 0 };
  }

  function bands(p, mobile) {
    if (mobile) {
      return {
        b1: clamp(p / 0.46, 0, 1),
        b2: clamp((p - 0.46) / 0.38, 0, 1),
        b3: p >= 0.84 ? clamp((p - 0.84) / 0.16, 0, 1) : 0
      };
    }
    return {
      b1: clamp(p / 0.3, 0, 1),
      b2: clamp((p - 0.3) / 0.28, 0, 1),
      b3: clamp((p - 0.58) / 0.24, 0, 1)
    };
  }

  function progress() {
    var start = story.offsetTop;
    var distance = Math.max(1, story.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - start) / distance, 0, 1);
  }

  function apply(p) {
    if (Math.abs(p - lastP) < 0.001) return;
    lastP = p;
    var mobile = mobileMq.matches;
    var pos = pose(p, mobile);
    var b = bands(p, mobile);
    var copyOut = smooth((p - 0.12) / 0.5);
    var copyBack = smooth((p - 0.86) / 0.14);
    var copy = clamp(1 - copyOut * 0.22 + copyBack * 0.18, 0.78, 1);
    var word = p < 0.28 ? 0 : p < 0.58 ? 1 : 2;
    var pot = clamp(1 - p / 0.14, 0, 1);
    stage.style.setProperty("--p", p.toFixed(4));
    stage.style.setProperty("--rx", pos.x.toFixed(2) + "%");
    stage.style.setProperty("--ry", pos.y.toFixed(2) + "%");
    stage.style.setProperty("--rr", pos.rot.toFixed(2) + "deg");
    stage.style.setProperty("--ro", (1 - pos.hide).toFixed(3));
    stage.style.setProperty("--b1", b.b1.toFixed(4));
    stage.style.setProperty("--b2", b.b2.toFixed(4));
    stage.style.setProperty("--b3", b.b3.toFixed(4));
    stage.style.setProperty("--w1", (b.b1 > 0.02 ? Math.min(1, b.b1 + 0.045) : 0).toFixed(4));
    stage.style.setProperty("--w2", (b.b2 > 0.02 ? Math.min(1, b.b2 + 0.045) : 0).toFixed(4));
    stage.style.setProperty("--w3", (b.b3 > 0.02 ? Math.min(1, b.b3 + 0.045) : 0).toFixed(4));
    stage.style.setProperty("--copy", copy.toFixed(3));
    stage.style.setProperty("--pot", pot.toFixed(3));
    stage.style.setProperty("--word", String(word));
    stage.setAttribute("data-paint-word", String(word));
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
    story.classList.add("paint-ready");
    lastP = -1;
    apply(progress());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function disable() {
    story.classList.remove("paint-ready");
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    stage.style.cssText = "";
    lastP = -1;
  }

  function sync() {
    if (reduced.matches) disable();
    else enable();
  }

  sync();
  if (typeof reduced.addEventListener === "function") {
    reduced.addEventListener("change", sync);
  } else if (typeof reduced.addListener === "function") {
    reduced.addListener(sync);
  }
})();
