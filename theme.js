(function() {
  const THEME_STORAGE = "islamapp-theme";
  const SIZE_STORAGE = "islamapp-text-size";
  const SIZES = ["small", "normal", "large", "xlarge"];
  const SIZE_LABELS = { small: "A−", normal: "A", large: "A+", xlarge: "A++" };

  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
  const currentSize = () => document.documentElement.getAttribute("data-text-size") || "normal";

  function updateIcon() {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = isDark() ? "☀" : "🌙";
  }

  function updateThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDark() ? "#0a1510" : "#064e3b");
  }

  function setTheme(dark) {
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem(THEME_STORAGE, dark ? "dark" : "light"); } catch (e) {}
    updateIcon();
    updateThemeColor();
  }

  function applySize(size) {
    if (!SIZES.includes(size)) size = "normal";
    if (size === "normal") document.documentElement.removeAttribute("data-text-size");
    else document.documentElement.setAttribute("data-text-size", size);
    try { localStorage.setItem(SIZE_STORAGE, size); } catch (e) {}
    const label = document.getElementById("text-size-label");
    if (label) label.textContent = SIZE_LABELS[size];
  }

  function bumpSize(delta) {
    const idx = SIZES.indexOf(currentSize());
    const next = Math.max(0, Math.min(SIZES.length - 1, idx + delta));
    applySize(SIZES[next]);
  }

  function inject() {
    if (!document.getElementById("theme-toggle")) {
      const btn = document.createElement("button");
      btn.id = "theme-toggle";
      btn.className = "theme-toggle";
      btn.title = "Toggle dark mode";
      btn.setAttribute("aria-label", "Toggle dark mode");
      btn.addEventListener("click", () => setTheme(!isDark()));
      document.body.appendChild(btn);
      updateIcon();
      updateThemeColor();
    }

    if (!document.getElementById("text-size-control")) {
      const wrap = document.createElement("div");
      wrap.id = "text-size-control";
      wrap.className = "text-size-control";
      wrap.innerHTML = `
        <button class="ts-btn" data-ts="minus" aria-label="Smaller text" title="Smaller text">A−</button>
        <span id="text-size-label" class="ts-label">A</span>
        <button class="ts-btn" data-ts="plus" aria-label="Larger text" title="Larger text">A+</button>
      `;
      wrap.querySelector('[data-ts="minus"]').addEventListener("click", () => bumpSize(-1));
      wrap.querySelector('[data-ts="plus"]').addEventListener("click", () => bumpSize(1));
      document.body.appendChild(wrap);
      // Apply saved size and update label
      let saved = "normal";
      try { saved = localStorage.getItem(SIZE_STORAGE) || "normal"; } catch (e) {}
      applySize(saved);
    }
  }

  // Apply saved text size as early as possible to prevent flash
  try {
    const savedSize = localStorage.getItem(SIZE_STORAGE);
    if (savedSize && SIZES.includes(savedSize) && savedSize !== "normal") {
      document.documentElement.setAttribute("data-text-size", savedSize);
    }
  } catch (e) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
