export const HOME = {
    coordinates: [77.2090, 28.6139], // New Delhi [lng, lat]
    label: 'Home',
};

// SVG-attribute colors per theme (CSS vars handle HTML elements automatically)
export const THEME = {
    dark: {
        sphere:    '#1c3154',
        land:      '#212130',
        border:    'rgba(60,70,120,0.5)',
        grat:      'rgba(255,255,255,0.04)',
        homeRing:  'rgba(255,255,255,0.18)',
        homeDot:   'rgba(255,255,255,0.75)',
        homeLabel: 'rgba(255,255,255,0.55)',
    },
    light: {
        sphere:    '#a8c8e0',
        land:      '#dcdcf0',
        border:    '#9090b8',
        grat:      'rgba(0,0,0,0.07)',
        homeRing:  'rgba(0,0,0,0.12)',
        homeDot:   'rgba(0,0,0,0.38)',
        homeLabel: 'rgba(0,0,0,0.28)',
    },
};
