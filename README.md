# IslamApp

A self-paced Islamic learning curriculum as a single static site. Three levels, nineteen tiers, ~120 modules covering everything from the five pillars to the classical Islamic sciences.

## Quick start

Open `index.html` in any modern browser. No build step, no dependencies installed locally — Tailwind and Google Fonts are loaded from CDN.

```
open index.html
```

That's it.

## Structure

```
index.html              The curriculum hub
theme.css / theme.js    Dark mode shared across pages
placeholder.html        Generic "coming soon" page for unbuilt modules

Library pages:
  stories.html          The 37 Quranic stories
  hadiths.html          Hadith collections, gradings, sample hadiths
  keywords.html         Searchable glossary (~60 terms)
  resources.html        Books, websites, apps, scholars

Built modules:
  pillars.html          1-1  The Shahada & Five Pillars
  iman.html             1-2  The Six Articles of Faith
  vocab.html            1-3  Core Vocabulary (flashcards + matching game)
  calendar.html         1-4  The Islamic Calendar
  wudu.html             2-1  Wudu (Ablution)
  ghusl.html            2-2  Ghusl (Full Purification)
  depth.html            2-3  The Full Salah Walkthrough
  times.html            2-4  Prayer Times & Conditions
  jumuah.html           2-5  Jumuʿah (Friday Prayer)
  alphabet.html         3-1  The 28 Letters
  connecting.html       3-2  Connecting Letters
  vowels.html           3-3  Short Vowels & Sukun
  reading.html          3-4  Reading Drills
  fatiha.html           4-1  Surah Al-Fatiha
  juz-amma.html         4-2  Last 10 Surahs of Juz Amma
  kursi.html            4-3  Ayat al-Kursi
  duas.html             4-4  Daily Duas
  revelation.html       5-1  Revelation & Compilation

Stories with full content:
  story-adam.html / story-adam-deep.html
  story-muhammad.html / story-muhammad-deep.html
```

## Features

- **Three depth options** for each story: moderate, deep, and single-page scroll
- **Dark mode** persisted across pages (toggle top-right)
- **Keyboard navigation** — left/right arrows step through modules; up/down scroll the page
- **Progress tracking** in `localStorage` — modules show "ready," "in progress," or "completed"
- **AI assistant button** (UI stub — needs an LLM endpoint wired in)
- **Islamic-themed design** — deep emerald + gold + cream, geometric star pattern, mihrab-arched cards

## Build status

About 20 of the ~120 curriculum modules currently have full content. The rest open a placeholder page with a "mark complete" button so the progress system stays functional.
