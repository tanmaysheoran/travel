import { d3, defs } from './map.js';

// Creates one SVG linearGradient per visited country.
// Uses objectBoundingBox so the gradient automatically scales to each country shape —
// no screen-coordinate math needed, works at any viewport size.
export function createGradients(visitedList) {
    visitedList.forEach(country => {
        const c1 = country.flag_colors?.[1] ?? '#ffffff'; // bright center color
        const c2 = country.flag_colors?.[0] ?? c1;        // dim edge color

        const grad = defs.append('linearGradient')
            .attr('id', `grad-${country.id.replace(/\s+/g, '-')}`)
            .attr('gradientUnits', 'objectBoundingBox')
            .attr('x1', 0).attr('y1', 0)
            .attr('x2', 1).attr('y2', 0)
            .attr('gradientTransform', 'rotate(-35, 0.5, 0.5)');

        grad.append('stop').attr('offset',  '0%').attr('stop-color', c2).attr('stop-opacity', 0.1);
        grad.append('stop').attr('offset', '30%').attr('stop-color', c1).attr('stop-opacity', 0.75);
        grad.append('stop').attr('offset', '50%').attr('stop-color', c1).attr('stop-opacity', 1.0);
        grad.append('stop').attr('offset', '70%').attr('stop-color', c1).attr('stop-opacity', 0.75);
        grad.append('stop').attr('offset','100%').attr('stop-color', c2).attr('stop-opacity', 0.1);
    });
}

// Sweeps the gradient 90° across the country bounding box on hover.
export function sweepGradient(id) {
    const grad = d3.select(`#grad-${id.replace(/\s+/g, '-')}`);
    grad.attr('gradientTransform', 'rotate(-35, 0.5, 0.5)');
    grad.transition().duration(950).ease(d3.easeCubicOut)
        .attr('gradientTransform', 'rotate(55, 0.5, 0.5)');
}
