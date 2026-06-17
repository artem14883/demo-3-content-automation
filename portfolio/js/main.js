/* =========================================================
   main.js — UI interactions (vanilla, no dependencies)
   Cursor · preloader · nav · reveals · marquee · work · form
   ========================================================= */

/* ---------- Config: edit me ---------- */
const PROJECTS = [
  { no: "01", title: "Lumina", cat: "AI SaaS Platform", year: "2025",
    desc: "End-to-end analytics suite with real-time AI insights and a live 3D data globe.",
    tags: ["Next.js", "TypeScript", "Three.js", "OpenAI"], hue: 268 },
  { no: "02", title: "Vault", cat: "Fintech · Mobile Banking", year: "2025",
    desc: "A premium neobank experience — payments, cards and investing in one fluid app.",
    tags: ["React Native", "Node", "Stripe", "PostgreSQL"], hue: 322 },
  { no: "03", title: "Atelier Noir", cat: "Luxury E-commerce", year: "2024",
    desc: "Headless storefront for a fashion house with cinematic product reveals.",
    tags: ["Shopify Hydrogen", "GSAP", "GLSL"], hue: 28 },
  { no: "04", title: "Orbit", cat: "3D Product Configurator", year: "2024",
    desc: "Real-time WebGL configurator letting customers customise products live.",
    tags: ["Three.js", "React", "WebGL", "Vite"], hue: 190 },
  { no: "05", title: "Nimbus", cat: "Cloud Infrastructure", year: "2024",
    desc: "Observability dashboard visualising clusters, cost and uptime at scale.",
    tags: ["Vue", "D3", "Go", "Kubernetes"], hue: 150 },
  { no: "06", title: "Helios", cat: "Web3 Brand & dApp", year: "2023",
    desc: "Brand identity and decentralised app for a renewable-energy token ecosystem.",
    tags: ["Next.js", "Solidity", "wagmi", "Framer"], hue: 45 },
];

const TECH = ["JS","TS","React","Next","Node","Three.js","GSAP","WebGL","CSS","Figma","Vue","Git"];

/* ---------- Helpers ---------- */
const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, n) => (1 - n) * a + n * b;
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Preloader ---------- */
(function preloader() {
  const loader = $("#loader");
  const count  = $("#loaderCount");
  const bar    = $("#loaderBar");
  if (!loader) return;
  let p = 0;
  const tick = () => {
    p += Math.max(1, Math.round((100 - p) * 0.06));
    if (p >= 100) p = 100;
    count.textContent = p;
    bar.style.width = p + "%";
    if (p < 100) {
      setTimeout(tick, 60 + Math.random() * 80);
    } else {
      setTimeout(() => {
        loader.classList.add("done");
        document.body.style.overflow = "";
      }, 350);
    }
  };
  document.body.style.overflow = "hidden";
  setTimeout(tick, 200);
})();

/* ---------- Custom cursor ---------- */
(function cursor() {
  const dot  = $("#cursorDot");
  const ring = $("#cursorRing");
  if (!dot || !ring || window.matchMedia("(hover: none)").matches) return;

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;

  addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
  });

  const render = () => {
    rx = lerp(rx, mx, 0.18);
    ry = lerp(ry, my, 0.18);
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(render);
  };
  render();

  const bind = () => {
    $$("[data-cursor], a, button, input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("hover"));
      el.addEventListener("mouseleave", () => ring.classList.remove("hover"));
    });
  };
  bind();
  // expose so we can rebind after dynamic content is injected
  window.__rebindCursor = bind;
})();

/* ---------- Nav background on scroll ---------- */
(function nav() {
  const el = $("#nav");
  if (!el) return;
  const onScroll = () => el.classList.toggle("scrolled", scrollY > 40);
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
})();

/* ---------- Scroll reveal ---------- */
(function reveals() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window) || prefersReduced) {
    els.forEach((e) => e.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.18 });
  els.forEach((e) => io.observe(e));
})();

/* ---------- Duplicate marquee for seamless loop ---------- */
(function marquee() {
  const track = $("#marquee");
  if (track) track.innerHTML += track.innerHTML;
})();

/* ---------- Build work cards ---------- */
(function work() {
  const track = $("#workTrack");
  if (!track) return;
  track.innerHTML = PROJECTS.map((p) => `
    <article class="work-card" data-cursor>
      <div class="work-card__media">
        <div class="gradient-fill" style="background:
          radial-gradient(120% 120% at 20% 10%, hsl(${p.hue} 85% 62% / .9), transparent 55%),
          radial-gradient(120% 120% at 90% 90%, hsl(${(p.hue + 50) % 360} 85% 60% / .85), transparent 55%),
          #0c0c12;"></div>
        <span class="work-card__no">${p.no}</span>
        <span class="work-card__year">${p.year}</span>
      </div>
      <div class="work-card__body">
        <span class="work-card__cat">${p.cat}</span>
        <h3>${p.title}</h3>
        <p class="work-card__desc">${p.desc}</p>
        <div class="work-card__tags">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      </div>
    </article>`).join("");

  // drag-to-scroll
  let down = false, startX = 0, startScroll = 0;
  track.addEventListener("pointerdown", (e) => { down = true; startX = e.pageX; startScroll = track.scrollLeft; });
  addEventListener("pointerup", () => (down = false));
  track.addEventListener("pointermove", (e) => {
    if (!down) return;
    track.scrollLeft = startScroll - (e.pageX - startX) * 1.4;
  });

  window.__rebindCursor && window.__rebindCursor();
})();

/* ---------- Tech fallback chips (always shown under 3D) ---------- */
(function techChips() {
  const box = $("#techFallback");
  if (box) box.innerHTML = TECH.map((t) => `<span class="tech__chip">${t}</span>`).join("");
})();

/* ---------- Contact form (front-end only demo) ---------- */
(function form() {
  const f = $("#contactForm");
  const note = $("#formNote");
  if (!f) return;
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(f);
    if (!data.get("name") || !data.get("email") || !data.get("message")) {
      note.style.color = "#f87171";
      note.textContent = "Please fill in all fields.";
      return;
    }
    note.style.color = "";
    note.textContent = `Thanks, ${data.get("name")}! This is a demo form — wire it to your backend or a service like Formspree.`;
    f.reset();
  });
})();

/* ---------- Footer year ---------- */
$("#year") && ($("#year").textContent = new Date().getFullYear());
