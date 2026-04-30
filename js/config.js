export const HOME = {
    coordinates: [77.2090, 28.6139], // New Delhi [lng, lat]
    label: 'Home',
};

// SVG-attribute colors per theme (CSS vars handle HTML elements automatically)
export const THEME = {
    dark: {
        sphere:    '#03030c',
        land:      '#191932',
        border:    '#32325a',
        grat:      'rgba(255,255,255,0.06)',
        homeRing:  'rgba(255,255,255,0.08)',
        homeDot:   'rgba(255,255,255,0.45)',
        homeLabel: 'rgba(255,255,255,0.22)',
    },
    light: {
        sphere:    '#8fb3d4',
        land:      '#c8c8dc',
        border:    '#7070a0',
        grat:      'rgba(0,0,0,0.12)',
        homeRing:  'rgba(0,0,0,0.12)',
        homeDot:   'rgba(0,0,0,0.38)',
        homeLabel: 'rgba(0,0,0,0.28)',
    },
};
