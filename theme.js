(function() {
  const STORAGE = "islamapp-theme";
  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

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
    try { localStorage.setItem(STORAGE, dark ? "dark" : "light"); } catch (e) {}
    updateIcon();
    updateThemeColor();
  }

  function inject() {
    if (document.getElementById("theme-toggle")) return;
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
