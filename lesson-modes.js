/* ─── lesson-modes.js ─────────────────────────────────────────────────
   Drop-in helper that adds four reading modes to any lesson page.

   The lesson page must define before the lesson body renders:
     window.LessonRunner = {
       steps: [...],                  // the existing steps array
       quizQuestions: [...],          // (optional) the quiz array
       moduleId: "1-1",               // (optional) progress key
       render: () => {...},           // the existing guided-mode render fn
       renderQuiz: () => {...},       // (optional) the existing quiz render fn
     };

   The runner looks for these structural elements on the page:
     - <main id="step-container">      (where lesson body is rendered)
     - <aside> (the side TOC)           (hidden in flow/brief/quiz modes)
     - #prev-step / #next-step         (hidden in non-guided modes)

   Mode is persisted in localStorage and surfaced in the URL hash.
   ──────────────────────────────────────────────────────────────────── */
(function () {
  const R = window.LessonRunner;
  if (!R || !Array.isArray(R.steps) || R.steps.length === 0) return;

  const MODE_KEY = "islamapp-lesson-mode-" + (R.moduleId || location.pathname);
  const MODES = ["guided", "flow", "brief", "quiz"];
  const HAS_QUIZ = Array.isArray(R.quizQuestions) && R.quizQuestions.length > 0;

  // ─── Inject CSS once ───
  if (!document.getElementById("lesson-modes-css")) {
    const style = document.createElement("style");
    style.id = "lesson-modes-css";
    style.textContent = `
      .lesson-modes {
        display: flex; gap: 6px;
        background: rgba(201,169,97,0.12);
        border: 1px solid rgba(201,169,97,0.35);
        border-radius: 999px;
        padding: 4px;
        margin: 0 auto 1.5rem;
        max-width: 560px;
        justify-content: space-between;
      }
      .lesson-mode-tab {
        flex: 1; padding: 7px 10px;
        border-radius: 999px; background: transparent; border: none; cursor: pointer;
        font-size: 0.74rem; letter-spacing: 0.05em; font-weight: 600;
        color: #78716c; transition: all 0.18s ease;
        font-family: inherit; white-space: nowrap;
      }
      .lesson-mode-tab .lm-icon { margin-right: 4px; }
      .lesson-mode-tab:hover { color: #064e3b; }
      .lesson-mode-tab.active { background: #064e3b; color: #faf6ed; box-shadow: 0 4px 10px -4px rgba(6,78,59,0.4); }
      .lesson-mode-tab[disabled] { opacity: 0.4; cursor: not-allowed; }
      [data-theme="dark"] .lesson-modes { background: rgba(201,169,97,0.10); border-color: rgba(201,169,97,0.35); }
      [data-theme="dark"] .lesson-mode-tab { color: #b8b2a3; }
      [data-theme="dark"] .lesson-mode-tab.active { background: #064e3b; color: #f3e8c2; }

      /* FLOW mode — all steps stacked */
      .lesson-flow .step-card {
        background: #fff;
        border: 1px solid rgba(201,169,97,0.4);
        border-radius: 14px;
        padding: 1.75rem 1.5rem;
        margin-bottom: 1.25rem;
        position: relative;
      }
      .lesson-flow .step-mark {
        display: flex; align-items: center; gap: 0.85rem;
        margin-bottom: 1rem; padding-bottom: 0.85rem;
        border-bottom: 1px solid rgba(201,169,97,0.25);
      }
      .lesson-flow .step-mark .icon { font-size: 2.25rem; line-height: 1; }
      .lesson-flow .step-mark .num { font-family: 'Cormorant Garamond', serif; font-size: 0.7rem; letter-spacing: 0.22em; text-transform: uppercase; color: #a8863f; font-weight: 700; }
      .lesson-flow .step-mark .title { font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; color: #064e3b; font-weight: 600; line-height: 1.15; }
      [data-theme="dark"] .lesson-flow .step-card { background: #142420; border-color: rgba(201,169,97,0.3); }
      [data-theme="dark"] .lesson-flow .step-mark .title { color: #f3e8c2; }
      [data-theme="dark"] .lesson-flow .step-mark .num { color: #d4a957; }

      /* BRIEF mode — compact list of step summaries */
      .lesson-brief .brief-card {
        display: grid; grid-template-columns: 56px 1fr; gap: 1rem;
        background: #fff;
        border: 1px solid rgba(201,169,97,0.3);
        border-left: 4px solid #c9a961;
        border-radius: 0 12px 12px 0;
        padding: 1rem 1.25rem;
        margin-bottom: 0.85rem;
      }
      .lesson-brief .brief-icon { font-size: 2rem; line-height: 1; text-align: center; }
      .lesson-brief .brief-title { font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 600; color: #064e3b; margin-bottom: 0.3rem; }
      .lesson-brief .brief-num { font-size: 0.62rem; letter-spacing: 0.22em; text-transform: uppercase; color: #a8863f; font-weight: 700; margin-bottom: 0.15rem; }
      .lesson-brief .brief-summary { font-family: 'EB Garamond', 'Cormorant Garamond', serif; font-size: 0.98rem; line-height: 1.55; color: #2a3530; }
      [data-theme="dark"] .lesson-brief .brief-card { background: #142420; border-color: rgba(201,169,97,0.3); border-left-color: #c9a961; }
      [data-theme="dark"] .lesson-brief .brief-title { color: #f3e8c2; }
      [data-theme="dark"] .lesson-brief .brief-num { color: #d4a957; }
      [data-theme="dark"] .lesson-brief .brief-summary { color: #d6d0c2; }
      .lesson-brief .brief-quiz-cta {
        text-align: center;
        margin-top: 1.5rem;
        padding: 1rem;
        background: rgba(201,169,97,0.10);
        border-radius: 12px;
      }
      .lesson-brief .brief-quiz-cta a {
        color: #064e3b; text-decoration: none; font-weight: 600;
        border: 1px solid #c9a961; padding: 0.5rem 1.2rem; border-radius: 999px;
        display: inline-block;
      }
      .lesson-brief .brief-quiz-cta a:hover { background: #064e3b; color: #faf6ed; }
      [data-theme="dark"] .lesson-brief .brief-quiz-cta { background: rgba(201,169,97,0.12); }
      [data-theme="dark"] .lesson-brief .brief-quiz-cta a { color: #f3e8c2; border-color: rgba(201,169,97,0.5); }

      /* QUIZ-only mode */
      .lesson-quiz-only h2 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 2rem; color: #064e3b; text-align: center;
        margin-bottom: 0.5rem;
      }
      .lesson-quiz-only .quiz-intro {
        text-align: center;
        font-family: 'EB Garamond', serif;
        font-style: italic;
        color: #78716c;
        margin-bottom: 1.5rem;
      }
      [data-theme="dark"] .lesson-quiz-only h2 { color: #f3e8c2; }
      [data-theme="dark"] .lesson-quiz-only .quiz-intro { color: #b8b2a3; }
    `;
    document.head.appendChild(style);
  }

  // ─── Find structural elements ───
  const container = document.getElementById("step-container");
  const aside = document.querySelector("aside");
  const prevBtn = document.getElementById("prev-step");
  const nextBtn = document.getElementById("next-step");
  if (!container) return;

  // ─── Build mode-tab strip ───
  const tabStrip = document.createElement("div");
  tabStrip.className = "lesson-modes";
  tabStrip.setAttribute("role", "tablist");
  tabStrip.innerHTML = `
    <button class="lesson-mode-tab" data-mode="guided"><span class="lm-icon">📖</span>Guided</button>
    <button class="lesson-mode-tab" data-mode="flow"><span class="lm-icon">📜</span>Flow</button>
    <button class="lesson-mode-tab" data-mode="brief"><span class="lm-icon">⚡</span>Brief</button>
    <button class="lesson-mode-tab" data-mode="quiz" ${HAS_QUIZ ? "" : "disabled title='No quiz on this lesson'"}><span class="lm-icon">🎯</span>Quiz</button>
  `;
  // Insert before the grid that holds <aside> + <main>
  const grid = container.parentElement;
  grid.parentElement.insertBefore(tabStrip, grid);

  // ─── Mode dispatch ───
  let currentMode = "guided";
  try {
    const saved = localStorage.getItem(MODE_KEY);
    if (MODES.includes(saved)) currentMode = saved;
  } catch {}
  const hash = location.hash.replace("#", "");
  if (MODES.includes(hash)) currentMode = hash;
  if (currentMode === "quiz" && !HAS_QUIZ) currentMode = "guided";

  function setMode(m) {
    if (!MODES.includes(m)) m = "guided";
    if (m === "quiz" && !HAS_QUIZ) m = "guided";
    currentMode = m;
    try { localStorage.setItem(MODE_KEY, m); } catch {}
    if (location.hash.replace("#", "") !== m) history.replaceState(null, "", "#" + m);
    tabStrip.querySelectorAll(".lesson-mode-tab").forEach(t =>
      t.classList.toggle("active", t.dataset.mode === m)
    );
    renderCurrentMode();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  tabStrip.querySelectorAll(".lesson-mode-tab").forEach(t => {
    if (t.disabled) return;
    t.addEventListener("click", () => setMode(t.dataset.mode));
  });

  function showWizardChrome(show) {
    if (aside) aside.style.display = show ? "" : "none";
    // Hide the prev/next button row (shared parent in the standard template)
    const navRow = prevBtn?.parentElement;
    if (navRow) navRow.style.display = show ? "" : "none";
  }

  function setGridLayout(single) {
    if (!grid) return;
    if (single) grid.style.gridTemplateColumns = "1fr";
    else grid.style.gridTemplateColumns = "";  // revert to CSS-defined value
  }

  // ─── Helpers to extract summary from a step body ───
  function summarize(html) {
    // Get the first <p>'s text content from the step body.
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    const firstP = tmp.querySelector("p");
    let text = firstP ? firstP.textContent.replace(/\s+/g, " ").trim() : "";
    if (!text) {
      // Fall back to any text
      text = tmp.textContent.replace(/\s+/g, " ").trim();
    }
    if (text.length > 260) text = text.slice(0, 250).replace(/\s+\S*$/, "") + " …";
    return text;
  }

  // ─── Renderers ───
  function renderGuided() {
    showWizardChrome(true);
    setGridLayout(false);
    if (typeof R.render === "function") R.render();
  }

  function renderFlow() {
    showWizardChrome(false);
    setGridLayout(true);
    container.innerHTML = `<div class="lesson-flow">${
      R.steps.map((s, i) => `
        <article class="step-card" id="lesson-step-${i+1}">
          <div class="step-mark">
            <span class="icon">${s.icon || "•"}</span>
            <div>
              <div class="num">Step ${i+1} of ${R.steps.length}</div>
              <div class="title">${s.title}</div>
            </div>
          </div>
          <div>${s.body}</div>
        </article>
      `).join("")
    }</div>`;
    // If a quiz step exists and is rendered here, wire it up
    if (HAS_QUIZ && document.getElementById("quiz") && typeof R.renderQuiz === "function") {
      R.renderQuiz();
    }
  }

  function renderBrief() {
    showWizardChrome(false);
    setGridLayout(true);
    const cards = R.steps
      .filter(s => !s.isQuiz)
      .map((s, idx) => {
        const i = R.steps.indexOf(s);
        return `
          <div class="brief-card">
            <div class="brief-icon">${s.icon || "•"}</div>
            <div>
              <div class="brief-num">Step ${i+1}</div>
              <div class="brief-title">${s.title}</div>
              <div class="brief-summary">${summarize(s.body)}</div>
            </div>
          </div>
        `;
      }).join("");
    const quizCta = HAS_QUIZ
      ? `<div class="brief-quiz-cta"><a href="#quiz" data-quiz-jump>Test yourself — ${R.quizQuestions.length} questions →</a></div>`
      : "";
    container.innerHTML = `<div class="lesson-brief">${cards}${quizCta}</div>`;
    const cta = container.querySelector("[data-quiz-jump]");
    if (cta) cta.addEventListener("click", e => { e.preventDefault(); setMode("quiz"); });
  }

  function renderQuizOnly() {
    showWizardChrome(false);
    setGridLayout(true);
    container.innerHTML = `
      <article class="lesson-quiz-only">
        <h2>Quick check</h2>
        <div class="quiz-intro">${R.quizQuestions.length} short questions. No pressure — just to see what stuck.</div>
        <div id="quiz"></div>
        <div id="quiz-result" class="hidden mt-6 p-6 rounded-xl text-center"></div>
      </article>
    `;
    if (typeof R.renderQuiz === "function") R.renderQuiz();
  }

  function renderCurrentMode() {
    if (currentMode === "guided") renderGuided();
    else if (currentMode === "flow") renderFlow();
    else if (currentMode === "brief") renderBrief();
    else if (currentMode === "quiz") renderQuizOnly();
  }

  // Mark active tab at startup and render
  tabStrip.querySelectorAll(".lesson-mode-tab").forEach(t =>
    t.classList.toggle("active", t.dataset.mode === currentMode)
  );
  // Initial render runs *after* the page's own render() so we override it
  // when needed. Use a microtask to slot in after the page's own load logic.
  Promise.resolve().then(renderCurrentMode);
})();
