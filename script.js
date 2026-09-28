const root = document.documentElement;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

document.querySelectorAll(".year").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

/* ---------- Theme ---------- */

const themeMeta = document.querySelector('meta[name="theme-color"]');
const currentTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");
const syncThemeMeta = () => {
  if (themeMeta) {
    themeMeta.setAttribute("content", currentTheme() === "dark" ? "#111110" : "#f6f3ee");
  }
};

syncThemeMeta();
darkQuery.addEventListener("change", syncThemeMeta);

document.querySelector(".theme-toggle")?.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch (error) {}
  syncThemeMeta();
});

/* ---------- Mobile menu ---------- */

const menuToggle = document.querySelector(".menu-toggle");
const setMenu = (open) => {
  document.body.classList.toggle("menu-open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

menuToggle?.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
document.querySelectorAll(".nav-links a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* ---------- Scroll progress ---------- */

const progress = document.querySelector(".progress");
const timeline = document.querySelector(".tl");
const spineFill = document.querySelector(".tl-spine-fill");
const tlItems = [...document.querySelectorAll(".tl-item")];

const onScroll = () => {
  const scrollable = root.scrollHeight - window.innerHeight;
  if (progress) {
    progress.style.transform = `scaleX(${scrollable > 0 ? window.scrollY / scrollable : 0})`;
  }

  if (timeline && spineFill) {
    const rect = timeline.getBoundingClientRect();
    const marker = window.innerHeight * 0.62;
    const fill = Math.min(Math.max((marker - rect.top) / rect.height, 0), 1);
    timeline.style.setProperty("--fill", fill.toFixed(4));

    tlItems.forEach((item) => {
      const node = item.querySelector(".tl-node");
      if (node) {
        item.classList.toggle("is-passed", node.getBoundingClientRect().top < marker);
      }
    });
  }
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

/* ---------- Active nav link ---------- */

const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const watched = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

if ("IntersectionObserver" in window && watched.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  watched.forEach((section) => navObserver.observe(section));
}

/* ---------- Reveal on scroll ---------- */

const revealTargets = document.querySelectorAll(
  ".section-head, .about-body, .bento-card, .skill-group, .project, .freelance-band, .contact > *, .service, .steps li, .model, .enquire-copy, .form, .faq details"
);

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((target) => {
    const siblings = [...target.parentElement.children];
    target.style.setProperty("--delay", `${Math.min(siblings.indexOf(target), 5) * 70}ms`);
    target.classList.add("reveal");
    revealObserver.observe(target);
  });

  tlItems.forEach((item) => revealObserver.observe(item));
} else {
  tlItems.forEach((item) => item.classList.add("is-in"));
}

/* ---------- Rotating hero words ---------- */

const rotatorWord = document.querySelector(".rotator-word");

if (rotatorWord && !reduceMotion) {
  const words = [
    "distributed backends",
    "cloud data pipelines",
    "multi-tenant SaaS",
    "event-driven systems",
    "secure platforms"
  ];
  let index = 0;

  setInterval(() => {
    rotatorWord.classList.add("is-out");
    setTimeout(() => {
      index = (index + 1) % words.length;
      rotatorWord.textContent = words[index];
      rotatorWord.classList.remove("is-out");
      rotatorWord.classList.add("is-in");
      requestAnimationFrame(() => requestAnimationFrame(() => rotatorWord.classList.remove("is-in")));
    }, 280);
  }, 2600);
}

/* ---------- Dublin clock ---------- */

const clock = document.querySelector(".clock");

if (clock) {
  const formatter = new Intl.DateTimeFormat("en-IE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: clock.dataset.tz
  });
  const tick = () => {
    clock.textContent = formatter.format(new Date());
  };
  tick();
  setInterval(tick, 20000);
}

/* ---------- Timeline filter & expand ---------- */

const filterButtons = document.querySelectorAll("[data-filter]");

const applyFilter = (filter) => {
  let side = "left";
  tlItems.forEach((item) => {
    const type = item.dataset.type;
    const visible = filter === "all" || type === filter;
    item.hidden = !visible;
    if (visible && type !== "milestone") {
      item.dataset.side = side;
      side = side === "left" ? "right" : "left";
    }
  });
  onScroll();
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((other) => {
      const active = other === button;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-pressed", String(active));
    });
    applyFilter(button.dataset.filter);
  });
});

const expandButton = document.querySelector(".tl-expand");
const detailBlocks = document.querySelectorAll(".tl-more");

expandButton?.addEventListener("click", () => {
  const expand = expandButton.getAttribute("aria-pressed") !== "true";
  detailBlocks.forEach((block) => {
    block.open = expand;
  });
  expandButton.setAttribute("aria-pressed", String(expand));
  expandButton.textContent = expand ? "Collapse all" : "Expand all";
  onScroll();
});

detailBlocks.forEach((block) => block.addEventListener("toggle", onScroll));

/* ---------- Count-up numbers ---------- */

const counters = document.querySelectorAll("[data-count]");

if ("IntersectionObserver" in window && !reduceMotion) {
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countObserver.unobserve(entry.target);
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix ? new DOMParser().parseFromString(el.dataset.suffix, "text/html").body.textContent : "";
        const start = performance.now();
        const duration = 1200;
        const step = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((counter) => countObserver.observe(counter));
}

/* ---------- Copy email ---------- */

document.querySelectorAll(".copy-btn").forEach((button) => {
  const toast = button.parentElement.querySelector(".copy-toast");
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      if (toast) toast.textContent = "Copied to clipboard";
    } catch (error) {
      if (toast) toast.textContent = "Couldn't copy. Please select the address instead";
    }
    setTimeout(() => {
      if (toast) toast.textContent = "";
    }, 2200);
  });
});

/* ---------- Freelance enquiry form ---------- */

const enquiryForm = document.querySelector(".enquiry-form");

if (enquiryForm) {
  const status = enquiryForm.querySelector(".form-status");
  const submitButton = enquiryForm.querySelector("button[type='submit']");
  const serviceGroup = enquiryForm.querySelector(".choices");
  const recipient = "vedantvermaimpmail@gmail.com";

  const setStatus = (message, isError = false) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  };

  const validate = () => {
    let firstInvalid = null;
    enquiryForm.querySelectorAll("input[required]:not([type='radio']), textarea[required]").forEach((field) => {
      const invalid = !field.value.trim() || (field.type === "email" && !field.checkValidity());
      field.setAttribute("aria-invalid", String(invalid));
      if (invalid && !firstInvalid) firstInvalid = field;
    });

    const serviceMissing = !enquiryForm.querySelector("input[name='service']:checked");
    serviceGroup.classList.toggle("is-invalid", serviceMissing);
    if (serviceMissing && !firstInvalid) firstInvalid = serviceGroup.querySelector("input");

    return firstInvalid;
  };

  enquiryForm.addEventListener("input", (event) => {
    if (event.target.getAttribute("aria-invalid") === "true") {
      event.target.setAttribute("aria-invalid", "false");
    }
    if (event.target.name === "service") serviceGroup.classList.remove("is-invalid");
  });

  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const firstInvalid = validate();
    if (firstInvalid) {
      setStatus("Please add your name, a valid email, a service, and a few project details.", true);
      firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(enquiryForm).entries());
    const endpoint = enquiryForm.dataset.endpoint;

    if (endpoint) {
      submitButton.disabled = true;
      setStatus("Sending...");
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...data, _subject: `Freelance enquiry: ${data.service}` })
        });
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);
        enquiryForm.reset();
        setStatus("Thanks! Your enquiry is on its way. I'll reply by email.");
      } catch (error) {
        setStatus(`Something went wrong. Please email me at ${recipient}.`, true);
      } finally {
        submitButton.disabled = false;
      }
      return;
    }

    const subject = `Freelance enquiry: ${data.service} (${data.name})`;
    const body = [
      `Name: ${data.name}`,
      `Email: ${data.email}`,
      data.company ? `Company: ${data.company}` : null,
      `Service: ${data.service}`,
      `Budget: ${data.budget}`,
      `Timeline: ${data.timeline}`,
      "",
      data.message
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("Your email app should open with the enquiry ready to send.");
  });
}
