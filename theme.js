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

  // ─── Page context capture ───
  // Extract structured content from the current page so the AI can see what the user is reading.
  function getPageContext() {
    const cleanText = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
    const docTitle = (document.title || "").replace(/ — IslamApp.*$/, "").trim();
    const path = window.location.pathname.split("/").pop() || "index.html";

    // Main heading (first h1, falling back to title)
    const h1 = document.querySelector("main h1, article h1, h1");
    const heading = cleanText(h1) || docTitle;

    // All section headings (h2/h3) — gives the AI an outline of the page
    const sectionHeads = Array.from(document.querySelectorAll("main h2, main h3, article h2, article h3, section h2, section h3"))
      .map(cleanText).filter(Boolean).slice(0, 30);

    // Body text — prefer <main> / <article> if present, else the whole body
    const root = document.querySelector("main") || document.querySelector("article") || document.body;
    // Build a cleaned text snapshot, stripping nav/footer/script content
    const clone = root.cloneNode(true);
    clone.querySelectorAll("nav, footer, script, style, .ai-modal, .search-modal, .notes-modal, .ai-fab, .notes-fab, .search-toggle, .search-fab, .theme-toggle, .text-size-control").forEach(n => n.remove());
    let bodyText = clone.textContent.replace(/\s+/g, " ").trim();
    const MAX_BODY = 6000;
    if (bodyText.length > MAX_BODY) bodyText = bodyText.slice(0, MAX_BODY) + " …[truncated]";

    // Quranic verses on the page (Arabic + English) when present
    const verses = [];
    document.querySelectorAll(".verse, .verse-quote, .hadith").forEach(v => {
      const ref = cleanText(v.querySelector(".ref, .verse-ref"));
      const ar = cleanText(v.querySelector(".ar"));
      const en = cleanText(v.querySelector(".en"));
      if (ref || ar || en) verses.push({ ref, ar, en });
    });
    document.querySelectorAll(".verse-ref-tag").forEach(tag => {
      verses.push({ ref: cleanText(tag), ar: "", en: "" });
    });

    return {
      page: path,
      title: heading,
      sections: sectionHeads,
      verses,
      body: bodyText,
    };
  }

  // ─── AI modal ───
  function openAI() {
    document.getElementById("ai-modal").classList.add("open");
    refreshAiContext();
    setTimeout(() => { const i = document.getElementById("ai-input"); if (i) i.focus(); }, 50);
  }
  function closeAI() { document.getElementById("ai-modal").classList.remove("open"); }

  // Update the "context" banner showing what page the AI can see
  function refreshAiContext() {
    const ctx = getPageContext();
    const titleEl = document.getElementById("ai-ctx-title");
    if (titleEl) titleEl.textContent = ctx.title;
    const previewEl = document.getElementById("ai-ctx-preview");
    if (previewEl) {
      const verseCount = ctx.verses.length;
      const sectionCount = ctx.sections.length;
      const bits = [];
      if (sectionCount) bits.push(`${sectionCount} section${sectionCount === 1 ? '' : 's'}`);
      if (verseCount) bits.push(`${verseCount} verse${verseCount === 1 ? '' : 's'}`);
      bits.push(`${Math.ceil(ctx.body.length / 1000)}k chars`);
      previewEl.textContent = bits.join(" · ");
    }
    // Store context for the submit handler
    window.__currentAiContext = ctx;
  }

  function toggleAiContext() {
    const detail = document.getElementById("ai-ctx-detail");
    const btn = document.getElementById("ai-ctx-toggle");
    if (!detail) return;
    const open = detail.classList.toggle("open");
    if (btn) btn.textContent = open ? "Hide context" : "What can it see?";
    if (open) {
      const ctx = window.__currentAiContext || getPageContext();
      const sectionList = ctx.sections.length
        ? `<ul class="ai-ctx-list">${ctx.sections.slice(0, 12).map(s => `<li>${s.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</li>`).join("")}${ctx.sections.length > 12 ? `<li class="more">+ ${ctx.sections.length - 12} more</li>` : ""}</ul>`
        : `<div class="ai-ctx-empty">No section headings detected.</div>`;
      const verseList = ctx.verses.length
        ? `<div class="ai-ctx-versecount">${ctx.verses.length} Quran/hadith reference${ctx.verses.length === 1 ? '' : 's'} on this page</div>`
        : "";
      detail.innerHTML = `
        <div class="ai-ctx-section">
          <div class="ai-ctx-label">Page · ${ctx.page}</div>
          ${sectionList}
          ${verseList}
          <div class="ai-ctx-bodynote">Body text (${Math.ceil(ctx.body.length / 1000)}k chars) is sent with your question so the assistant can quote and reference what you are reading.</div>
        </div>
      `;
    }
  }

  // ─── AI config (provider + API key + model) ───
  const AI_CONFIG_KEY = "islamapp-ai-config";
  const PROVIDER_DEFAULTS = {
    openai:    { label: "OpenAI",    model: "gpt-4o-mini",                 endpoint: "https://api.openai.com/v1/chat/completions" },
    anthropic: { label: "Anthropic", model: "claude-haiku-4-5-20251001",   endpoint: "https://api.anthropic.com/v1/messages" },
    gemini:    { label: "Gemini",    model: "gemini-2.0-flash",            endpoint: "https://generativelanguage.googleapis.com/v1beta/models" },
  };
  function loadAiConfig() {
    try { return JSON.parse(localStorage.getItem(AI_CONFIG_KEY) || "{}"); } catch { return {}; }
  }
  function saveAiConfig(c) { try { localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(c)); } catch {} }
  function isAiConnected() {
    const c = loadAiConfig();
    return !!(c.provider && c.apiKey && c.model);
  }

  function refreshAiStatus() {
    const badge = document.getElementById("ai-status");
    if (!badge) return;
    if (isAiConnected()) {
      const c = loadAiConfig();
      badge.textContent = `Live · ${(PROVIDER_DEFAULTS[c.provider]?.label || c.provider)} · ${c.model}`;
      badge.className = "ai-status live";
    } else {
      badge.textContent = "Stub mode — click ⚙ to activate";
      badge.className = "ai-status stub";
    }
  }

  function openAiSettings() {
    const panel = document.getElementById("ai-settings");
    if (!panel) return;
    panel.classList.add("open");
    const c = loadAiConfig();
    document.getElementById("ai-cfg-provider").value = c.provider || "anthropic";
    document.getElementById("ai-cfg-key").value     = c.apiKey  || "";
    document.getElementById("ai-cfg-model").value   = c.model   || PROVIDER_DEFAULTS[c.provider || "anthropic"].model;
    refreshModelHint();
  }
  function closeAiSettings() { document.getElementById("ai-settings").classList.remove("open"); }
  function refreshModelHint() {
    const prov = document.getElementById("ai-cfg-provider").value;
    const def = PROVIDER_DEFAULTS[prov];
    const hint = document.getElementById("ai-cfg-model-hint");
    if (hint && def) hint.textContent = `Default: ${def.model}`;
  }

  // Real-API call dispatchers — one per provider, returning a {text} promise.
  async function callOpenAI(cfg, payload) {
    const res = await fetch(PROVIDER_DEFAULTS.openai.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cfg.apiKey },
      body: JSON.stringify({
        model: cfg.model,
        messages: [
          { role: "system", content: payload.system },
          { role: "user",   content: payload.user },
        ],
        temperature: 0.4,
      }),
    });
    if (!res.ok) throw new Error("OpenAI " + res.status + ": " + (await res.text()).slice(0, 200));
    const j = await res.json();
    return j.choices?.[0]?.message?.content?.trim() || "(no content returned)";
  }
  async function callAnthropic(cfg, payload) {
    const res = await fetch(PROVIDER_DEFAULTS.anthropic.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: cfg.model,
        max_tokens: 1024,
        system: payload.system,
        messages: [{ role: "user", content: payload.user }],
      }),
    });
    if (!res.ok) throw new Error("Anthropic " + res.status + ": " + (await res.text()).slice(0, 200));
    const j = await res.json();
    return j.content?.map(c => c.text || "").join("").trim() || "(no content returned)";
  }
  async function callGemini(cfg, payload) {
    const url = `${PROVIDER_DEFAULTS.gemini.endpoint}/${encodeURIComponent(cfg.model)}:generateContent?key=${encodeURIComponent(cfg.apiKey)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: payload.system }] },
        contents: [{ role: "user", parts: [{ text: payload.user }] }],
      }),
    });
    if (!res.ok) throw new Error("Gemini " + res.status + ": " + (await res.text()).slice(0, 200));
    const j = await res.json();
    return j.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim() || "(no content returned)";
  }
  async function callLLM(cfg, payload) {
    if (cfg.provider === "openai")    return callOpenAI(cfg, payload);
    if (cfg.provider === "anthropic") return callAnthropic(cfg, payload);
    if (cfg.provider === "gemini")    return callGemini(cfg, payload);
    throw new Error("Unknown provider: " + cfg.provider);
  }

  function handleAiSubmit(e) {
    e.preventDefault();
    const input = document.getElementById("ai-input");
    const messages = document.getElementById("ai-messages");
    const text = input.value.trim();
    if (!text) return;
    const ctx = window.__currentAiContext || getPageContext();
    const u = document.createElement("div");
    u.className = "ai-msg user";
    u.textContent = text;
    messages.appendChild(u);
    input.value = "";
    messages.scrollTop = messages.scrollHeight;

    const payload = buildLlmPayload(ctx, text);
    const cfg = loadAiConfig();
    const escq = text.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
    const escTitle = ctx.title.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

    if (!isAiConnected()) {
      // Stub mode — show what would be sent
      setTimeout(() => {
        const b = document.createElement("div");
        b.className = "ai-msg bot";
        b.innerHTML = `
          <div class="bot-label">Assistant · stub mode</div>
          I can see you're reading <strong>${escTitle}</strong>.
          ${ctx.verses.length ? `I have <strong>${ctx.verses.length}</strong> verse/hadith reference${ctx.verses.length === 1 ? '' : 's'} on this page as context. ` : ""}
          Click the <strong>⚙</strong> in the header to enter an API key and activate live answers. Your question <em>“${escq}”</em> will then be answered against this page's content.
          <details class="ai-payload-details"><summary>What would be sent</summary><pre>${JSON.stringify({ system: payload.system.slice(0, 380) + " …", user: payload.user }, null, 2).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre></details>
        `;
        messages.appendChild(b);
        messages.scrollTop = messages.scrollHeight;
      }, 250);
      return;
    }

    // Live mode — call the configured provider
    const thinking = document.createElement("div");
    thinking.className = "ai-msg bot ai-thinking";
    thinking.innerHTML = `<div class="bot-label">Assistant · ${PROVIDER_DEFAULTS[cfg.provider]?.label || cfg.provider}</div><div class="ai-typing"><span></span><span></span><span></span></div>`;
    messages.appendChild(thinking);
    messages.scrollTop = messages.scrollHeight;

    callLLM(cfg, payload).then(reply => {
      thinking.classList.remove("ai-thinking");
      const escReply = reply.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
      // Light markdown: paragraphs on double newlines, **bold**, *italic*
      const formatted = escReply
        .split(/\n{2,}/).map(par =>
          `<p>${par.replace(/\n/g, "<br>")
                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>")}</p>`
        ).join("");
      thinking.innerHTML = `<div class="bot-label">Assistant · ${PROVIDER_DEFAULTS[cfg.provider]?.label || cfg.provider} · context-aware</div>${formatted}`;
      messages.scrollTop = messages.scrollHeight;
    }).catch(err => {
      thinking.classList.remove("ai-thinking");
      thinking.innerHTML = `<div class="bot-label">Assistant · error</div><div style="color:#b91c1c">The API call failed.</div><pre style="white-space:pre-wrap;font-size:0.75rem;color:#78716c;margin-top:0.5rem">${(err.message || String(err)).replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</pre><div class="ai-err-hint">Check your API key, model name, and provider in ⚙ settings. Some providers also require CORS-permitted browser calls.</div>`;
      messages.scrollTop = messages.scrollHeight;
    });
  }

  // Build the system + user message payload for an LLM call. Exposed so
  // a real fetch() integration can call this directly.
  function buildLlmPayload(ctx, question) {
    const versesBlock = ctx.verses.slice(0, 12).map(v => {
      const parts = [];
      if (v.ref) parts.push(v.ref);
      if (v.ar) parts.push(v.ar);
      if (v.en) parts.push(`"${v.en}"`);
      return parts.join(" — ");
    }).filter(Boolean).join("\n");
    const system = [
      "You are an Islamic-studies assistant embedded inside a learning app.",
      "The user is reading the page below — answer their question using this content first, before adding outside knowledge.",
      "When you quote, name the source (page heading, surah:verse, or hadith collection).",
      "Stick to mainstream Sunni scholarship; note when the four schools differ.",
      "",
      `--- PAGE TITLE: ${ctx.title} ---`,
      `--- PAGE URL: ${ctx.page} ---`,
      ctx.sections.length ? `--- SECTIONS ON THIS PAGE ---\n${ctx.sections.join("\n")}` : "",
      versesBlock ? `--- VERSES / HADITH ON THIS PAGE ---\n${versesBlock}` : "",
      `--- PAGE BODY ---\n${ctx.body}`,
    ].filter(Boolean).join("\n\n");
    return { system, user: question };
  }
  // Expose for live integration
  window.IslamAppAI = { getPageContext, buildLlmPayload };

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
            <div class="ai-header-actions">
              <button class="ai-settings-btn" id="ai-settings-btn" title="Connect an API key" aria-label="AI settings">⚙</button>
              <button class="ai-close" id="ai-close" aria-label="Close">✕</button>
            </div>
          </div>
          <div class="ai-ctx-banner">
            <div class="ai-ctx-row">
              <span class="ai-ctx-label-inline">📄 On this page:</span>
              <span class="ai-ctx-title-text" id="ai-ctx-title">…</span>
              <button class="ai-ctx-toggle" id="ai-ctx-toggle" type="button">What can it see?</button>
            </div>
            <div class="ai-ctx-meta" id="ai-ctx-preview"></div>
            <div class="ai-ctx-detail" id="ai-ctx-detail"></div>
            <div class="ai-status stub" id="ai-status">Stub mode — click ⚙ to activate</div>
          </div>
          <div class="ai-messages" id="ai-messages">
            <div class="ai-msg bot">
              <div class="bot-label">Assistant</div>
              Assalāmu ʿalaykum. I can see the page you are reading. Ask me anything about it — a verse, a hadith, a ruling, a term you have come across. Click <strong>⚙</strong> above to plug in an API key and switch from stub to live answers.
            </div>
          </div>
          <div class="ai-settings" id="ai-settings">
            <div class="ai-settings-head">
              <div style="font-family:'Cormorant Garamond',serif;font-weight:600;font-size:1.05rem;">Connect a language model</div>
              <button class="ai-settings-close" id="ai-settings-close" type="button" aria-label="Close settings">✕</button>
            </div>
            <p class="ai-settings-warn">⚠ Your API key is stored only in this browser's localStorage. Anyone with access to this device can read it. Use a key with usage limits.</p>
            <label class="ai-cfg-row">
              <span class="ai-cfg-label">Provider</span>
              <select id="ai-cfg-provider" class="ai-cfg-input">
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </label>
            <label class="ai-cfg-row">
              <span class="ai-cfg-label">Model</span>
              <input id="ai-cfg-model" class="ai-cfg-input" type="text" autocomplete="off" placeholder="model id" />
              <span class="ai-cfg-hint" id="ai-cfg-model-hint"></span>
            </label>
            <label class="ai-cfg-row">
              <span class="ai-cfg-label">API key</span>
              <input id="ai-cfg-key" class="ai-cfg-input" type="password" autocomplete="off" placeholder="sk-… or your key" />
              <span class="ai-cfg-hint">Used directly from your browser → the provider.</span>
            </label>
            <div class="ai-settings-actions">
              <button class="ai-cfg-clear" id="ai-cfg-clear" type="button">Disconnect</button>
              <button class="ai-cfg-save"  id="ai-cfg-save"  type="button">Save & connect</button>
            </div>
          </div>
          <form class="ai-input-row" id="ai-form">
            <input class="ai-input" id="ai-input" type="text" placeholder="Ask about what you are reading…" autocomplete="off" />
            <button class="ai-send" type="submit">Send</button>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById("ai-close").addEventListener("click", closeAI);
      document.getElementById("ai-form").addEventListener("submit", handleAiSubmit);
      modal.addEventListener("click", e => { if (e.target === modal) closeAI(); });
      document.getElementById("ai-ctx-toggle").addEventListener("click", toggleAiContext);
      document.getElementById("ai-settings-btn").addEventListener("click", openAiSettings);
      document.getElementById("ai-settings-close").addEventListener("click", closeAiSettings);
      document.getElementById("ai-cfg-provider").addEventListener("change", refreshModelHint);
      document.getElementById("ai-cfg-save").addEventListener("click", () => {
        const cfg = {
          provider: document.getElementById("ai-cfg-provider").value,
          model:    document.getElementById("ai-cfg-model").value.trim() || PROVIDER_DEFAULTS[document.getElementById("ai-cfg-provider").value].model,
          apiKey:   document.getElementById("ai-cfg-key").value.trim(),
        };
        if (!cfg.apiKey) { alert("Enter an API key to connect."); return; }
        saveAiConfig(cfg);
        closeAiSettings();
        refreshAiStatus();
      });
      document.getElementById("ai-cfg-clear").addEventListener("click", () => {
        if (!confirm("Disconnect the API key? You'll return to stub mode.")) return;
        saveAiConfig({});
        closeAiSettings();
        refreshAiStatus();
      });
      refreshAiStatus();
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
