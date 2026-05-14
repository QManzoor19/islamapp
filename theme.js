(function() {
  const THEME_STORAGE = "islamapp-theme";
  const SIZE_STORAGE = "islamapp-text-size";
  const SIZES = ["small", "normal", "large", "xlarge"];
  const SIZE_LABELS = { small: "A−", normal: "A", large: "A+", xlarge: "A++" };

  const isDark = () => document.documentElement.getAttribute("data-theme") === "dark";
  const currentSize = () => document.documentElement.getAttribute("data-text-size") || "normal";

  // ─── Pages list (used by the global search) ───
  const PAGES = [
    { href: "index.html",            title: "Curriculum (Home)",         tags: "home curriculum levels foundations" },
    { href: "iman.html",              title: "Īmān — Articles of Faith",  tags: "faith belief iman articles" },
    { href: "pillars.html",           title: "The Five Pillars",          tags: "pillars shahada salah zakat sawm hajj" },
    { href: "depth.html",             title: "Depth — Going Deeper",      tags: "depth advanced" },
    { href: "wudu.html",              title: "Wuḍūʾ — Ablution",          tags: "wudu wudoo ablution purification" },
    { href: "ghusl.html",             title: "Ghusl — Full Purification", tags: "ghusl bath janaba purification" },
    { href: "times.html",             title: "Prayer Times",              tags: "salah times fajr dhuhr asr maghrib isha" },
    { href: "jumuah.html",            title: "Jumuʿa — Friday Prayer",    tags: "jumuah friday prayer khutbah" },
    { href: "alphabet.html",          title: "Arabic Alphabet",           tags: "arabic alphabet letters huroof" },
    { href: "connecting.html",        title: "Connecting Letters",        tags: "arabic letters joining" },
    { href: "vowels.html",            title: "Vowels & Diacritics",       tags: "arabic harakat vowels fatha kasra damma" },
    { href: "reading.html",           title: "Reading Practice",          tags: "arabic reading practice" },
    { href: "vocab.html",             title: "Vocabulary",                tags: "vocab terms glossary" },
    { href: "keywords.html",          title: "Keywords",                  tags: "keywords terms" },
    { href: "calendar.html",          title: "Islamic Calendar",          tags: "calendar hijri months ramadan" },
    { href: "fatiha.html",            title: "Sūrat al-Fātiḥa",           tags: "fatiha quran surah opening" },
    { href: "juz-amma.html",          title: "Juzʾ ʿAmma",                tags: "juz amma quran short surahs" },
    { href: "kursi.html",             title: "Āyat al-Kursī",             tags: "ayat kursi throne verse 2:255" },
    { href: "duas.html",              title: "Duʿās",                     tags: "dua duas supplication" },
    { href: "revelation.html",        title: "Revelation",                tags: "revelation wahy quran" },
    { href: "stories.html",           title: "Stories",                   tags: "stories prophets narratives" },
    { href: "story-adam.html",        title: "Story — Adam ﷺ",            tags: "adam prophet story" },
    { href: "story-adam-deep.html",   title: "Adam ﷺ Deep Dive",          tags: "adam deep" },
    { href: "story-muhammad.html",    title: "Story — Muḥammad ﷺ",        tags: "muhammad prophet sira biography" },
    { href: "story-muhammad-deep.html", title: "Muḥammad ﷺ Deep Dive",    tags: "muhammad deep biography sira" },
    { href: "hadiths.html",           title: "Hadith Collections",        tags: "hadith bukhari muslim collections" },
    { href: "nawawi40.html",          title: "40 Hadith of Nawawī",       tags: "nawawi 40 hadith arbaeen" },
    { href: "ethics.html",            title: "Ethics — Akhlāq",           tags: "ethics akhlaq character morals" },
    { href: "laws.html",              title: "Laws (Topical)",            tags: "laws fiqh topics" },
    { href: "ahkam.html",             title: "Aḥkām — Quranic Rulings",   tags: "ahkam quranic rulings laws verses fiqh" },
    { href: "afterlife.html",         title: "The Afterlife",             tags: "afterlife paradise hell qiyamah" },
    { href: "resources.html",         title: "Resources",                 tags: "resources books websites apps courses" },
  ];

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

  // ─── AI modal ───
  function openAI() {
    document.getElementById("ai-modal").classList.add("open");
    setTimeout(() => { const i = document.getElementById("ai-input"); if (i) i.focus(); }, 50);
  }
  function closeAI() { document.getElementById("ai-modal").classList.remove("open"); }

  function handleAiSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("ai-input");
    const messages = document.getElementById("ai-messages");
    const text = input.value.trim();
    if (!text) return;
    const u = document.createElement("div");
    u.className = "ai-msg user";
    u.textContent = text;
    messages.appendChild(u);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;
    setTimeout(() => {
      const b = document.createElement("div");
      b.className = "ai-msg bot";
      b.innerHTML = `<div class="bot-label">Assistant</div>I have not been connected to a live model yet. When you wire this up to an LLM endpoint, your question — <em>"${text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}"</em> — will get a real answer here.`;
      messages.appendChild(b);
      messages.scrollTop = messages.scrollHeight;
    }, 400);
  }

  // ─── Search modal ───
  function openSearch() {
    document.getElementById("search-modal").classList.add("open");
    setTimeout(() => { const i = document.getElementById("search-input"); if (i) { i.focus(); i.select(); } }, 50);
  }
  function closeSearch() { document.getElementById("search-modal").classList.remove("open"); }

  function renderSearchResults(query) {
    const list = document.getElementById("search-results");
    const q = query.trim().toLowerCase();
    const items = !q
      ? PAGES.slice()
      : PAGES.filter(p => (p.title + " " + p.tags).toLowerCase().includes(q));
    if (items.length === 0) {
      list.innerHTML = `<div class="search-empty">No matches for "${query.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}"</div>`;
      return;
    }
    list.innerHTML = items.map(p => {
      const here = window.location.pathname.endsWith("/" + p.href) || window.location.pathname.endsWith(p.href);
      return `<a class="search-item${here ? ' here' : ''}" href="${p.href}">
        <span class="search-title">${p.title}</span>
        <span class="search-tags">${here ? 'currently here' : p.href}</span>
      </a>`;
    }).join("");
  }

  // ─── Inject everything ───
  function inject() {
    // Theme toggle
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

    // Text-size control
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
      let saved = "normal";
      try { saved = localStorage.getItem(SIZE_STORAGE) || "normal"; } catch (e) {}
      applySize(saved);
    }

    // AI FAB — only inject if page hasn't already defined one (legacy support)
    if (!document.getElementById("ai-fab")) {
      const fab = document.createElement("button");
      fab.id = "ai-fab";
      fab.className = "ai-fab";
      fab.title = "Ask the AI";
      fab.setAttribute("aria-label", "Ask the AI");
      fab.textContent = "✨";
      fab.addEventListener("click", openAI);
      document.body.appendChild(fab);
    } else {
      document.getElementById("ai-fab").addEventListener("click", openAI);
    }

    // AI modal — inject if not already present
    if (!document.getElementById("ai-modal")) {
      const modal = document.createElement("div");
      modal.id = "ai-modal";
      modal.className = "ai-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `
        <div class="ai-panel">
          <div class="ai-header">
            <div>
              <div style="font-family:'Amiri',serif;direction:rtl;" class="text-sm" >المُسَاعِد</div>
              <div style="font-family:'Cormorant Garamond',serif;" class="text-lg font-semibold">Ask the AI</div>
            </div>
            <button class="ai-close" id="ai-close" aria-label="Close">✕</button>
          </div>
          <div class="ai-messages" id="ai-messages">
            <div class="ai-msg bot">
              <div class="bot-label">Assistant</div>
              Assalāmu ʿalaykum. Ask me anything about what you are studying — a verse, a hadith, a ruling, a historical event, or any term you have come across.
              <div class="ai-stub-note">Note: this is a UI stub. Wire it to an LLM API to get real answers.</div>
            </div>
          </div>
          <form class="ai-input-row" id="ai-form">
            <input class="ai-input" id="ai-input" type="text" placeholder="Type your question…" autocomplete="off" />
            <button class="ai-send" type="submit">Send</button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById("ai-close").addEventListener("click", closeAI);
      document.getElementById("ai-form").addEventListener("submit", handleAiSubmit);
      modal.addEventListener("click", e => { if (e.target === modal) closeAI(); });
    }

    // Search FAB (above AI FAB)
    if (!document.getElementById("search-fab")) {
      const fab = document.createElement("button");
      fab.id = "search-fab";
      fab.className = "search-fab";
      fab.title = "Search pages";
      fab.setAttribute("aria-label", "Search pages");
      fab.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
      fab.addEventListener("click", openSearch);
      document.body.appendChild(fab);
    }

    // Search modal
    if (!document.getElementById("search-modal")) {
      const modal = document.createElement("div");
      modal.id = "search-modal";
      modal.className = "search-modal";
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      modal.innerHTML = `
        <div class="search-panel">
          <div class="search-header">
            <input type="text" id="search-input" class="search-input" placeholder="Search pages — title, topic, keyword…" autocomplete="off" />
            <button class="search-close" id="search-close" aria-label="Close">✕</button>
          </div>
          <div class="search-results" id="search-results"></div>
        </div>
      `;
      document.body.appendChild(modal);
      const input = document.getElementById("search-input");
      input.addEventListener("input", e => renderSearchResults(e.target.value));
      input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
          const first = modal.querySelector(".search-item");
          if (first) window.location.href = first.getAttribute("href");
        }
      });
      document.getElementById("search-close").addEventListener("click", closeSearch);
      modal.addEventListener("click", e => { if (e.target === modal) closeSearch(); });
      renderSearchResults("");
    }

    // Global Escape: close whichever modal is open
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        const aim = document.getElementById("ai-modal");
        const sm = document.getElementById("search-modal");
        if (aim && aim.classList.contains("open")) closeAI();
        if (sm && sm.classList.contains("open")) closeSearch();
      }
    });

    // Keyboard shortcut: "/" to open search
    document.addEventListener("keydown", e => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault();
        openSearch();
      }
    });
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
