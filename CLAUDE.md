# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

This is a pure static site. Because `index.html` uses `fetch()` to load country data, it must be served over HTTP — opening the file directly will fail with CORS errors.

```bash
# Any of these work:
python3 -m http.server 8080
npx serve .
```

Then open `http://localhost:8080`.

## Architecture

```
index.html                          # Landing page — country list with parallax
countries/
  manifest.json                     # Ordered list of country IDs to render
  {country-id}/
    data.json                       # { name, flag_colors, name_in_language }
    index.html                      # Full country detail page
    content/
      hero.jpg                      # Hero image
      {city}/                       # Per-city SVG layer assets
        title.svg
        *.svg / *.jpg.svg
```

### Landing page (`index.html`)

Reads `manifest.json`, fetches each country's `data.json`, then dynamically builds the DOM. Each country name is split into individual `<span class="char">` elements with a sequential `speedY` value that drives per-character parallax on scroll. Flag colors from `data.json` are rendered as a blurred gradient behind the country name.

Clicking a country navigates to `countries/{id}/index.html`.

### Country detail page (`countries/{id}/index.html`)

Each city is a full-screen sticky parallax section. The pattern is consistent across cities:

- A `{city}-wrapper` div with `height: N*100vh` creates the scroll distance
- A `.sticky-container` inside pins the scene to the viewport while scrolling through the wrapper
- Individual image layers are absolutely positioned with `will-change: transform`

**Desktop parallax** — driven by CSS custom properties (`--kyoto-scroll`, `--fuji-scroll`, etc.) set from the `#scroll-root` scroll event. Each layer's CSS references these variables directly (e.g. `transform: translateY(calc(var(--kyoto-scroll) * -0.08px))`).

**Mobile parallax** — skips CSS variables; directly sets `el.style.transform` in the scroll handler for each layer, preserving any existing translate components (e.g. `translateX(-50%)`) that are part of the mobile layout.

### Adding a new country

1. Add the country ID to `countries/manifest.json`
2. Create `countries/{id}/data.json` with these fields:
   - `name` — English name
   - `iso_numeric` — ISO 3166-1 numeric code (used by D3/TopoJSON to locate the country on the map)
   - `coordinates` — `[longitude, latitude]` of the capital/main city (arc endpoint + dot position)
   - `flag_colors` — array of hex strings; index `[1]` is used as the country fill/glow color
   - `name_in_language` — native name shown in the hover panel
3. Create `countries/{id}/index.html` following the sticky-parallax pattern from the Japan page
4. Add city SVG assets under `countries/{id}/content/{city}/`

### Map config (index.html)

The `HOME` constant near the top of `index.html`'s `<script>` sets the origin point for all flight-path arcs — change `coordinates` to `[lng, lat]` of your home city.
