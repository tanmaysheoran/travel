import * as d3lib   from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import * as topolib from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

export const d3       = d3lib;
export const topojson = topolib;

export const W = window.innerWidth;
export const H = window.innerHeight;

export const svg = d3.select('#map-svg').attr('width', W).attr('height', H);

// ── Orthographic globe ────────────────────────────────────────────────────────
// Initial rotation centers on New Delhi. Negative of [lng, lat].
export const BASE_SCALE = Math.min(W, H) * 0.42;

export const projection = d3.geoOrthographic()
    .scale(BASE_SCALE)
    .translate([W / 2, H / 2])
    .clipAngle(90)
    .rotate([-77.2, -28.6, 0]);

export const geoPath = d3.geoPath().projection(projection);

export const defs = svg.append('defs');

// ── Glow filters ──────────────────────────────────────────────────────────────
function makeGlow(id, std) {
    const f = defs.append('filter').attr('id', id)
        .attr('x', '-80%').attr('y', '-80%').attr('width', '260%').attr('height', '260%');
    f.append('feGaussianBlur')
        .attr('in', 'SourceGraphic').attr('stdDeviation', std).attr('result', 'blur');
    const m = f.append('feMerge');
    m.append('feMergeNode').attr('in', 'blur');
    m.append('feMergeNode').attr('in', 'SourceGraphic');
}

makeGlow('glow-soft',   5);
makeGlow('glow-strong', 14);
makeGlow('glow-arc',    3);

// ── Layer groups ──────────────────────────────────────────────────────────────
export const gMap       = svg.append('g').attr('id', 'g-map');
export const gSphere    = gMap.append('g');
export const gGraticule = gMap.append('g');
export const gCountries = gMap.append('g');
export const gBorders   = gMap.append('g');
export const gLabels    = gMap.append('g');
export const gArcs      = gMap.append('g');

// Markers live outside gMap — repositioned explicitly, not affected by transforms
export const gOverlay = svg.append('g').attr('id', 'g-overlay');
export const gMarkers = gOverlay.append('g');
