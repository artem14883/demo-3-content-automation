/* =========================================================
   main.js — UI interactions (vanilla, no dependencies)
   Cursor · preloader · nav · reveals · marquee · work · form
   ========================================================= */

/* ---------- Config: edit me ---------- */
// Contact form delivery.
//  - Leave FORMSPREE_ID empty → the form opens the visitor's email app
//    with a message pre-addressed to CONTACT_EMAIL (works with zero setup).
//  - For automatic delivery (no mail app needed), create a free form at
//    https://formspree.io using ripaartem25@gmail.com, then paste its id
//    (the part after /f/, e.g. "xeoyabcd") into FORMSPREE_ID.
const CONTACT_EMAIL = "ripaartem25@gmail.com";
const FORMSPREE_ID = "";

const PROJECTS = [
  { no: "01", title: "Lumina", cat: "AI SaaS Platform", year: "2025",
    desc: "End-to-end analytics suite with real-time AI insights and a live 3D data globe.",
    tags: ["Next.js", "TypeScript", "Three.js", "OpenAI"], hue: 268,
    live: "#", code: "#" },
  { no: "02", title: "Vault", cat: "Fintech · Mobile Banking", year: "2025",
    desc: "A premium neobank experience — payments, cards and investing in one fluid app.",
    tags: ["React Native", "Node", "Stripe", "PostgreSQL"], hue: 322,
    live: "#", code: "#" },
  { no: "03", title: "Atelier Noir", cat: "Luxury E-commerce", year: "2024",
    desc: "Headless storefront for a fashion house with cinematic product reveals.",
    tags: ["Shopify Hydrogen", "GSAP", "GLSL"], hue: 28,
    live: "#", code: "#" },
  { no: "04", title: "Orbit", cat: "3D Product Configurator", year: "2024",
    desc: "Real-time WebGL configurator letting customers customise products live.",
    tags: ["Three.js", "React", "WebGL", "Vite"], hue: 190,
    live: "#", code: "#" },
  { no: "05", title: "Nimbus", cat: "Cloud Infrastructure", year: "2024",
    desc: "Observability dashboard visualising clusters, cost and uptime at scale.",
    tags: ["Vue", "D3", "Go", "Kubernetes"], hue: 150,
    live: "#", code: "#" },
  { no: "06", title: "Helios", cat: "Web3 Brand & dApp", year: "2023",
    desc: "Brand identity and decentralised app for a renewable-energy token ecosystem.",
    tags: ["Next.js", "Solidity", "wagmi", "Framer"], hue: 45,
    live: "#", code: "#" },
];

// Experience timeline — edit freely.
const TIMELINE = [
  { period: "2023 — Present", role: "Senior Full-Stack Engineer", org: "Freelance & Studio Collaborations",
    desc: "Designing and shipping end-to-end products — 3D web experiences, SaaS platforms and design systems for clients worldwide." },
  { period: "2021 — 2023", role: "Full-Stack Developer", org: "Product Company",
    desc: "Built and scaled web apps with React, Node and TypeScript; owned features from UX to deployment." },
  { period: "2019 — 2021", role: "Frontend Developer", org: "Digital Agency",
    desc: "Crafted award-worthy marketing sites with motion, WebGL and pixel-perfect interfaces." },
  { period: "2018", role: "Started the journey", org: "Self-taught · CS foundations",
    desc: "Fell in love with the web — turning code into things people can see, touch and feel." },
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

/* ---------- Build experience timeline ---------- */
(function timeline() {
  const box = $("#timeline");
  if (!box) return;
  box.innerHTML = TIMELINE.map((t, i) => `
    <div class="tl-item reveal reveal-d${(i % 3) + 1}">
      <div class="tl-period">${t.period}</div>
      <div class="tl-content">
        <h3>${t.role}</h3>
        <span class="tl-org">${t.org}</span>
        <p>${t.desc}</p>
      </div>
    </div>`).join("");

  const items = $$(".tl-item", box);
  if (!("IntersectionObserver" in window) || prefersReduced) {
    items.forEach((e) => e.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.2 });
    items.forEach((e) => io.observe(e));
  }
}());

/* ---------- Tech fallback chips (always shown under 3D) ---------- */
(function techChips() {
  const box = $("#techFallback");
  if (box) box.innerHTML = TECH.map((t) => `<span class="tech__chip">${t}</span>`).join("");
})();

/* ---------- Contact form → delivers to CONTACT_EMAIL ---------- */
(function form() {
  const f = $("#contactForm");
  const note = $("#formNote");
  if (!f) return;
  const fail = (msg) => { note.style.color = "#f87171"; note.textContent = msg; };

  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(f);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    if (!name || !email || !message) return fail("Please fill in all fields.");

    note.style.color = "";

    if (FORMSPREE_ID) {
      // Automatic delivery via Formspree → arrives in the CONTACT_EMAIL inbox.
      note.textContent = "Sending…";
      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        });
        if (!res.ok) throw new Error("send failed");
        note.textContent = `Thanks, ${name}! Your message is on its way.`;
        f.reset();
      } catch {
        fail(`Couldn't send right now — email me directly at ${CONTACT_EMAIL}`);
      }
    } else {
      // Zero-setup fallback: open the visitor's email app addressed to CONTACT_EMAIL.
      const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
      note.textContent = `Opening your email app to send to ${CONTACT_EMAIL}…`;
      f.reset();
    }
  });
})();

/* ---------- Footer year ---------- */
$("#year") && ($("#year").textContent = new Date().getFullYear());
