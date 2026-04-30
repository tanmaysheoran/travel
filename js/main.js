import { THEME } from './config.js';
import { d3, topojson, geoPath, gSphere, gGraticule, gCountries, gBorders } from './map.js';
import { initTheme } from './theme.js';
import { initGlobe, getCurrentK } from './zoom.js';
import { loadVisitedCountries, drawMap } from './countries.js';
import { drawHomeMarker, drawCountryDots, repositionMarkers } from './markers.js';
import { createLabels, repositionLabels, updateLabels } from './labels.js';
import { redrawArcs } from './arc.js';

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
        .style('vector-effect', 'non-scaling-stroke')
        .attr('d', geoPath);

    // ── Data ──────────────────────────────────────────────────────────────────
    const [world, manifest] = await Promise.all([
        d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'),
        d3.json('countries/manifest.json'),
    ]);

    const visitedList = await loadVisitedCountries(manifest);

    document.getElementById('counter').textContent =
        `${visitedList.length} ${visitedList.length === 1 ? 'country' : 'countries'} explored`;

    // ── Render ────────────────────────────────────────────────────────────────
    const { features, visitedByIso } = drawMap(world, topojson, visitedList);
    createLabels(features, visitedByIso);
    drawHomeMarker();
    drawCountryDots(visitedList);

    // ── Globe interaction — wired after all elements exist ────────────────────
    initGlobe(() => {
        gSphere.select('path').attr('d', geoPath);
        gGraticule.select('path').attr('d', geoPath);
        gCountries.selectAll('path').attr('d', geoPath);
        gBorders.select('path').attr('d', geoPath);
        repositionLabels();
        repositionMarkers();
        redrawArcs();
        updateLabels(getCurrentK());
    });
}

window.addEventListener('resize', () => location.reload());

init();
