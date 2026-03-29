# Clark College Web Development – Student Resources Browser Extension

A browser extension that provides Clark College Web Development students with quick access to curated links, tools, and resources directly from the browser toolbar.

**Version:** 1.6.8  
**Manifest:** V3  
**Browsers:** Chrome, Firefox  
**Developer:** Professor Bruce Elgort – Computer Technology, Clark College

---

## Overview

When clicked, the extension opens a popup window containing categorized links and resources useful for web development coursework. It also includes built-in HTML and CSS validation for the current page, a real-time search/filter feature, and collapsible sections with persistent state.

---

## Features

### Resource Categories

The popup organizes resources into the following sections:

| Section | Description |
|---|---|
| **Accessibility** | Tools and guidelines for web accessibility (WAVE, WebAIM, WCAG, alt text decision tree) |
| **AI Development Tools** | Links to ChatGPT, Claude, GitHub Copilot, Google Gemini, Perplexity |
| **Design & UI/UX Tools** | Icon libraries, color pickers, CSS generators, font resources, design inspiration |
| **HTML/CSS Validation** | Links to W3C validators plus one-click validation buttons for the active tab |
| **Language References** | Documentation for HTML, CSS, JavaScript, Python, PHP, C#, SQL, TypeScript, Bootstrap, Tailwind, Vue.js, Svelte, WordPress, and more |
| **Miscellaneous** | Browser support tables, CS50 courses, mock data generators, FileZilla, StackOverflow |
| **Popular Clark College Links** | Canvas, ctcLink, course schedule, tutoring, counseling, TechHub, and other campus services |
| **Program Maps** | Direct links to Computer Support, Digital Media Arts, and Web Development program maps |
| **YouTube Channels** | Curated educational channels (Kevin Powell, Traversy Media, Web Dev Simplified, CS50, and others) |

### One-Click HTML & CSS Validation

Two buttons in the **Validation** section send the URL of the currently active tab to the W3C HTML Validator or CSS Validator, replacing the current page with the validation results.

### Search / Filter

- A sticky search bar at the top lets students filter resources in real time.
- Matching text is highlighted within link labels.
- Sections with no matches are hidden; a "no results" message appears when nothing matches.
- Press `/` anywhere in the popup to focus the search box; press `Escape` to clear it.

### Collapsible Sections

- Each category section can be collapsed or expanded by clicking or pressing Enter/Space on the section heading.
- Sections default to collapsed on open.
- Collapse states are saved to `localStorage` so they persist between popup opens.

### Accessibility

- Skip-to-content link for keyboard users.
- Section headings have `role="button"`, `tabindex="0"`, and `aria-expanded` attributes.
- Links that open in new tabs are annotated with a screen-reader-only "(opens in new tab)" label.
- The extension uses the [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) font for improved readability.

### Easter Egg

Click the Clark College logo five times within one second to trigger a spin animation and confetti effect.

---

## Project Structure

```
├── manifest.json      # Extension manifest (V3)
├── popup.html         # Popup UI with all resource links
├── popup.js           # Validation buttons, search, collapsible sections, easter egg
├── css/
│   └── style.css      # All popup styles (nav, search, sections, animations)
├── images/
│   └── logo.png       # Clark College logo displayed in the header
├── icon_32.png        # Extension icon (32×32)
├── icon_48.png        # Extension icon (48×48)
├── icon_64.png        # Extension icon (64×64)
├── icon_128.png       # Extension icon (128×128)
└── README.md          # This file
```

---

## How It Works

### manifest.json

Declares the extension as Manifest V3 with the `tabs` permission (needed to read the active tab URL for validation). Defines `popup.html` as the default popup and registers icons. Includes `browser_specific_settings` for Firefox compatibility.

### popup.html

A single-page HTML document containing:
- A header with the Clark College logo and program title.
- A sticky navigation bar with anchor links to each section.
- A sticky search box with a clear button.
- Categorized `<ul>` lists of external links (all open in new tabs).
- Two validation buttons that use `popup.js` to validate the current page.
- A footer with a link to the GitHub repository and version info.

### popup.js

Handles all interactive behavior:
1. **Validation buttons** – Query the active tab, build a W3C validator URL, and navigate the tab to it.
2. **Navigation menu** – Smooth-scrolls to the target section, expands it if collapsed, and clears any active search.
3. **Collapsible sections** – Wraps content after each `<h2>` in a `<div class="section-content">`, toggles a `collapsed` class with animated `max-height`, and persists state via `localStorage`.
4. **Search** – Filters `<li>` items by text content, highlights matches, shows/hides sections, and displays a "no results" message when appropriate.
5. **Keyboard shortcuts** – `/` focuses the search box; `Escape` clears it.
6. **Easter egg** – Tracks logo clicks and fires confetti after five rapid clicks.
7. **Screen reader annotations** – Appends a hidden "(opens in new tab)" span to every external link.

### css/style.css

Styles the popup at a fixed width of 550 px. Includes:
- Sticky navigation bar and search container with drop shadows.
- Pill-shaped nav buttons in Clark College navy (#002855).
- Animated collapsible section transitions.
- Search highlight styling.
- Confetti and logo spin keyframe animations.
- Skip-link and screen-reader-only utility classes.

---

## Installation

### Chrome (unpacked)

1. Open `chrome://extensions/`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select this project folder.

### Firefox (temporary)

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and select `manifest.json`.

---

## Permissions

| Permission | Reason |
|---|---|
| `tabs` | Read the active tab's URL to build W3C validation links |

---

## Contributing

The source code is available on GitHub:  
<https://github.com/belgort-clark/web-dev-chrome-extension>

To suggest new resources or report issues, open an issue or pull request on the repository.
