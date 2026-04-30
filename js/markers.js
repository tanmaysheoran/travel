import { HOME, THEME } from './config.js';
import { d3, projection, gMarkers } from './map.js';

export function drawHomeMarker() {
    const xy = projection(HOME.coordinates);
    if (!xy) return;

    const g = gMarkers.append('g').attr('transform', `translate(${xy})`);

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
        const g = gMarkers.append('g').attr('transform', `translate(${xy})`);

        const ring = g.append('circle')
            .attr('r', 4).attr('fill', 'none')
            .attr('stroke', color).attr('stroke-width', 1.2).attr('opacity', 0.8);

        animateRipple(ring);

        g.append('circle')
            .attr('r', 2.8).attr('fill', color)
            .attr('filter', 'url(#glow-soft)');
    });
}

function animateRipple(sel) {
    sel.attr('r', 4).attr('opacity', 0.8)
        .transition().duration(2500).ease(d3.easePolyOut.exponent(2))
        .attr('r', 24).attr('opacity', 0)
        .on('end', () => animateRipple(sel));
}
