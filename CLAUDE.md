# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

The landing page uses ES modules and `fetch()` — must be served over HTTP, not opened as a file.

```bash
python3 -m http.server 8080
# or: npx serve .
```

Then open `http://localhost:8080`.

## Architecture

```
index.html                          # Lean HTML shell (no inline CSS/JS)
styles/
  main.css                          # All landing-page CSS + theme variables
js/
  config.js                         # HOME coordinates, THEME color constants
  map.js                            # D3/TopoJSON re-exports, SVG canvas, projection, layer groups
  theme.js                          # Dark/light toggle logic, applySVGTheme()
  gradient.js                       # Per-country hover gradient defs + sweep animation
  arc.js                            # Flight arc draw/clear
  markers.js                        # Home marker + visited country dots
  countries.js                      # Load + render countries, event handlers, idle pulse
  main.js                           # Entry point — wires everything, fetches world data
countries/
  manifest.json                     # Ordered list of country IDs to show on map
  {country-id}/
    data.json                       # Country metadata (see schema below)
    index.html                      # Country detail page (sticky parallax)
    content/
      hero.jpg
      {city}/                       # Per-city SVG layer assets
```

### JS module dependency graph (no cycles)

```
config.js          ← (no imports)
map.js             ← d3, topojson [CDN ESM — URL lives here only]
theme.js           ← config.js, map.js
gradient.js        ← map.js
arc.js             ← config.js, map.js
markers.js         ← config.js, map.js
countries.js       ← map.js, gradient.js, arc.js
main.js            ← map.js, theme.js, countries.js, markers.js
```

D3 and topojson are imported as ESM from jsDelivr inside `map.js` and re-exported — the CDN URL is in one place only.

### Landing page flow

`main.js` boots: draws sphere/graticule, fetches world topology + manifest, delegates to `drawMap()`, `drawHomeMarker()`, `drawCountryDots()`.

`countries.js` handles country paths: visited countries glow (flag color), pulse idle, and on hover the gradient sweeps + a flight arc draws from home.

`gradient.js` uses `gradientUnits="objectBoundingBox"` — gradient auto-scales to each country's bounding box, no screen-coordinate math needed.

### Country detail page (`countries/{id}/index.html`)

Each city is a full-screen sticky parallax section:
- `{city}-wrapper` with `height: N*100vh` creates scroll distance
- `.sticky-container` pins the scene to viewport
- Image layers use `will-change: transform`

**Desktop** — CSS custom properties (`--kyoto-scroll` etc.) updated by scroll handler.
**Mobile** — direct `el.style.transform`, preserving any base `translateX(-50%)` etc.

### Adding a new country

1. Add the country ID to `countries/manifest.json`
2. Create `countries/{id}/data.json`:
   ```json
   {
     "name": "...",
     "iso_numeric": 392,
     "coordinates": [lng, lat],
     "flag_colors": ["#hex", "#hex"],
     "name_in_language": "..."
   }
   ```
   - `iso_numeric` — ISO 3166-1 numeric code (D3/TopoJSON uses this to find the country)
   - `coordinates` — capital city `[lng, lat]`, used as arc endpoint and dot position
   - `flag_colors[1]` — primary fill/glow/gradient color on the map
3. Create `countries/{id}/index.html` following the sticky-parallax pattern
4. Add assets to `countries/{id}/content/`

### Config

**Home city** (arc origin): `HOME` in `js/config.js`.
**Theme colors**: `THEME.dark` / `THEME.light` in `js/config.js` — SVG-attribute colors only; HTML element colors use CSS vars in `styles/main.css`.
