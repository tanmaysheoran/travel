import { HOME, THEME } from './config.js';
import { d3, projection, gMarkers } from './map.js';

export function drawHomeMarker() {
    const xy = projection(HOME.coordinates);
    if (!xy) return;

    const g = gMarkers.append('g')
        .attr('transform', `translate(${xy})`)
        .attr('data-lng', HOME.coordinates[0])
        .attr('data-lat', HOME.coordinates[1]);

    g.append('circle').attr('class', 'home-ring')
        .attr('r', 14).attr('fill', 'none')
        .attr('stroke', THEME.dark.homeRing).attr('stroke-width', 1);

    g.append('circle').attr('class', 'home-dot')
        .attr('r', 2.8)
        .attr('fill', THEME.dark.homeDot)
        .attr('filter', 'url(#glow-soft)');

    g.append('text').attr('class', 'home-label')
        .attr('x', 10).attr('y', -10)
        .attr('fill', THEME.dark.homeLabel)
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

// Called on every projection change to keep markers at the correct screen position.
export function repositionMarkers() {
    gMarkers.selectAll('g[data-lng]').each(function() {
        const el  = d3.select(this);
        const lng = +el.attr('data-lng');
        const lat = +el.attr('data-lat');
        const xy  = projection([lng, lat]);
        // Push off-screen if the point is on the back hemisphere (projection returns null)
        el.attr('transform', xy ? `translate(${xy})` : 'translate(-9999,-9999)');
    });
}

function animateRipple(sel) {
    sel.attr('r', 4).attr('opacity', 0.8)
        .transition().duration(2500).ease(d3.easePolyOut.exponent(2))
        .attr('r', 24).attr('opacity', 0)
        .on('end', () => animateRipple(sel));
}
