import * as d3lib   from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import * as topolib from 'https://cdn.jsdelivr.net/npm/topojson-client@3/+esm';

// Re-export so every other module imports from here — CDN URL stays in one place
export const d3       = d3lib;
export const topojson = topolib;

export const W = window.innerWidth;
export const H = window.innerHeight;

export const svg = d3.select('#map-svg').attr('width', W).attr('height', H);

export const projection = d3.geoNaturalEarth1()
    .scale(W / 6.0)
    .translate([W / 2, H / 2]);

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

// ── Layer groups (z-order: bottom → top) ──────────────────────────────────────
export const gSphere    = svg.append('g');
export const gGraticule = svg.append('g');
export const gCountries = svg.append('g');
export const gBorders   = svg.append('g');
export const gArcs      = svg.append('g');
export const gMarkers   = svg.append('g');
