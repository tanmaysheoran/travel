import { HOME, THEME } from './config.js';
import { d3, projection, gMarkers } from './map.js';
import { isDark } from './theme.js';

export function drawHomeMarker() {
    const xy = projection(HOME.coordinates);
    if (!xy) return;
    const t = isDark ? THEME.dark : THEME.light;

    const g = gMarkers.append('g')
        .attr('transform', `translate(${xy})`)
        .attr('data-lng', HOME.coordinates[0])
        .attr('data-lat', HOME.coordinates[1]);

    g.append('circle').attr('class', 'home-ring')
        .attr('r', 14).attr('fill', 'none')
        .attr('stroke', t.homeRing).attr('stroke-width', 1);

    g.append('circle').attr('class', 'home-dot')
        .attr('r', 2.8)
        .attr('fill', t.homeDot)
        .attr('filter', 'url(#glow-soft)');

    g.append('text').attr('class', 'home-label')
        .attr('x', 10).attr('y', -10)
        .attr('fill', t.homeLabel)
        .attr('font-size', '9px')
        .attr('letter-spacing', '0.25em')
        .text(HOME.label);
}

export function drawCountryDots(visitedList) {
    visitedList.forEach(country => {
        if (!country.coordinates) return;
        const xy = projection(country.coordinates);
        if (!xy) return;

        const color = country.flag_colors?.[1] ?? '#ffffff';
        const g = gMarkers.append('g')
            .attr('transform', `translate(${xy})`)
            .attr('data-lng', country.coordinates[0])
            .attr('data-lat', country.coordinates[1]);

        const ring = g.append('circle')
            .attr('r', 4).attr('fill', 'none')
            .attr('stroke', color).attr('stroke-width', 1.2).attr('opacity', 0.8);

        animateRipple(ring);

        g.append('circle')
            .attr('r', 2.8).attr('fill', color)
            .attr('filter', 'url(#glow-soft)');
    });
}

// Returns true if [lng, lat] is on the visible front hemisphere.
// d3.geoDistance gives great-circle distance in radians; front hemisphere = within π/2 of view center.
function isVisible(lng, lat) {
    const r = projection.rotate();
    const center = [-r[0], -r[1]];
    return d3.geoDistance([lng, lat], center) < Math.PI / 2;
}

// Called on every projection change to keep markers at the correct screen position.
export function repositionMarkers() {
    gMarkers.selectAll('g[data-lng]').each(function() {
        const el  = d3.select(this);
        const lng = +el.attr('data-lng');
        const lat = +el.attr('data-lat');
        if (!isVisible(lng, lat)) {
            el.attr('transform', 'translate(-9999,-9999)');
            return;
        }
        const xy = projection([lng, lat]);
        el.attr('transform', `translate(${xy})`);
    });
}

function animateRipple(sel) {
    sel.attr('r', 4).attr('opacity', 0.8)
        .transition().duration(2500).ease(d3.easePolyOut.exponent(2))
        .attr('r', 24).attr('opacity', 0)
        .on('end', () => animateRipple(sel));
}
