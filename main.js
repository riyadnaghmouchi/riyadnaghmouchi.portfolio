// -------- Thème (light/dark) --------
(function initTheme() {
  const root = document.documentElement;
  const STORAGE_KEY = "theme-preference";

  const getStoredTheme = () => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const setStoredTheme = (val) => {
    try {
      localStorage.setItem(STORAGE_KEY, val);
    } catch {}
  };

  const applyTheme = (mode) => {
    if (mode === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme"); // light par défaut
    updateToggleIcon();
  };

  // Si l’utilisateur n’a rien choisi, on suit le système
  const systemPrefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const saved = getStoredTheme(); // 'light' | 'dark' | null
  applyTheme(saved ?? (systemPrefersDark ? "dark" : "light"));

  // Met à jour l’icône du bouton
  function updateToggleIcon() {
    const icon = document.getElementById("theme-icon");
    if (!icon) return;
    const isDark = root.getAttribute("data-theme") === "dark";
    icon.textContent = isDark ? "☀️" : "🌙";
  }

  // Bascule sur clic
  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      applyTheme(next);
      setStoredTheme(next);
    });
  });

  // Si l’OS change de thème en live, on suit seulement si l’utilisateur n’a rien choisi manuellement
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", (e) => {
      const stored = getStoredTheme();
      if (stored) return; // l’utilisateur a choisi -> ne pas écraser
      applyTheme(e.matches ? "dark" : "light");
    });
  }
})();

// -------- Flag CSS pour le reveal --------
document.documentElement.classList.add("js-enabled");

// -------- Reveal au scroll (A11y friendly) --------
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (prefersReducedMotion) {
  document
    .querySelectorAll(".reveal")
    .forEach((el) => el.classList.add("show"));
} else {
  const io = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        requestAnimationFrame(() => {
          entry.target.classList.add("show");
          observer.unobserve(entry.target);
        });
      });
    },
    {
      root: null,
      threshold: 0.12,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    const delay = el.getAttribute("data-reveal-delay");
    if (delay) el.style.transitionDelay = `${parseInt(delay, 10)}ms`;
    io.observe(el);
  });

  // Retour via bfcache
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      document
        .querySelectorAll(".reveal")
        .forEach((el) => el.classList.add("show"));
    }
  });
}
