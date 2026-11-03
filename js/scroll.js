/* ============================================
   SCROLL.JS — Animaciones de scroll + progreso
   Invitación de Boda — Jhonatan & Sarai
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     1. REVEAL AL SCROLL (IntersectionObserver)
     ============================================ */
  function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    if (!("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ============================================
     2. PARALLAX SUAVE EN RAMAS DE ESQUINA
     ============================================ */
  function initLeafParallax() {
    const corners = document.querySelectorAll(".leaf-corner");
    if (!corners.length) return;

    if (window.innerWidth < 768) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.pageYOffset;

      corners.forEach((corner) => {
        const speed =
          corner.classList.contains("leaf-corner--tl") ||
          corner.classList.contains("leaf-corner--tr")
            ? 0.15
            : -0.1;

        corner.style.transform = `translateY(${scrollY * speed}px)`;
      });

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true },
    );
  }

  /* ============================================
     3. BARRA DE PROGRESO DE LECTURA
     ============================================ */
  function initReadingProgress() {
    const bar = document.createElement("div");
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      height: 2px;
      width: 0%;
      background: linear-gradient(90deg, #9CAF88, #C9A961);
      z-index: 9999;
      transition: width 0.1s linear;
      pointer-events: none;
    `;
    document.body.appendChild(bar);

    let ticking = false;

    function updateBar() {
      const scrollTop = window.pageYOffset;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = `${percent}%`;
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(updateBar);
          ticking = true;
        }
      },
      { passive: true },
    );

    updateBar();
  }

  /* ============================================
     4. SCROLL SUAVE CON data-scroll
     ============================================ */
  function initSmoothScroll() {
    const links = document.querySelectorAll("[data-scroll]");
    if (!links.length) return;

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const targetId = link.getAttribute("href");
        if (!targetId || !targetId.startsWith("#")) return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ============================================
     5. INICIALIZACIÓN
     ============================================ */
  function init() {
    initReveal();
    initLeafParallax();
    initReadingProgress();
    initSmoothScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
