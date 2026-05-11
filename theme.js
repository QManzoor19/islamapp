(function() {
  const STORAGE = "islamapp-theme";
  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";

  function updateIcon() {
    const btn = document.getElementById("theme-toggle");
    if (btn) btn.textContent = isDark() ? "☀" : "🌙";
  }

  function setTheme(dark) {
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    try { localStorage.setItem(STORAGE, dark ? "dark" : "light"); } catch (e) {}
    updateIcon();
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
