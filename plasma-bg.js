// Animation : plasma topographique continu
// Principe : formule plasma (4 ondes sinus) évaluée en (x, y, t).
// La valeur continue est quantifiée en N_BANDS niveaux de gris discrets
// → zones uniformes séparées par des contours nets, comme des courbes de niveau.
// Les formes évoluent car t avance chaque frame (bruit 3D tranché en 2D).
(function () {
    'use strict';

    const canvas = document.querySelector('.plasma-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ── Paramètres visuels ──────────────────────────────────────────
    const STEP    = 4;   // taille de chaque cellule en pixels (perf vs résolution)
    const N_BANDS = 8;   // nombre de niveaux de gris

    // Niveaux de gris par bande — du plus sombre au plus clair
    // Calibrés pour rester subtils par rapport au fond de la page
    const DARK_BANDS  = [20, 28, 38, 49, 61, 74, 87, 100]; // sur fond #121212
    const LIGHT_BANDS = [244, 235, 225, 215, 206, 197, 188, 180]; // sur fond #fafafa

    const isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

    // ── Formule plasma ──────────────────────────────────────────────
    // Même base mathématique que l'animation TUIStudio :
    // somme de 4 sinusoïdes à vitesses différentes → interférences organiques.
    // cx, cy ∈ [0, 1] (coordonnées normalisées)  |  t : temps
    // Retourne une valeur dans [-1, 1]
    function plasma(cx, cy, t) {
        const x  = cx * 10;
        const y  = cy * 7;
        const dx = cx - 0.5;
        const dy = cy - 0.5;
        const d  = Math.sqrt(dx * dx + dy * dy);
        return (
            Math.sin(x + t) +
            Math.sin(y + t * 0.7) +
            Math.sin((x + y) * 0.6 + t * 0.9) +
            Math.sin(d * 14 + t * 1.1)
        ) / 4;
    }

    // ── Canvas basse résolution ─────────────────────────────────────
    // On calcule le plasma sur une grille réduite (W/STEP × H/STEP),
    // puis on étire le résultat au format pleine page sans flou (nearest-neighbor).
    let W, H, offW, offH, offscreen, offCtx, offData;

    function init() {
        W    = canvas.width  = canvas.offsetWidth;
        H    = canvas.height = canvas.offsetHeight;
        offW = Math.ceil(W / STEP);
        offH = Math.ceil(H / STEP);

        offscreen        = document.createElement('canvas');
        offscreen.width  = offW;
        offscreen.height = offH;
        offCtx  = offscreen.getContext('2d');
        offData = offCtx.createImageData(offW, offH);
    }

    // ── Boucle d'animation ──────────────────────────────────────────
    let t = 0;

    function frame() {
        const bands = isDark() ? DARK_BANDS : LIGHT_BANDS;
        const d     = offData.data;

        for (let r = 0; r < offH; r++) {
            const cy = r / offH;
            for (let c = 0; c < offW; c++) {
                const v    = plasma(c / offW, cy, t);          // −1 … 1
                const norm = (v + 1) / 2;                      //  0 … 1
                const band = Math.min(Math.floor(norm * N_BANDS), N_BANDS - 1);
                const grey = bands[band];
                const idx  = (r * offW + c) * 4;
                d[idx] = d[idx + 1] = d[idx + 2] = grey;
                d[idx + 3] = 255;
            }
        }

        offCtx.putImageData(offData, 0, 0);
        ctx.imageSmoothingEnabled = false;      // mise à l'échelle nette, sans flou
        ctx.drawImage(offscreen, 0, 0, W, H);

        t += 0.012;
        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', init);
    init();
    frame();
}());
