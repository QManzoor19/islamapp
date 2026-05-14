(function() {
  const THEME_STORAGE = "islamapp-theme";
  const SIZE_STORAGE = "islamapp-text-size";
  const NOTES_STORAGE = "islamapp-notes-v1";
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
    { href: "notes.html",             title: "My Notes",                  tags: "notes my notes bookmarks reflections" },
  ];

  // Pages where notes button should not auto-inject (avoid recursion)
  const NO_NOTES_PAGES = new Set(["notes.html"]);

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
    const items = !q ? PAGES.slice() : PAGES.filter(p => (p.title + " " + p.tags).toLowerCase().includes(q));
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

  // ─── Notes (per-page quick capture, central viewer at notes.html) ───
  const pageKey = () => {
    let path = window.location.pathname.split("/").pop() || "index.html";
    if (!path.endsWith(".html") && !path.includes(".")) path = path + ".html";
    return path;
  };
  function loadNotes() { try { return JSON.parse(localStorage.getItem(NOTES_STORAGE) || "{}"); } catch { return {}; } }
  function saveNotes(d) { try { localStorage.setItem(NOTES_STORAGE, JSON.stringify(d)); } catch {} }

  function pageEntry() {
    const all = loadNotes();
    const key = pageKey();
    if (!all[key]) all[key] = { title: document.title.replace(/ — IslamApp.*$/, "").trim() || key, href: key, notes: [] };
    else {
      // Refresh title each visit (in case page renamed)
      const t = document.title.replace(/ — IslamApp.*$/, "").trim();
      if (t) all[key].title = t;
      all[key].href = key;
    }
    return { all, entry: all[key], key };
  }

  function openNotes() {
    const modal = document.getElementById("notes-modal");
    if (!modal) return;
    modal.classList.add("open");
    renderNotesList();
    setTimeout(() => { const i = document.getElementById("notes-input"); if (i) i.focus(); }, 50);
  }
  function closeNotes() { document.getElementById("notes-modal").classList.remove("open"); }

  function renderNotesList() {
    const { entry } = pageEntry();
    const list = document.getElementById("notes-list");
    if (!list) return;
    if (!entry.notes || entry.notes.length === 0) {
      list.innerHTML = `<div class="notes-empty">No notes on this page yet. Start one below.</div>`;
      return;
    }
    list.innerHTML = entry.notes.slice().reverse().map(n => {
      const d = new Date(n.ts || Date.now());
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + " · " + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      const safeText = n.text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
      return `<div class="notes-item" data-id="${n.id}">
        <div class="notes-item-meta">${dateStr}</div>
        <div class="notes-item-text">${safeText}</div>
        <button class="notes-item-del" data-del="${n.id}" title="Delete">✕</button>
      </div>`;
    }).join("");
    list.querySelectorAll("[data-del]").forEach(b => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-del");
        const { all, entry, key } = pageEntry();
        entry.notes = entry.notes.filter(n => n.id !== id);
        if (entry.notes.length === 0) delete all[key];
        saveNotes(all);
        renderNotesList();
        updateNotesBadge();
      });
    });
  }

  function handleNoteSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("notes-input");
    const text = input.value.trim();
    if (!text) return;
    const { all, entry } = pageEntry();
    entry.notes.push({
      id: "n_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 6),
      text,
      ts: Date.now(),
    });
    saveNotes(all);
    input.value = "";
    renderNotesList();
    updateNotesBadge();
  }

  function updateNotesBadge() {
    const { entry } = pageEntry();
    const badge = document.getElementById("notes-badge");
    if (!badge) return;
    const n = (entry.notes || []).length;
    if (n === 0) { badge.style.display = "none"; badge.textContent = ""; }
    else { badge.style.display = "flex"; badge.textContent = String(n); }
  }

  // ─── Inject everything ───
  function inject() {
    // Theme toggle (top-right corner)
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

    // Search button (top, to the left of theme toggle)
    if (!document.getElementById("search-toggle")) {
      const btn = document.createElement("button");
      btn.id = "search-toggle";
      btn.className = "search-toggle";
      btn.title = "Search pages  ·  press /";
      btn.setAttribute("aria-label", "Search pages");
      btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
      btn.addEventListener("click", openSearch);
      document.body.appendChild(btn);
    }

    // Text-size control (top, further left)
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

    // AI FAB
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

    // AI modal
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
              <div style="font-family:'Amiri',serif;direction:rtl;" class="text-sm">المُسَاعِد</div>
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

    // Notes FAB + modal — skip on the notes.html page itself
    const onNotesPage = NO_NOTES_PAGES.has(pageKey());
    if (!onNotesPage) {
      if (!document.getElementById("notes-fab")) {
        const fab = document.createElement("button");
        fab.id = "notes-fab";
        fab.className = "notes-fab";
        fab.title = "Notes for this page";
        fab.setAttribute("aria-label", "Open notes for this page");
        fab.innerHTML = `📝<span class="notes-badge" id="notes-badge"></span>`;
        fab.addEventListener("click", openNotes);
        document.body.appendChild(fab);
      }

      if (!document.getElementById("notes-modal")) {
        const { entry } = pageEntry();
        const modal = document.createElement("div");
        modal.id = "notes-modal";
        modal.className = "notes-modal";
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.innerHTML = `
          <div class="notes-panel">
            <div class="notes-header">
              <div>
                <div style="font-family:'Amiri',serif;direction:rtl;" class="text-sm">المُلَاحَظَات</div>
                <div style="font-family:'Cormorant Garamond',serif;" class="text-lg font-semibold">Notes · ${entry.title.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</div>
              </div>
              <button class="notes-close" id="notes-close" aria-label="Close">✕</button>
            </div>
            <div class="notes-list-wrap">
              <div class="notes-list" id="notes-list"></div>
            </div>
            <form class="notes-input-row" id="notes-form">
              <textarea class="notes-input" id="notes-input" placeholder="Type a note for this page…" rows="2"></textarea>
              <div class="notes-input-footer">
                <a class="notes-all-link" href="notes.html">View all notes →</a>
                <button class="notes-save" type="submit">Save note</button>
              </div>
            </form>
          </div>
        `;
        document.body.appendChild(modal);
        document.getElementById("notes-close").addEventListener("click", closeNotes);
        document.getElementById("notes-form").addEventListener("submit", handleNoteSubmit);
        modal.addEventListener("click", e => { if (e.target === modal) closeNotes(); });
        const ta = document.getElementById("notes-input");
        ta.addEventListener("keydown", e => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            document.getElementById("notes-form").dispatchEvent(new Event("submit", { cancelable: true }));
          }
        });
        updateNotesBadge();
      } else {
        updateNotesBadge();
      }
    }

    // Global Escape closes whichever modal is open
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        const aim = document.getElementById("ai-modal");
        const sm = document.getElementById("search-modal");
        const nm = document.getElementById("notes-modal");
        if (aim && aim.classList.contains("open")) closeAI();
        if (sm && sm.classList.contains("open")) closeSearch();
        if (nm && nm.classList.contains("open")) closeNotes();
      }
    });

    // "/" opens search globally
    document.addEventListener("keydown", e => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  // Apply saved text size early
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
