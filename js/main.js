import { THEME } from './config.js';
import { d3, topojson, geoPath, gSphere, gGraticule } from './map.js';
import { initTheme } from './theme.js';
import { loadVisitedCountries, drawMap } from './countries.js';
import { drawHomeMarker, drawCountryDots } from './markers.js';

async function init() {
    initTheme();

    // ── Base map layers ────────────────────────────────────────────────────────
    gSphere.append('path')
        .datum({ type: 'Sphere' })
        .attr('fill', THEME.dark.sphere)
        .attr('d', geoPath);

    gGraticule.append('path')
        .datum(d3.geoGraticule()())
        .attr('fill', 'none')
        .attr('stroke', THEME.dark.grat)
        .attr('stroke-width', 0.4)
        .attr('d', geoPath);

    // ── Data fetching ──────────────────────────────────────────────────────────
    const [world, manifest] = await Promise.all([
        d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
        d3.json('countries/manifest.json'),
    ]);

    const visitedList = await loadVisitedCountries(manifest);

    document.getElementById('counter').textContent =
        `${visitedList.length} ${visitedList.length === 1 ? 'country' : 'countries'} explored`;

    // ── Render ────────────────────────────────────────────────────────────────
    drawMap(world, topojson, visitedList);
    drawHomeMarker();
    drawCountryDots(visitedList);
}

window.addEventListener('resize', () => location.reload());

init();
