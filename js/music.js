/* ============================================
   MUSIC.JS — Reproductor de música flotante
   Invitación de Boda — Jhonatan & Sarai
   Autoplay al primer gesto + memoria de preferencia
   ============================================ */

(function () {
  "use strict";

  /* ============================================
     Referencias del DOM
     ============================================ */
  const audio = document.getElementById("audio");
  const player = document.getElementById("musicPlayer");
  const btn = document.getElementById("mpBtn");
  const iconPlay = document.getElementById("mpIconPlay");
  const iconPause = document.getElementById("mpIconPause");
  const progressBar = document.getElementById("mpProgressBar");
  const progress = document.getElementById("mpProgress");

  if (!audio || !btn || !player) return;

  /* ============================================
     Configuración inicial
     ============================================ */
  const STORAGE_KEY = "jy-music-preference";
  const VOLUME = 0.5; // Volumen suave (0.0 - 1.0)

  let isPlaying = false;
  let isReady = false; // Se activa cuando el audio puede reproducirse

  audio.volume = VOLUME;

  /* ============================================
     Actualizar UI según estado
     ============================================ */
  function setPlayingState(playing) {
    isPlaying = playing;
    player.classList.toggle("playing", playing);
    iconPlay.style.display = playing ? "none" : "block";
    iconPause.style.display = playing ? "block" : "none";
    btn.setAttribute(
      "aria-label",
      playing ? "Pausar la canción" : "Reproducir la canción",
    );
  }

  /* ============================================
     Mostrar estado de carga
     ============================================ */
  function setLoadingState(loading) {
    player.classList.toggle("loading", loading);
    if (loading) {
      btn.setAttribute("aria-label", "Cargando canción...");
      btn.disabled = true;
    } else {
      btn.disabled = false;
    }
  }

  /* ============================================
     Guardar/leer preferencia
     ============================================ */
  function savePreference(playing) {
    try {
      localStorage.setItem(STORAGE_KEY, playing ? "1" : "0");
    } catch (e) {
      /* localStorage bloqueado */
    }
  }

  function getPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function hasUserExplicitlyDisabled() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "0";
    } catch (e) {
      return false;
    }
  }

  /* ============================================
     Reproducir / Pausar
     ============================================ */
  function togglePlay() {
    if (!isReady) return;

    if (isPlaying) {
      audio.pause();
      setPlayingState(false);
      savePreference(false);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayingState(true);
            savePreference(true);
          })
          .catch((err) => {
            console.warn("No se pudo reproducir el audio:", err);
            setPlayingState(false);
          });
      }
    }
  }

  btn.addEventListener("click", togglePlay);

  /* ============================================
     Barra de progreso
     ============================================ */
  function updateProgress() {
    if (!audio.duration) return;
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${percent}%`;
    if (progress) {
      progress.setAttribute("aria-valuenow", Math.round(percent));
    }
  }

  audio.addEventListener("timeupdate", updateProgress);

  /* ============================================
     Eventos del audio
     ============================================ */
  audio.addEventListener("loadedmetadata", () => {
    isReady = true;
    setLoadingState(false);
    updateProgress();

    // Si el usuario ya había activado la música antes, intentar reproducir
    if (getPreference()) {
      audio
        .play()
        .then(() => setPlayingState(true))
        .catch(() => setPlayingState(false));
    }
  });

  audio.addEventListener("canplaythrough", () => {
    setLoadingState(false);
  });

  audio.addEventListener("play", () => setPlayingState(true));
  audio.addEventListener("pause", () => setPlayingState(false));

  audio.addEventListener("ended", () => {
    setPlayingState(false);
  });

  audio.addEventListener("error", (e) => {
    console.warn("Error al cargar el audio:", e);
    setPlayingState(false);
    setLoadingState(false);
    player.classList.add("error");
  });

  /* ============================================
     AUTOPLAY AL PRIMER GESTO DEL USUARIO
     Los navegadores bloquean autoplay con sonido;
     este es el método más confiable y respetuoso.
     ============================================ */
  function tryAutoplayOnFirstGesture() {
    if (isPlaying) return;
    if (hasUserExplicitlyDisabled()) return;

    if (!isReady) {
      // Esperar a que cargue y reintentar una sola vez
      audio.addEventListener("loadedmetadata", tryAutoplayOnFirstGesture, {
        once: true,
      });
      return;
    }

    audio
      .play()
      .then(() => {
        setPlayingState(true);
        savePreference(true);
        removeGestureListeners();
      })
      .catch(() => {
        // El navegador lo bloqueó; no pasa nada
      });
  }

  const gestureEvents = ["pointerdown", "touchstart", "keydown", "click"];

  function removeGestureListeners() {
    gestureEvents.forEach((evt) =>
      document.removeEventListener(evt, tryAutoplayOnFirstGesture, true),
    );
  }

  // Activar autoplay solo si el usuario NO lo desactivó explícitamente
  if (!hasUserExplicitlyDisabled()) {
    gestureEvents.forEach((evt) =>
      document.addEventListener(evt, tryAutoplayOnFirstGesture, {
        capture: true,
        passive: true,
      }),
    );
  }

  /* ============================================
     Timeout de seguridad
     ============================================ */
  setLoadingState(true);
  setTimeout(() => {
    if (!isReady) {
      console.warn("El audio tardó demasiado en cargar.");
      setLoadingState(false);
    }
  }, 8000);

  /* ============================================
     Auto-pausar al salir de la pestaña
     ============================================ */
  let wasPlayingBeforeHide = false;

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      wasPlayingBeforeHide = isPlaying;
      if (isPlaying) audio.pause();
    } else if (wasPlayingBeforeHide) {
      audio
        .play()
        .then(() => setPlayingState(true))
        .catch(() => {});
      wasPlayingBeforeHide = false;
    }
  });

  /* ============================================
     Pausar cuando otro medio empiece
     ============================================ */
  document.addEventListener(
    "play",
    (e) => {
      if (e.target !== audio && isPlaying) {
        audio.pause();
      }
    },
    true,
  );

  /* ============================================
     Accesibilidad: barra de progreso con teclado
     ============================================ */
  if (progress) {
    progress.setAttribute("tabindex", "0");
    progress.setAttribute("role", "slider");
    progress.setAttribute("aria-label", "Progreso de la canción");
    progress.setAttribute("aria-valuemin", "0");
    progress.setAttribute("aria-valuemax", "100");

    progress.addEventListener("keydown", (e) => {
      if (!audio.duration) return;

      if (e.key === "ArrowRight") {
        audio.currentTime = Math.min(audio.currentTime + 5, audio.duration);
        e.preventDefault();
      } else if (e.key === "ArrowLeft") {
        audio.currentTime = Math.max(audio.currentTime - 5, 0);
        e.preventDefault();
      } else if (e.key === " " || e.key === "Enter") {
        togglePlay();
        e.preventDefault();
      }
    });
  }

  console.log(
    "%c🎵 Reproductor listo · Jonathan & Sarai",
    "color: #5A6B4E; font-size: 12px;",
  );
})();
