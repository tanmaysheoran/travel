import { d3, svg, projection, BASE_SCALE, defs } from './map.js';

// ── Versor math — quaternion-based great-circle rotation ──────────────────────
function qFromEuler([λ, φ, γ]) {
    λ *= Math.PI / 360; φ *= Math.PI / 360; γ *= Math.PI / 360;
    return [
        Math.cos(λ)*Math.cos(φ)*Math.cos(γ) + Math.sin(λ)*Math.sin(φ)*Math.sin(γ),
        Math.sin(λ)*Math.cos(φ)*Math.cos(γ) - Math.cos(λ)*Math.sin(φ)*Math.sin(γ),
        Math.cos(λ)*Math.sin(φ)*Math.cos(γ) + Math.sin(λ)*Math.cos(φ)*Math.sin(γ),
        Math.cos(λ)*Math.cos(φ)*Math.sin(γ) - Math.sin(λ)*Math.sin(φ)*Math.cos(γ),
    ];
}
function qToEuler([a, b, c, d]) {
    return [
        Math.atan2(2*(a*b + c*d), 1 - 2*(b*b + c*c)) * (180/Math.PI),
        Math.asin(Math.max(-1, Math.min(1, 2*(a*c - d*b)))) * (180/Math.PI),
        Math.atan2(2*(a*d + b*c), 1 - 2*(c*c + d*d)) * (180/Math.PI),
    ];
}
function qMul([a1,b1,c1,d1], [a2,b2,c2,d2]) {
    return [
        a1*a2 - b1*b2 - c1*c2 - d1*d2,
        a1*b2 + b1*a2 + c1*d2 - d1*c2,
        a1*c2 - b1*d2 + c1*a2 + d1*b2,
        a1*d2 + b1*c2 - c1*b2 + d1*a2,
    ];
}
function toCart([λ, φ]) {
    const l = λ * Math.PI/180, p = φ * Math.PI/180, cp = Math.cos(p);
    return [cp*Math.cos(l), cp*Math.sin(l), Math.sin(p)];
}
function qDelta(v0, v1) {
    const w = [v0[1]*v1[2]-v0[2]*v1[1], v0[2]*v1[0]-v0[0]*v1[2], v0[0]*v1[1]-v0[1]*v1[0]];
    const dot = v0[0]*v1[0] + v0[1]*v1[1] + v0[2]*v1[2];
    const l = Math.hypot(...w);
    if (!l) return [1, 0, 0, 0];
    const t = Math.atan2(l, dot) / 2, s = Math.sin(t) / l;
    return [Math.cos(t), w[2]*s, -w[1]*s, w[0]*s];
}

// ── Module state ───────────────────────────────────────────────────────────────
const BASE_GLOW = { 'glow-soft': 5, 'glow-strong': 14, 'glow-arc': 3 };
let currentK   = 1;
let v0, q0, r0;
let prevRot    = null;
let rotVelLng  = 0, rotVelLat = 0;
let inertiaRaf = null;

export function getCurrentK() { return currentK; }

export function initGlobe(redraw) {
    // Scroll to zoom — updates projection.scale() directly (no CSS transform)
    svg.on('wheel.zoom', (event) => {
        event.preventDefault();
        const factor = event.deltaY < 0 ? 1.12 : 1/1.12;
        currentK = Math.max(0.5, Math.min(20, currentK * factor));
        projection.scale(BASE_SCALE * currentK);
        scaleGlowFilters(currentK);
        redraw();
    }, { passive: false });

    // Versor drag — rotates the projection, not the SVG element
    const drag = d3.drag()
        .on('start', (event) => {
            stopInertia();
            const inv = projection.invert([event.x, event.y]);
            if (!inv) return;
            v0      = toCart(inv);
            q0      = qFromEuler(r0 = projection.rotate());
            prevRot = null;
            rotVelLng = rotVelLat = 0;
            svg.style('cursor', 'grabbing');
        })
        .on('drag', (event) => {
            const inv = projection.rotate(r0).invert([event.x, event.y]);
            if (!inv) return;
            const newRot = qToEuler(qMul(q0, qDelta(v0, toCart(inv))));
            projection.rotate(newRot);
            if (prevRot) {
                let dλ = newRot[0] - prevRot[0];
                if (dλ >  180) dλ -= 360;
                if (dλ < -180) dλ += 360;
                rotVelLng = dλ;
                rotVelLat = newRot[1] - prevRot[1];
            }
            prevRot = [...newRot];
            redraw();
        })
        .on('end', () => {
            svg.style('cursor', 'grab');
            startInertia(redraw);
        });

    svg.call(drag);
    svg.style('cursor', 'grab');
    svg.on('dblclick.zoom', null);
}

function stopInertia() {
    if (inertiaRaf) { cancelAnimationFrame(inertiaRaf); inertiaRaf = null; }
}

// Applies last drag's angular displacement, decaying each frame.
function startInertia(redraw) {
    const DECAY = 0.93;
    function tick() {
        rotVelLng *= DECAY;
        rotVelLat *= DECAY;
        if (Math.abs(rotVelLng) + Math.abs(rotVelLat) < 0.005) {
            inertiaRaf = null;
            return;
        }
        const [λ, φ, γ] = projection.rotate();
        projection.rotate([
            λ + rotVelLng,
            Math.max(-90, Math.min(90, φ + rotVelLat)),
            γ,
        ]);
        redraw();
        inertiaRaf = requestAnimationFrame(tick);
    }
    inertiaRaf = requestAnimationFrame(tick);
}

function scaleGlowFilters(k) {
    for (const [id, base] of Object.entries(BASE_GLOW)) {
        defs.select(`#${id} feGaussianBlur`).attr('stdDeviation', base / k);
    }
}
