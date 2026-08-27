/* =============================================================================
   MUEBLERÍAS JAC — Interacciones del sitio
   Depende de js/config.js (window.SITE_CONFIG)
   ============================================================================= */

(function () {
  const cfg = window.SITE_CONFIG || {};

  const waLink = () =>
    `https://wa.me/${cfg.whatsappIntl || "573002073265"}?text=${encodeURIComponent(
      "Hola, deseo información sobre Mueblerías JAC."
    )}`;

  const formatPhone = (raw) => {
    const d = String(raw || "").replace(/\D/g, "");
    if (d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
    return raw || "";
  };

  /* ---------- Bind de datos desde config ---------- */
  function bindConfig() {
    document.querySelectorAll("[data-bind]").forEach((el) => {
      const key = el.getAttribute("data-bind");
      const value = cfg[key];
      if (value == null) return;
      if (el.tagName === "A" && (key === "correo" || key === "whatsapp")) {
        if (key === "correo") el.href = `mailto:${value}`;
        if (key === "whatsapp") el.href = waLink();
      }
      el.textContent = key === "whatsapp" ? formatPhone(value) : value;
    });

    document.querySelectorAll("[data-bind-html]").forEach((el) => {
      const key = el.getAttribute("data-bind-html");
      if (cfg[key]) el.innerHTML = cfg[key];
    });

    document.querySelectorAll("[data-wa]").forEach((a) => {
      a.href = waLink();
    });

    document.querySelectorAll("[data-mail]").forEach((a) => {
      a.href = `mailto:${cfg.correo || ""}`;
    });

    document.querySelectorAll("[data-campaign]").forEach((el) => {
      if (el.tagName === "INPUT") el.value = cfg.campaignId || "";
      else el.textContent = cfg.campaignId || "";
    });
  }

  /* ---------- Header / nav ---------- */
  function initHeader() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (!header) return;

    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      if (header.dataset.theme === "light") {
        header.classList.toggle("is-light", y > 40);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && nav) {
      toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
      nav.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => nav.classList.remove("is-open"))
      );
    }

    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href === path || (path === "" && href.includes("index"))) {
        a.classList.add("is-active");
      }
    });
  }

  /* ---------- Hero carousel ---------- */
  function initHero() {
    const slides = [...document.querySelectorAll(".hero-slide")];
    const dotsWrap = document.querySelector(".hero-dots");
    if (!slides.length) return;

    let i = 0;
    slides.forEach((_, idx) => {
      if (!dotsWrap) return;
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `Imagen ${idx + 1}`);
      b.addEventListener("click", () => go(idx));
      dotsWrap.appendChild(b);
    });

    const dots = [...(dotsWrap ? dotsWrap.children : [])];

    function go(n) {
      slides[i].classList.remove("is-active");
      if (dots[i]) dots[i].classList.remove("is-active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active");
      if (dots[i]) dots[i].classList.add("is-active");
    }

    go(0);
    setInterval(() => go(i + 1), 6500);
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Contadores ---------- */
  function initCounters() {
    const nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;

    const animate = (el) => {
      const target = Number(el.getAttribute("data-count"));
      const suffix = el.getAttribute("data-suffix") || "";
      const prefix = el.getAttribute("data-prefix") || "";
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString("es-CO") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    nums.forEach((el) => io.observe(el));
  }

  /* ---------- Historia desde config ---------- */
  function renderHistoria() {
    const wrap = document.querySelector("[data-historia]");
    if (!wrap || !Array.isArray(cfg.historia)) return;
    wrap.innerHTML = cfg.historia
      .map(
        (h) => `
      <article class="timeline-item reveal">
        <div class="timeline-year">${h.year}</div>
        <div class="timeline-card">
          <img src="${h.image}" alt="${h.title}">
          <div class="txt">
            <h3>${h.title}</h3>
            <p>${h.text}</p>
          </div>
        </div>
      </article>`
      )
      .join("");
  }

  function renderValores() {
    const wrap = document.querySelector("[data-valores]");
    if (!wrap || !Array.isArray(cfg.valores)) return;
    wrap.innerHTML = cfg.valores
      .map(
        (v, i) => `
      <article class="card reveal">
        <span class="card-num">0${i + 1}</span>
        <h3>${v.title}</h3>
        <p>${v.text}</p>
      </article>`
      )
      .join("");
  }

  /* ---------- Lightbox galería ---------- */
  function initLightbox() {
    const figures = document.querySelectorAll(".gallery figure");
    if (!figures.length) return;

    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `<button type="button" aria-label="Cerrar">×</button><img alt="">`;
    document.body.appendChild(box);
    const img = box.querySelector("img");
    const close = () => box.classList.remove("is-open");

    box.addEventListener("click", (e) => {
      if (e.target === box || e.target.tagName === "BUTTON") close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    figures.forEach((fig) => {
      fig.addEventListener("click", () => {
        const src = fig.querySelector("img").src;
        img.src = src.replace("w=1200", "w=1800");
        img.alt = fig.querySelector("img").alt || "";
        box.classList.add("is-open");
      });
    });
  }

  /* ---------- Cookies ---------- */
  const COOKIE_KEY = "mjac_cookie_pref";

  function initCookies() {
    const banner = document.querySelector(".cookie-banner");
    const modal = document.querySelector(".cookie-modal");
    if (!banner) return;

    const saved = localStorage.getItem(COOKIE_KEY);
    if (!saved) banner.classList.add("is-visible");

    const save = (pref) => {
      localStorage.setItem(COOKIE_KEY, JSON.stringify(pref));
      banner.classList.remove("is-visible");
      if (modal) modal.classList.remove("is-open");
    };

    document.querySelectorAll("[data-cookie-accept]").forEach((b) =>
      b.addEventListener("click", () =>
        save({ necessary: true, analytics: true, marketing: true })
      )
    );
    document.querySelectorAll("[data-cookie-reject]").forEach((b) =>
      b.addEventListener("click", () =>
        save({ necessary: true, analytics: false, marketing: false })
      )
    );
    document.querySelectorAll("[data-cookie-config]").forEach((b) =>
      b.addEventListener("click", () => modal && modal.classList.add("is-open"))
    );
    document.querySelectorAll("[data-cookie-close]").forEach((b) =>
      b.addEventListener("click", () => modal && modal.classList.remove("is-open"))
    );
    const saveCfg = document.querySelector("[data-cookie-save]");
    if (saveCfg) {
      saveCfg.addEventListener("click", () => {
        save({
          necessary: true,
          analytics: !!document.querySelector("#ck-analytics")?.checked,
          marketing: !!document.querySelector("#ck-marketing")?.checked,
        });
      });
    }
  }

  /* ---------- Formulario ---------- */
  function initForm() {
    const form = document.querySelector("#contact-form");
    if (!form) return;
    const success = document.querySelector(".form-success");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const terms = form.querySelector("#acepto");
      const required = [...form.querySelectorAll("[required]")];
      const empty = required.some((f) => (f.type === "checkbox" ? !f.checked : !String(f.value).trim()));

      if (empty || (terms && !terms.checked)) {
        form.classList.add("is-invalid");
        return;
      }
      form.classList.remove("is-invalid");
      form.hidden = true;
      if (success) success.classList.add("is-visible");
    });
  }

  /* ---------- Año en footer ---------- */
  function initYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindConfig();
    renderHistoria();
    renderValores();
    initHeader();
    initHero();
    initReveal();
    initCounters();
    initLightbox();
    initCookies();
    initForm();
    initYear();
  });
})();
