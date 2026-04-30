export const HOME = {
    coordinates: [77.2090, 28.6139], // New Delhi [lng, lat]
    label: 'Home',
};

// SVG-attribute colors per theme (CSS vars handle HTML elements automatically)
export const THEME = {
    dark: {
        sphere:    '#060610',
        land:      '#0f0f1c',
        border:    '#181830',
        grat:      'rgba(255,255,255,0.025)',
        homeRing:  'rgba(255,255,255,0.08)',
        homeDot:   'rgba(255,255,255,0.45)',
        homeLabel: 'rgba(255,255,255,0.22)',
    },
    light: {
        sphere:    '#ccd8ed',
        land:      '#dcdce8',
        border:    '#b8b8cc',
        grat:      'rgba(0,0,0,0.06)',
        homeRing:  'rgba(0,0,0,0.12)',
        homeDot:   'rgba(0,0,0,0.38)',
        homeLabel: 'rgba(0,0,0,0.28)',
    },
};
