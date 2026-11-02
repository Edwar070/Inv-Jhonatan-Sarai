/* ============================================
   MUSIC.JS — Reproductor de música flotante
   Invitación de Boda — Jonathan & Sarai
   Versión mejorada: memoria, volumen suave, UX premium
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

  // Volumen suave por defecto
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
     Mostrar estado de carga en el botón
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
     Guardar preferencia en localStorage
     ============================================ */
  function savePreference(playing) {
    try {
      localStorage.setItem(STORAGE_KEY, playing ? "1" : "0");
    } catch (e) {
      // localStorage puede estar bloqueado en modo privado
    }
  }

  function getPreference() {
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
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
            savePreference(false);
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
        .catch(() => {
          // Si el navegador lo bloquea, dejamos el botón listo
          setPlayingState(false);
        });
    }
  });

  audio.addEventListener("canplaythrough", () => {
    setLoadingState(false);
  });

  audio.addEventListener("play", () => setPlayingState(true));
  audio.addEventListener("pause", () => setPlayingState(false));

  audio.addEventListener("ended", () => {
    // El atributo loop ya lo reinicia, pero aseguramos UI
    setPlayingState(false);
  });

  audio.addEventListener("error", (e) => {
    console.warn("Error al cargar el audio:", e);
    setPlayingState(false);
    setLoadingState(false);
    player.classList.add("error");
  });

  /* ============================================
     Timeout de seguridad:
     Si el audio no carga en 8 segundos, asumir
     que algo falla y no dejar el estado "loading"
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
     (ahorra batería y evita música de fondo)
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
     (por si hay un video o audio fuera)
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
     (Flecha izquierda/derecha salta 5 segundos)
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

  /* ============================================
     Log de bienvenida
     ============================================ */
  console.log(
    "%c🎵 Reproductor listo · Jonathan & Sarai",
    "color: #5A6B4E; font-size: 12px;",
  );
})();
