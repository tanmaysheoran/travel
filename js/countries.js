import { d3, geoPath, gCountries, gBorders } from './map.js';
import { createGradients, sweepGradient } from './gradient.js';
import { drawArc, clearArcs } from './arc.js';

const hoverInfo  = document.getElementById('hover-info');
const infoNative = document.getElementById('info-native');
const infoName   = document.getElementById('info-name');

export async function loadVisitedCountries(manifest) {
    return Promise.all(
        manifest.countries.map(id =>
            d3.json(`countries/${id}/data.json`).then(data => ({ id, ...data }))
        )
    );
}

// Returns { features, visitedByIso } so main.js can pass them to createLabels.
export function drawMap(world, topojson, visitedList) {
    const visitedByIso = new Map(visitedList.map(c => [String(c.iso_numeric), c]));

    createGradients(visitedList);

    const features = topojson.feature(world, world.objects.countries).features;
    const borders  = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);

    // ── Country fills ──────────────────────────────────────────────────────────
    gCountries.selectAll('path')
        .data(features)
        .join('path')
        .attr('d', geoPath)
        .attr('class', d => visitedByIso.has(String(d.id)) ? 'country visited' : 'country')
        .attr('fill', d => {
            const c = visitedByIso.get(String(d.id));
            return c ? (c.flag_colors?.[1] ?? '#fff') : '#0f0f1c';
        })
        .attr('fill-opacity', d => visitedByIso.has(String(d.id)) ? 0.45 : 1)
        .attr('stroke', 'none')
        .each(function (d) {
            const country = visitedByIso.get(String(d.id));
            if (!country) return;
            d3.select(this).attr('filter', 'url(#glow-soft)');
            pulsePath(d3.select(this), 0.4, 0.65, 2600 + Math.random() * 700);
        })
        .on('mouseenter', function (event, d) {
            const country = visitedByIso.get(String(d.id));
            if (!country) return;

            d3.select(this)
                .interrupt()
                .attr('fill', `url(#grad-${country.id})`)
                .attr('fill-opacity', 1)
                .attr('filter', 'url(#glow-strong)');

            sweepGradient(country.id);

            infoNative.textContent = country.name_in_language ?? '';
            infoName.textContent   = country.name;
            hoverInfo.classList.add('visible');

            drawArc(country);
        })
        .on('mouseleave', function (event, d) {
            const country = visitedByIso.get(String(d.id));
            if (!country) return;

            const baseColor = country.flag_colors?.[1] ?? '#fff';
            d3.select(this)
                .interrupt()
                .attr('filter', 'url(#glow-soft)')
                .transition().duration(450).ease(d3.easeQuadIn)
                .attr('fill', baseColor)
                .attr('fill-opacity', 0.45)
                .on('end', function () {
                    pulsePath(d3.select(this), 0.4, 0.65, 2600 + Math.random() * 700);
                });

            hoverInfo.classList.remove('visible');
            clearArcs();
        })
        .on('click', function (event, d) {
            const country = visitedByIso.get(String(d.id));
            if (country) window.location.href = `countries/${country.id}/index.html`;
        });

    // ── Borders ────────────────────────────────────────────────────────────────
    gBorders.append('path')
        .datum(borders)
        .attr('d', geoPath)
        .attr('fill', 'none')
        .attr('stroke', '#181830')
        .attr('stroke-width', 0.35)
        .style('vector-effect', 'non-scaling-stroke');

    return { features, visitedByIso };
}

// Recursive idle pulse — interrupted on hover, restarted on mouse-leave
function pulsePath(sel, lo, hi, dur) {
    sel.transition().duration(dur).ease(d3.easeSinInOut)
        .attr('fill-opacity', hi)
        .transition().duration(dur).ease(d3.easeSinInOut)
        .attr('fill-opacity', lo)
        .on('end', () => pulsePath(sel, lo, hi, dur));
}
