import { HOME } from './config.js';
import { d3, geoPath, gArcs } from './map.js';

export function drawArc(country) {
    clearArcs();
    if (!country.coordinates) return;

    const line = {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            // Sample the great-circle path at fine resolution
            coordinates: d3.range(0, 1.005, 0.005)
                .map(t => d3.geoInterpolate(HOME.coordinates, country.coordinates)(t)),
        },
    };

    const arcEl = gArcs.append('path')
        .datum(line)
        .attr('class', 'flight-arc')
        .attr('filter', 'url(#glow-arc)')
        .attr('d', geoPath);

    const len = arcEl.node().getTotalLength();

    // Dash-draw animation
    arcEl
        .attr('stroke-dasharray', `${len} ${len}`)
        .attr('stroke-dashoffset', len)
        .transition().duration(1000).ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);

    // Dot traveling along the arc
    const dot = gArcs.append('circle')
        .attr('r', 2.5)
        .attr('fill', 'white')
        .attr('opacity', 0)
        .attr('filter', 'url(#glow-soft)');

    dot.transition().delay(80).duration(1000).ease(d3.easeCubicOut)
        .attrTween('transform', () => {
            const node = arcEl.node();
            return t => {
                const p = node.getPointAtLength(t * len);
                return `translate(${p.x},${p.y})`;
            };
        })
        .attr('opacity', 1)
        .on('end', function () {
            d3.select(this).transition().duration(600).attr('opacity', 0).remove();
        });
}

export function clearArcs() {
    gArcs.selectAll('*').interrupt().remove();
}
