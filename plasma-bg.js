// Animation : plasma SVG continu via feTurbulence + feTile + feOffset
(function () {
    'use strict';

    const NS  = 'http://www.w3.org/2000/svg';
    const svg = document.querySelector('.plasma-bg');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ── Construction du filtre SVG ───────────────────────────────────
       Pipeline :
         feTurbulence  →  feTile  →  feOffset (animé)
                                          ↓
                                    feColorMatrix (luminance → alpha)
                                          ↓
                                    feFlood (currentColor)
                                          ↓
                                    feComposite (operator="in")
    ─────────────────────────────────────────────────────────────────── */
    const defs   = document.createElementNS(NS, 'defs');
    const filter = document.createElementNS(NS, 'filter');
    filter.id = 'plasma-filter';
    // Région légèrement oversized : marge pour que feOffset ne découpe pas
    filter.setAttribute('x', '-10%');
    filter.setAttribute('y', '-10%');
    filter.setAttribute('width', '120%');
    filter.setAttribute('height', '120%');
    // Les dimensions des primitives sont en pixels
    filter.setAttribute('primitiveUnits', 'userSpaceOnUse');
    filter.setAttribute('color-interpolation-filters', 'sRGB');

    // 1. Bruit fractal de Perlin — tuile 600×450 px
    //    baseFrequency : 0.005 × 600 = 3 périodes horizontales
    //                    0.00444 × 450 ≈ 2 périodes verticales
    //    stitchTiles="stitch" rend la tuile seamlessly tileable
    const turb = document.createElementNS(NS, 'feTurbulence');
    turb.setAttribute('type', 'fractalNoise');
    turb.setAttribute('x', '0');
    turb.setAttribute('y', '0');
    turb.setAttribute('width', '600');
    turb.setAttribute('height', '450');
    turb.setAttribute('baseFrequency', '0.005 0.00444');
    turb.setAttribute('numOctaves', '3');
    turb.setAttribute('seed', '37');
    turb.setAttribute('stitchTiles', 'stitch');
    turb.setAttribute('result', 'noise');

    // 2. Pavage : répète la tuile 600×450 sur toute la région du filtre
    const tile = document.createElementNS(NS, 'feTile');
    tile.setAttribute('in', 'noise');
    tile.setAttribute('result', 'tiled');

    // 3. Décalage animé par JS → flux continu
    const feOff = document.createElementNS(NS, 'feOffset');
    feOff.setAttribute('in', 'tiled');
    feOff.setAttribute('dx', '0');
    feOff.setAttribute('dy', '0');
    feOff.setAttribute('result', 'moved');

    // 4. Canal rouge → canal alpha avec contraste
    //    A' = 3·R − 1  →  visible uniquement où R > 0.33
    const cmat = document.createElementNS(NS, 'feColorMatrix');
    cmat.setAttribute('in', 'moved');
    cmat.setAttribute('type', 'matrix');
    cmat.setAttribute('values', '0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -1');
    cmat.setAttribute('result', 'mask');

    // 5. Couleur unie via currentColor → hérite de color: var(--circle-color) en CSS
    //    → s'adapte automatiquement aux modes clair / foncé
    const flood = document.createElementNS(NS, 'feFlood');
    flood.setAttribute('flood-color', 'currentColor');
    flood.setAttribute('flood-opacity', '0.30');
    flood.setAttribute('result', 'color');

    // 6. Composite : applique la couleur à travers le masque alpha
    const comp = document.createElementNS(NS, 'feComposite');
    comp.setAttribute('in', 'color');
    comp.setAttribute('in2', 'mask');
    comp.setAttribute('operator', 'in');

    filter.append(turb, tile, feOff, cmat, flood, comp);
    defs.appendChild(filter);
    svg.appendChild(defs);

    // Rectangle pleine page portant le filtre
    const rect = document.createElementNS(NS, 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('filter', 'url(#plasma-filter)');
    svg.appendChild(rect);

    /* ── Redimensionnement ───────────────────────────────────────────── */
    function resize() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    }
    resize();
    window.addEventListener('resize', resize);

    /* ── Boucle d'animation ──────────────────────────────────────────── */
    var t = 0;

    function frame() {
        // Dérive bornée : somme de deux sinusoïdes aux fréquences incommensurables
        // → mouvement non-répétitif pendant ~10 min
        // Amplitude max : ±120 px (H) et ±90 px (V)
        // → inférieure à la demi-tuile (300×225), jamais de couture visible
        var ox = (80 * Math.sin(t * 0.07) + 40 * Math.sin(t * 0.13 + 0.5)).toFixed(2);
        var oy = (60 * Math.sin(t * 0.05 + 1.2) + 30 * Math.sin(t * 0.09 + 2.1)).toFixed(2);
        feOff.setAttribute('dx', ox);
        feOff.setAttribute('dy', oy);
        t += 0.016;
        requestAnimationFrame(frame);
    }

    frame();
}());
