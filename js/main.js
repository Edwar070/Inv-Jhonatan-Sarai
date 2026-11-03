/* ============================================
   MAIN.JS — Funciones generales
   Invitación de Boda — Jhonatan & Sarai
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     1. PARTÍCULAS DECORATIVAS
     Doradas y verdes flotando
     ============================================ */
  function initParticles() {
    const container = document.getElementById("particles");
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 14 : 26;

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.classList.add("particle");
      particle.classList.add(
        Math.random() > 0.5 ? "particle--gold" : "particle--sage",
      );

      const size = Math.random() * 6 + 4;
      const left = Math.random() * 100;
      const duration = Math.random() * 12 + 12;
      const delay = Math.random() * 10;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${left}%`;
      particle.style.animationDuration = `${duration}s`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.opacity = Math.random() * 0.5 + 0.3;

      container.appendChild(particle);
    }
  }

  /* ============================================
     2. HOJAS CAYENDO
     ============================================ */
  function initFallingLeaves() {
    const container = document.getElementById("fallingLeaves");
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 6 : 12;

    const leafSVG = `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
        <path d="M12 2 C 8 8, 6 14, 10 20 C 12 18, 14 14, 12 2 Z" />
        <path d="M12 2 C 16 8, 18 14, 14 20 C 12 18, 10 14, 12 2 Z" opacity="0.5" />
      </svg>
    `;

    for (let i = 0; i < count; i++) {
      const leaf = document.createElement("span");
      leaf.classList.add("falling-leaf");
      if (Math.random() > 0.5) leaf.classList.add("falling-leaf--gold");

      const size = Math.random() * 12 + 12;
      const left = Math.random() * 100;
      const duration = Math.random() * 12 + 14;
      const delay = Math.random() * 15;

      leaf.style.width = `${size}px`;
      leaf.style.height = `${size}px`;
      leaf.style.left = `${left}%`;
      leaf.style.animationDuration = `${duration}s`;
      leaf.style.animationDelay = `${delay}s`;
      leaf.style.opacity = Math.random() * 0.5 + 0.4;
      leaf.innerHTML = leafSVG;

      container.appendChild(leaf);
    }
  }

  /* ============================================
     3. RSVP → WhatsApp
     ============================================ */
  function initWhatsApp() {
    const waBtn = document.getElementById("waBtn");
    if (!waBtn) return;

    // ⚠️ CAMBIA ESTE NÚMERO POR EL REAL
    const PHONE = "59178331146";

    const message = encodeURIComponent(
      "¡Hola Jhonatan y Sarai! 💚\n\n" +
        "Confirmo mi asistencia a su boda del 22 de diciembre de 2026.\n\n" +
        "Nombre: \n" +
        "Número de invitados: \n" +
        "¿Alguna restricción alimentaria?: \n\n" +
        "¡Muchas felicidades! 🎉",
    );

    waBtn.href = `https://wa.me/${PHONE}?text=${message}`;
  }

  /* ============================================
     4. SWATCHES (accesibilidad)
     ============================================ */
  function initSwatches() {
    document.querySelectorAll(".swatch").forEach((sw) => {
      const title = sw.getAttribute("title");
      if (title) sw.setAttribute("aria-label", title);
    });
  }

  /* ============================================
     5. UTILIDADES
     ============================================ */
  function preventHorizontalScroll() {
    document.documentElement.style.overflowX = "hidden";
    document.body.style.overflowX = "hidden";
  }

  function preventDoubleTapZoom() {
    let lastTouchEnd = 0;
    document.addEventListener(
      "touchend",
      (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
      },
      { passive: false },
    );
  }

  /* ============================================
     6. INICIALIZACIÓN
     ============================================ */
  function init() {
    initParticles();
    initFallingLeaves();
    initWhatsApp();
    initSwatches();
    preventHorizontalScroll();
    preventDoubleTapZoom();

    console.log(
      "%c💚 Jhonatan & Sarai · 22.12.2026",
      "color: #5A6B4E; font-size: 14px; font-weight: bold;",
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();