import { d3, geoPath, gLabels } from './map.js';
import { COUNTRY_NAMES } from './country-names.js';

const AREA_TIERS = [
    { minArea: 8000, showAtK: 1.8 },
    { minArea: 2000, showAtK: 2.5 },
    { minArea: 500,  showAtK: 4.0 },
    { minArea: 80,   showAtK: 7.0 },
    { minArea: 0,    showAtK: 12.0 },
];

let labelSelection = null;

export function createLabels(features, visitedByIso) {
    const labelData = features
        .map(d => {
            const centroid = geoPath.centroid(d);
            if (!centroid || isNaN(centroid[0])) return null;
            const name    = visitedByIso.get(String(d.id))?.name ?? COUNTRY_NAMES.get(+d.id);
            if (!name) return null;
            const area        = geoPath.area(d);
            const visited     = visitedByIso.has(String(d.id));
            const color       = visited
                ? (visitedByIso.get(String(d.id)).flag_colors?.[1] ?? '#fff')
                : null;
            const geoCentroid = d3.geoCentroid(d);
            return { id: d.id, feature: d, centroid, name, area, visited, color, geoCentroid };
        })
        .filter(Boolean);

    labelSelection = gLabels.selectAll('text')
        .data(labelData, d => d.id)
        .join('text')
        .attr('class', d => d.visited ? 'map-label visited' : 'map-label')
        .attr('x', d => d.centroid[0])
        .attr('y', d => d.centroid[1])
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('pointer-events', 'none')
        .style('transition', 'opacity 0.25s ease')
        .attr('opacity', 0)
        .text(d => d.name)
        .each(function (d) {
            applyLabelFill(d3.select(this), d, true);
        });
}

// Called on every projection change (drag/zoom) to keep label positions in sync.
export function repositionLabels() {
    if (!labelSelection) return;
    labelSelection.each(function(d) {
        const c = geoPath.centroid(d.feature);
        if (!c || isNaN(c[0])) return;
        d3.select(this).attr('x', c[0]).attr('y', c[1]);
    });
}

export function updateLabels(k) {
    if (!labelSelection) return;
    const fontSize = Math.max(13, 10 / k);
    labelSelection
        .style('font-size', `${fontSize}px`)
        .attr('opacity', d => {
            if (geoPath.area(d.feature) === 0) return 0;
            if (d.visited) return k >= 1.5 ? 1 : 0;
            const tier = AREA_TIERS.find(t => d.area >= t.minArea);
            return tier && k >= tier.showAtK ? 1 : 0;
        });
}

export function updateLabelTheme(dark) {
    if (!labelSelection) return;
    labelSelection.each(function (d) {
        applyLabelFill(d3.select(this), d, dark);
    });
}

function applyLabelFill(sel, d, dark) {
    if (d.visited) {
        sel.attr('fill', d.color);
    } else {
        sel.attr('fill', dark ? 'rgba(255,255,255,0.42)' : 'rgba(0,0,0,0.38)');
    }
}
