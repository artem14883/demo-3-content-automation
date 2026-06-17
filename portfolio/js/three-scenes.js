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

  // ---- materials ----
  const skin   = new THREE.MeshPhysicalMaterial({ color: 0xd99873, roughness: 0.55, clearcoat: 0.4, clearcoatRoughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color(0xffd9c0) });
  const silver = new THREE.MeshPhysicalMaterial({ color: 0xeaeaf0, roughness: 0.28, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.2 });
  const dark   = new THREE.MeshStandardMaterial({ color: 0x16161d, roughness: 0.7 });
  const white  = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
  const black  = new THREE.MeshStandardMaterial({ color: 0x0b0b0d, roughness: 0.25 });

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
    pupil.position.set(s * 0.4, 0.06, 1.02);
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
  const labels = ["JS","TS","React","Next","Node","Three","GSAP","WebGL","CSS","Figma","Vue","Git"];
  const colors = [0xf7df1e,0x3178c6,0x61dafb,0xffffff,0x68a063,0x8b5cf6,0x88ce02,0x990000,0x2965f1,0xf24e1e,0x42b883,0xf05032];

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.z = 10;
  const renderer = makeRenderer(host);

  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(5, 6, 8); scene.add(key);
  const rim = new THREE.PointLight(0x8b5cf6, 60, 40); rim.position.set(-6, -4, 4); scene.add(rim);

  function labelTexture(text, hex) {
    const s = 256;
    const c = document.createElement("canvas"); c.width = c.height = s;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#" + hex.toString(16).padStart(6, "0");
    ctx.beginPath(); ctx.arc(s/2, s/2, s/2, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = (hex === 0xffffff) ? "#111" : "#fff";
    ctx.font = "bold 70px 'Space Grotesk', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, s/2, s/2 + 4);
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    return tex;
  }

  const balls = [];
  const R = 4.2;
  labels.forEach((label, i) => {
    const r = 0.55 + Math.random() * 0.35;
    const g = new THREE.SphereGeometry(r, 32, 32);
    const m = new THREE.MeshStandardMaterial({
      map: labelTexture(label, colors[i]),
      roughness: 0.35, metalness: 0.1,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set((Math.random()-0.5)*R*2, (Math.random()-0.5)*R, (Math.random()-0.5)*R);
    mesh.userData.vel = new THREE.Vector3((Math.random()-0.5)*0.01,(Math.random()-0.5)*0.01,(Math.random()-0.5)*0.01);
    mesh.userData.r = r;
    scene.add(mesh);
    balls.push(mesh);
  });

  const visible = onScreen(host);

  function resize() {
    camera.aspect = host.clientWidth / host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
  }
  addEventListener("resize", resize);

  const center = new THREE.Vector3(0, 0, 0);
  const tmp = new THREE.Vector3();

  function tick() {
    requestAnimationFrame(tick);
    if (!visible()) return;

    balls.forEach((b, i) => {
      // gentle pull toward center + soft separation
      tmp.copy(center).sub(b.position).multiplyScalar(0.0006);
      b.userData.vel.add(tmp);
      for (let j = i + 1; j < balls.length; j++) {
        const o = balls[j];
        tmp.copy(b.position).sub(o.position);
        const d = tmp.length();
        const min = b.userData.r + o.userData.r;
        if (d < min && d > 0.0001) {
          tmp.normalize().multiplyScalar((min - d) * 0.02);
          b.userData.vel.add(tmp);
          o.userData.vel.sub(tmp);
        }
      }
      b.userData.vel.multiplyScalar(0.985);
      if (!reduced) b.position.add(b.userData.vel);
      b.rotation.x += 0.003; b.rotation.y += 0.004;
    });

    scene.rotation.y = lerp(scene.rotation.y, pointer.x * 0.5, 0.04);
    scene.rotation.x = lerp(scene.rotation.x, pointer.y * 0.3, 0.04);

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
