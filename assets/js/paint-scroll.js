(function () {
  var story = document.querySelector(".paint-story");
  var stage = document.querySelector("[data-paint-stage]");
  if (!story || !stage) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mobileMq = window.matchMedia("(max-width: 900px)");
  var ticking = false;
  var last = -1;

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function pose(p, mobile) {
    if (mobile) {
      if (p < 0.48) {
        var t = p / 0.48;
        return { x: lerp(12, 92, t), y: 30, rot: 12, pass: 1 };
      }
      if (p < 0.88) {
        var t2 = (p - 0.48) / 0.4;
        return { x: lerp(94, 6, t2), y: 70, rot: -12, pass: 2 };
      }
      var t3 = (p - 0.88) / 0.12;
      return { x: lerp(6, 108, t3), y: lerp(70, 48, t3), rot: lerp(-12, -26, t3), pass: 2, hide: t3 };
    }
    if (p < 0.35) {
      var a = p / 0.35;
      return { x: lerp(8, 94, a), y: 20, rot: 10, pass: 1 };
    }
    if (p < 0.65) {
      var b = (p - 0.35) / 0.3;
      return { x: lerp(95, 5, b), y: 50, rot: -10, pass: 2 };
    }
    if (p < 0.9) {
      var c = (p - 0.65) / 0.25;
      return { x: lerp(5, 95, c), y: 78, rot: 10, pass: 3 };
    }
    var d = (p - 0.9) / 0.1;
    return { x: lerp(95, 112, d), y: lerp(78, 42, d), rot: lerp(10, -28, d), pass: 3, hide: d };
  }

  function bands(p, mobile) {
    if (mobile) {
      return {
        p1: clamp(p / 0.48, 0, 1),
        p2: clamp((p - 0.48) / 0.4, 0, 1),
        p3: p >= 0.88 ? 1 : 0
      };
    }
    return {
      p1: clamp(p / 0.35, 0, 1),
      p2: clamp((p - 0.35) / 0.3, 0, 1),
      p3: clamp((p - 0.65) / 0.25, 0, 1)
    };
  }

  function progress() {
    var start = story.offsetTop;
    var distance = Math.max(1, story.offsetHeight - window.innerHeight);
    return clamp((window.scrollY - start) / distance, 0, 1);
  }

  function apply(p) {
    if (Math.abs(p - last) < 0.0008) return;
    last = p;
    var mobile = mobileMq.matches;
    var pos = pose(p, mobile);
    var b = bands(p, mobile);
    var copy = p < 0.12 ? 1 : p > 0.86 ? lerp(0.82, 1, (p - 0.86) / 0.14) : lerp(1, 0.82, clamp((p - 0.12) / 0.5, 0, 1));
    var cta = p < 0.01 ? 0 : clamp((p - 0.86) / 0.1, 0, 1);
    var raw = p > 0.9 ? 1 - (p - 0.9) / 0.1 : 1;
    var word = p > 0.82 ? 2 : pos.pass === 1 ? 0 : pos.pass === 2 ? 1 : 2;
    stage.style.setProperty("--p", p.toFixed(4));
    stage.style.setProperty("--p1", b.p1.toFixed(4));
    stage.style.setProperty("--p2", b.p2.toFixed(4));
    stage.style.setProperty("--p3", b.p3.toFixed(4));
    stage.style.setProperty("--rx", pos.x.toFixed(2) + "%");
    stage.style.setProperty("--ry", pos.y.toFixed(2) + "%");
    stage.style.setProperty("--rr", pos.rot.toFixed(2) + "deg");
    stage.style.setProperty("--ro", (1 - (pos.hide || 0)).toFixed(3));
    stage.style.setProperty("--copy", copy.toFixed(3));
    stage.style.setProperty("--cta", cta.toFixed(3));
    stage.style.setProperty("--raw", raw.toFixed(3));
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
    last = -1;
    apply(progress());
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function disable() {
    story.classList.remove("paint-ready");
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    stage.removeAttribute("style");
    last = -1;
  }

  function sync() {
    if (reduced.matches) disable();
    else enable();
  }

  sync();
  if (reduced.addEventListener) reduced.addEventListener("change", sync);
  else if (reduced.addListener) reduced.addListener(sync);
})();
