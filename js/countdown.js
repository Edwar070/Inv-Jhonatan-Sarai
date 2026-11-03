/* ============================================
   COUNTDOWN.JS — Cuenta regresiva
   Invitación de Boda — Jhonatan & Sarai
   ============================================ */

(function () {
  "use strict";

  // ⚠️ Fecha objetivo: 22 de diciembre de 2026, 17:00 (hora local)
  const TARGET_DATE = new Date("2026-12-22T17:00:00").getTime();

  const daysEl = document.getElementById("cDays");
  const hoursEl = document.getElementById("cHours");
  const minutesEl = document.getElementById("cMinutes");
  const secondsEl = document.getElementById("cSeconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  let prevValues = {
    days: "",
    hours: "",
    minutes: "",
    seconds: "",
  };

  let intervalId = null;

  function pad(num) {
    return String(num).padStart(2, "0");
  }

  /* Solo animamos el número, no el contorno */
  function updateEl(el, value, key) {
    if (prevValues[key] === value) return;

    el.textContent = value;
    prevValues[key] = value;

    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "flipNumber 0.6s ease";
  }

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = TARGET_DATE - now;

    if (distance < 0) {
      updateEl(daysEl, "00", "days");
      updateEl(hoursEl, "00", "hours");
      updateEl(minutesEl, "00", "minutes");
      updateEl(secondsEl, "00", "seconds");

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    updateEl(daysEl, pad(days), "days");
    updateEl(hoursEl, pad(hours), "hours");
    updateEl(minutesEl, pad(minutes), "minutes");
    updateEl(secondsEl, pad(seconds), "seconds");
  }

  function startCountdown() {
    if (intervalId) return;
    updateCountdown();
    intervalId = setInterval(updateCountdown, 1000);
  }

  function stopCountdown() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCountdown();
    } else {
      startCountdown();
    }
  });

  startCountdown();
})();