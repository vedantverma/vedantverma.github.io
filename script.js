const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const year = document.querySelector("#year");
const progress = document.querySelector(".scroll-progress");
const heroImage = document.querySelector(".hero-image");
const pointerGlow = document.querySelector(".pointer-glow");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sections = document.querySelectorAll("section[id]");

year.textContent = new Date().getFullYear();

const updateScrollEffects = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 20);
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const amount = scrollable > 0 ? window.scrollY / scrollable : 0;
  if (progress) {
    progress.style.transform = `scaleX(${Math.min(Math.max(amount, 0), 1)})`;
  }

  if (heroImage && !reduceMotion) {
    heroImage.style.setProperty("--hero-shift", `${window.scrollY * 0.08}px`);
  }
};

updateScrollEffects();
window.addEventListener("scroll", updateScrollEffects, { passive: true });

if (pointerGlow && !reduceMotion) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let glowX = pointerX;
  let glowY = pointerY;

  window.addEventListener(
    "pointermove",
    (event) => {
      document.body.classList.add("has-pointer");
      pointerX = event.clientX;
      pointerY = event.clientY;
    },
    { passive: true }
  );

  const moveGlow = () => {
    glowX += (pointerX - glowX) * 0.12;
    glowY += (pointerY - glowY) * 0.12;
    pointerGlow.style.transform = `translate3d(${glowX - 176}px, ${glowY - 176}px, 0)`;
    requestAnimationFrame(moveGlow);
  };

  moveGlow();
}

navToggle.addEventListener("click", () => {
  const nextState = !document.body.classList.contains("nav-open");
  document.body.classList.toggle("nav-open", nextState);
  navToggle.setAttribute("aria-expanded", String(nextState));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealTargets = document.querySelectorAll(
  ".signature-copy, .signature-nameplate, .signature-facts article, .focus-card, .experience-panel, .experience-points li, .lab-copy, .lab-stage, .impact-card, .stack-group, .education-card, .map-copy, .map-frame"
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealTargets.forEach((target, index) => {
    target.style.setProperty("--reveal-delay", `${(index % 6) * 55}ms`);
    target.classList.add("reveal");
    revealObserver.observe(target);
  });
}

if ("IntersectionObserver" in window) {
  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isActive);
        });
      });
    },
    { rootMargin: "-38% 0px -50% 0px", threshold: 0.01 }
  );

  sections.forEach((section) => activeObserver.observe(section));
}

const canvas = document.querySelector("#systemMap");
const ctx = canvas ? canvas.getContext("2d") : null;
const nodes = [
  { x: 0.15, y: 0.24, r: 4, label: "api" },
  { x: 0.32, y: 0.18, r: 5, label: "auth" },
  { x: 0.52, y: 0.25, r: 4, label: "tenant" },
  { x: 0.73, y: 0.17, r: 6, label: "meter" },
  { x: 0.88, y: 0.34, r: 4, label: "stripe" },
  { x: 0.22, y: 0.54, r: 5, label: "scheduler" },
  { x: 0.43, y: 0.48, r: 4, label: "sns" },
  { x: 0.64, y: 0.55, r: 5, label: "etl" },
  { x: 0.82, y: 0.72, r: 4, label: "s3" },
  { x: 0.33, y: 0.79, r: 6, label: "logs" },
  { x: 0.56, y: 0.82, r: 4, label: "profiling" }
];

const links = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 7],
  [2, 6]
];

let pointer = { x: 0.5, y: 0.5 };
let rafId = 0;

function resizeCanvas() {
  if (!canvas || !ctx) {
    return;
  }
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawSystemMap(time = 0) {
  if (!canvas || !ctx) {
    return;
  }
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  ctx.clearRect(0, 0, width, height);

  const gridSize = 42;
  ctx.strokeStyle = "rgba(255, 254, 250, 0.055)";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const positions = nodes.map((node, index) => {
    const drift = Math.sin(time / 1100 + index) * 5;
    const pullX = (pointer.x - 0.5) * (index % 2 === 0 ? 8 : -6);
    const pullY = (pointer.y - 0.5) * (index % 2 === 0 ? -6 : 8);
    return {
      ...node,
      px: node.x * width + drift + pullX,
      py: node.y * height + Math.cos(time / 1300 + index) * 5 + pullY
    };
  });

  links.forEach(([from, to], index) => {
    const a = positions[from];
    const b = positions[to];
    const pulse = (Math.sin(time / 520 + index) + 1) / 2;
    ctx.strokeStyle = `rgba(0, 168, 143, ${0.2 + pulse * 0.26})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(a.px, a.py);
    ctx.lineTo(b.px, b.py);
    ctx.stroke();

    const t = (time / 1800 + index * 0.13) % 1;
    ctx.fillStyle = index % 3 === 0 ? "rgba(242, 173, 63, 0.92)" : "rgba(255, 254, 250, 0.9)";
    ctx.beginPath();
    ctx.arc(a.px + (b.px - a.px) * t, a.py + (b.py - a.py) * t, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  positions.forEach((node, index) => {
    const active = Math.sin(time / 700 + index) > 0.45;
    ctx.fillStyle = active ? "rgba(242, 173, 63, 0.95)" : "rgba(0, 168, 143, 0.95)";
    ctx.strokeStyle = "rgba(255, 254, 250, 0.62)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(node.px, node.py, node.r + (active ? 1.5 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 254, 250, 0.7)";
    ctx.font = "700 11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillText(node.label, node.px + 10, node.py - 10);
  });

  rafId = requestAnimationFrame(drawSystemMap);
}

if (canvas) {
  resizeCanvas();
  drawSystemMap();

  window.addEventListener("resize", resizeCanvas);
  canvas.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height
    };
  });
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(rafId);
  } else if (canvas) {
    drawSystemMap();
  }
});
