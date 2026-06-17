/* =========================================================
   three-scenes.js — WebGL scenes (Three.js, ES module)
   Renders in the visitor's browser. Fails gracefully if the
   CDN is unreachable — the layout already looks complete.
   ========================================================= */

let THREE;
try {
  THREE = await import("three");
} catch (err) {
  console.warn("[3D] Three.js unavailable — skipping WebGL scenes.", err);
}

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function makeRenderer(canvasEl, alpha = true) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(canvasEl.clientWidth, canvasEl.clientHeight);
  canvasEl.appendChild(renderer.domElement);
  return renderer;
}

/* Track which scenes are on-screen to pause off-screen rendering */
function onScreen(el) {
  let visible = true;
  if ("IntersectionObserver" in window) {
    visible = false;
    new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.01 })
      .observe(el);
  }
  return () => visible;
}

/* Pointer (normalised -1..1) */
const pointer = { x: 0, y: 0 };
addEventListener("mousemove", (e) => {
  pointer.x = (e.clientX / innerWidth) * 2 - 1;
  pointer.y = (e.clientY / innerHeight) * 2 - 1;
});

/* =========================================================
   1) HERO — stylised 3D character (Memoji-style, cap on)
      Built from primitives; head follows the cursor.
   ========================================================= */
function heroScene() {
  const host = document.getElementById("heroCanvas");
  if (!host) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.set(0, 0.15, 5.4);

  const renderer = makeRenderer(host);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ---- materials (tweak colors here) ----
  const skin   = new THREE.MeshPhysicalMaterial({ color: 0xe0a97e, roughness: 0.5, clearcoat: 0.45, clearcoatRoughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0xffd9c0) });
  const silver = new THREE.MeshPhysicalMaterial({ color: 0xf0f0f4, roughness: 0.26, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.2 }); // cap
  const dark   = new THREE.MeshStandardMaterial({ color: 0x16161d, roughness: 0.7 });
  const white  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const black  = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.25 });
  const matte  = new THREE.MeshStandardMaterial({ color: 0x1b1b22, roughness: 0.55, metalness: 0.2 });          // headphones
  const accent = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.35, metalness: 0.3, emissive: 0x3b1d6e, emissiveIntensity: 0.5 });
  const frame  = new THREE.MeshStandardMaterial({ color: 0x111114, roughness: 0.3, metalness: 0.6 });           // glasses frame
  const lens   = new THREE.MeshPhysicalMaterial({ color: 0x0a0a0f, roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.6 });

  // ---- character group ----
  const head = new THREE.Group();

  const skull = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64), skin);
  skull.scale.set(1, 1.07, 0.95);
  head.add(skull);

  // ears
  [-1, 1].forEach((s) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), skin);
    ear.position.set(s * 1.02, -0.06, 0);
    ear.scale.set(0.7, 1, 0.7);
    head.add(ear);
  });

  // eyes (white + pupil)
  [-1, 1].forEach((s) => {
    const eyeW = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), white);
    eyeW.position.set(s * 0.4, 0.08, 0.9);
    eyeW.scale.set(1, 1.15, 0.6);
    head.add(eyeW);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 24), black);
    pupil.position.set(s * 0.4, 0.06, 0.95);
    head.add(pupil);
  });

  // eyebrows
  [-1, 1].forEach((s) => {
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.12), dark);
    brow.position.set(s * 0.4, 0.42, 0.93);
    brow.rotation.z = s * -0.12;
    head.add(brow);
  });

  // nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 24), skin);
  nose.position.set(0, -0.1, 1.04);
  nose.scale.set(1, 0.9, 0.85);
  head.add(nose);

  // smile (lower half of a torus)
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.055, 16, 40, Math.PI), black);
  mouth.position.set(0, -0.4, 0.9);
  mouth.rotation.z = Math.PI;
  mouth.scale.set(1, 0.8, 1);
  head.add(mouth);

  // cap dome (upper hemisphere)
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(1.17, 48, 32, 0, Math.PI * 2, 0, Math.PI * 0.52),
    silver
  );
  dome.position.set(0, 0.3, 0);
  dome.scale.set(1.02, 1, 1.0);
  head.add(dome);

  // cap brim
  const brim = new THREE.Mesh(new THREE.SphereGeometry(0.92, 40, 20), silver);
  brim.scale.set(0.95, 0.1, 1.15);
  brim.position.set(0, 0.52, 0.62);
  brim.rotation.x = -0.18;
  head.add(brim);

  // cap button
  const button = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), silver);
  button.position.set(0, 1.44, 0);
  head.add(button);

  // ---- glasses (lenses just in front of the eyes; arms sweep back to the ears) ----
  const glasses = new THREE.Group();
  [-1, 1].forEach((s) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.032, 16, 36), frame);
    ring.position.set(s * 0.4, 0.07, 1.06);
    glasses.add(ring);
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.22, 36), lens);
    glass.position.set(s * 0.4, 0.07, 1.055);
    glasses.add(glass);
    // temple arm: from the lens hinge back to the ear (end tucks under the cup)
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.04), frame);
    arm.position.set(s * 0.82, 0.06, 0.65);
    arm.rotation.y = s * 1.10;
    glasses.add(arm);
  });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.04), frame);
  bridge.position.set(0, 0.1, 1.06);
  glasses.add(bridge);
  head.add(glasses);

  // ---- over-ear headphones ----
  const headphones = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.07, 16, 48, Math.PI), matte);
  band.position.set(0, -0.02, -0.12);
  headphones.add(band);
  [-1, 1].forEach((s) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 32), matte);
    cup.rotation.z = Math.PI / 2;
    cup.position.set(s * 1.12, -0.05, 0.02);
    headphones.add(cup);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 16, 32), accent);
    ring.rotation.y = Math.PI / 2;
    ring.position.set(s * 1.24, -0.05, 0.02);
    headphones.add(ring);
  });
  head.add(headphones);

  head.position.y = 0.35;

  // shoulders / sweater (stays static, doesn't turn with the head)
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(1.0, 0.8, 16, 32), dark);
  torso.position.set(0, -2.05, 0);
  torso.scale.set(1.55, 1, 1.0);

  const char = new THREE.Group();
  char.add(head, torso);
  scene.add(char);

  // ---- lights ----
  scene.add(new THREE.AmbientLight(0x556070, 1.5));
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(2, 4, 5); scene.add(key);
  const l1  = new THREE.PointLight(0x8b5cf6, 90, 30); l1.position.set(-4, 2, 3); scene.add(l1);
  const l2  = new THREE.PointLight(0xec4899, 75, 30); l2.position.set(4, -1, 3); scene.add(l2);
  const l3  = new THREE.PointLight(0x22d3ee, 45, 30); l3.position.set(0, 3, -4); scene.add(l3);

  const visible = onScreen(host);
  const clock = new THREE.Clock();

  function resize() {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  }
  addEventListener("resize", resize);

  function tick() {
    requestAnimationFrame(tick);
    if (!visible()) return;
    const t = clock.getElapsedTime();

    // head follows cursor
    head.rotation.y = lerp(head.rotation.y, pointer.x * 0.6, 0.07);
    head.rotation.x = lerp(head.rotation.x, pointer.y * 0.35, 0.07);

    // gentle idle float
    char.position.y = reduced ? 0 : Math.sin(t * 1.2) * 0.06;
    char.rotation.y = lerp(char.rotation.y, pointer.x * 0.15, 0.05);

    renderer.render(scene, camera);
  }
  tick();
}

/* =========================================================
   2) TECH STACK — floating labelled spheres
   ========================================================= */
function techScene() {
  const host = document.getElementById("techCanvas");
  if (!host) return;
  // Each sphere shows one skill.
  const skills = [
    ["HTML",   0xe34f26],
    ["CSS",    0x2965f1],
    ["JS",     0xf7df1e],
    ["TS",     0x3178c6],
    ["React",  0x61dafb],
    ["Next",   0xffffff],
    ["Node",   0x68a063],
    ["Three",  0xb0b0b8],
    ["GSAP",   0x88ce02],
    ["WebGL",  0xcf3b3b],
    ["Vue",    0x42b883],
    ["Figma",  0xf24e1e],
    ["Git",    0xf05032],
  ];

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.z = 9.5;
  const renderer = makeRenderer(host);

  scene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(5, 6, 8); scene.add(key);
  const rim = new THREE.PointLight(0x8b5cf6, 60, 40); rim.position.set(-6, -4, 4); scene.add(rim);

  function labelTexture(text, hex) {
    const s = 256;
    const c = document.createElement("canvas"); c.width = c.height = s;
    const ctx = c.getContext("2d");
    // full fill so the whole sphere is the brand colour (no transparent corners)
    ctx.fillStyle = "#" + hex.toString(16).padStart(6, "0");
    ctx.fillRect(0, 0, s, s);
    // contrast text colour from luminance
    const r = (hex >> 16) & 255, g = (hex >> 8) & 255, b = hex & 255;
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    ctx.fillStyle = lum > 150 ? "#15151b" : "#ffffff";
    ctx.font = "bold 60px 'Space Grotesk', Arial, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    // u=0.5 faces the camera; mirror at the seam so it reads from behind too
    ctx.fillText(text, s * 0.5, s * 0.5);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }

  const balls = [];
  skills.forEach(([label, hex]) => {
    const r = 0.6 + Math.random() * 0.25;
    const m = new THREE.MeshStandardMaterial({ map: labelTexture(label, hex), roughness: 0.4, metalness: 0.05 });
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 48), m);
    // spread them out across the field
    mesh.position.set((Math.random() - 0.5) * 11, (Math.random() - 0.5) * 5.5, (Math.random() - 0.5) * 4);
    mesh.userData.vel = new THREE.Vector3();
    mesh.userData.r = r;
    scene.add(mesh);
    balls.push(mesh);
  });

  // mouse tracking relative to the canvas (for ray-based repulsion)
  const ndc = new THREE.Vector2(-5, -5);
  let hovering = false;
  host.addEventListener("pointermove", (e) => {
    const rect = host.getBoundingClientRect();
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    hovering = true;
  });
  host.addEventListener("pointerleave", () => { hovering = false; });

  const ray = new THREE.Raycaster();
  const closest = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const visible = onScreen(host);

  // keep spheres apart and inside a comfortable box
  const BOUND = new THREE.Vector3(6, 3.1, 2.2);
  const GAP = 1.15;          // extra spacing kept between spheres
  const MOUSE_R = 2.7;       // how close the cursor must get to scatter a ball

  function resize() {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  }
  addEventListener("resize", resize);

  function tick() {
    requestAnimationFrame(tick);
    if (!visible()) return;

    // mouse repulsion: push balls away from the cursor ray
    if (hovering && !reduced) {
      ray.setFromCamera(ndc, camera);
      balls.forEach((b) => {
        ray.ray.closestPointToPoint(b.position, closest);
        tmp.copy(b.position).sub(closest);
        const d = tmp.length();
        if (d < MOUSE_R) {
          tmp.normalize().multiplyScalar((MOUSE_R - d) * 0.085);
          b.userData.vel.add(tmp);
        }
      });
    }

    balls.forEach((b, i) => {
      // mutual repulsion → keep distance between balls
      for (let j = i + 1; j < balls.length; j++) {
        const o = balls[j];
        tmp.copy(b.position).sub(o.position);
        const d = tmp.length() || 0.0001;
        const min = b.userData.r + o.userData.r + GAP;
        if (d < min) {
          tmp.normalize().multiplyScalar((min - d) * 0.012);
          b.userData.vel.add(tmp);
          o.userData.vel.sub(tmp);
        }
      }
      // soft containment so they don't drift off-screen
      ["x", "y", "z"].forEach((ax) => {
        const lim = BOUND[ax];
        if (b.position[ax] >  lim) b.userData.vel[ax] -= (b.position[ax] - lim) * 0.01;
        if (b.position[ax] < -lim) b.userData.vel[ax] -= (b.position[ax] + lim) * 0.01;
      });
      // gentle idle drift
      if (!reduced) {
        b.userData.vel.x += (Math.random() - 0.5) * 0.0008;
        b.userData.vel.y += (Math.random() - 0.5) * 0.0008;
      }
      b.userData.vel.multiplyScalar(0.94);
      if (!reduced) b.position.add(b.userData.vel);
    });

    renderer.render(scene, camera);
  }
  tick();
}

/* =========================================================
   3) CONTACT — rotating wireframe globe
   ========================================================= */
function contactScene() {
  const host = document.getElementById("contactCanvas");
  if (!host) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.z = 4.4;
  const renderer = makeRenderer(host);

  const group = new THREE.Group();
  const solid = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.35, 4),
    new THREE.MeshBasicMaterial({ color: 0x0c0c14 })
  );
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.4, 4)),
    new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.55 })
  );
  group.add(solid, wire);

  // orbiting points
  const pts = new THREE.BufferGeometry();
  const N = 90, arr = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1), r = 1.7;
    arr[i*3]   = r * Math.sin(b) * Math.cos(a);
    arr[i*3+1] = r * Math.sin(b) * Math.sin(a);
    arr[i*3+2] = r * Math.cos(b);
  }
  pts.setAttribute("position", new THREE.BufferAttribute(arr, 3));
  const dots = new THREE.Points(pts, new THREE.PointsMaterial({ color: 0xec4899, size: 0.045 }));
  group.add(dots);
  scene.add(group);

  const visible = onScreen(host);
  function resize() {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  }
  addEventListener("resize", resize);

  function tick() {
    requestAnimationFrame(tick);
    if (!visible()) return;
    if (!reduced) { group.rotation.y += 0.004; group.rotation.x += 0.0015; }
    dots.rotation.y -= 0.002;
    group.rotation.x = lerp(group.rotation.x, pointer.y * 0.4, 0.04);
    renderer.render(scene, camera);
  }
  tick();
}

function lerp(a, b, n) { return (1 - n) * a + n * b; }

/* ---------- boot ---------- */
if (THREE) {
  const start = () => { heroScene(); techScene(); contactScene(); };
  if (document.readyState === "complete") start();
  else addEventListener("load", start);
}
