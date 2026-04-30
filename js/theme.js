import { THEME } from './config.js';
import { d3, gSphere, gGraticule, gCountries, gBorders, gMarkers } from './map.js';
import { updateLabelTheme } from './labels.js';

export let isDark = true;

const toggleBtn = document.getElementById('theme-toggle');

export function initTheme() {
    toggleBtn.addEventListener('click', () => {
        isDark = !isDark;
        document.body.classList.toggle('light', !isDark);
        toggleBtn.textContent = isDark ? '☀ light' : '● dark';
        applySVGTheme();
        updateLabelTheme(isDark);
    });
}

export function applySVGTheme() {
    const t   = isDark ? THEME.dark : THEME.light;
    const dur = 500;

    gSphere.select('path').transition().duration(dur).attr('fill', t.sphere);
    gGraticule.select('path').transition().duration(dur).attr('stroke', t.grat);
    gCountries.selectAll('.country:not(.visited)').transition().duration(dur).attr('fill', t.land);
    gBorders.select('path').transition().duration(dur).attr('stroke', t.border);
    gMarkers.select('.home-ring').transition().duration(dur).attr('stroke', t.homeRing);
    gMarkers.select('.home-dot').transition().duration(dur).attr('fill', t.homeDot);
    gMarkers.select('.home-label').transition().duration(dur).attr('fill', t.homeLabel);
}
