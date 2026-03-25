// Animation : disques concentriques se déplaçant vers le dernier clic
(function () {
    var svg = document.querySelector('.bg-circles');

    // 8 disques — rayons en progression arithmétique (écarts : 50, 70, 90, 110, 130, 150, 170 px)
    var radii    = [30, 80, 150, 240, 350, 480, 630, 800];
    // Facteur de lerp réduit : déplacement plus lent, retard croissant vers l'extérieur
    var lerps    = [0.07, 0.05, 0.035, 0.025, 0.018, 0.012, 0.009, 0.006];
    // Opacité au bord du dégradé radial : base (immobile) et max (après un clic)
    var baseOp   = [0.06, 0.05, 0.04, 0.03, 0.025, 0.02, 0.015, 0.01];
    var brightOp = [0.40, 0.30, 0.22, 0.16, 0.12, 0.09, 0.07, 0.05];

    var N   = radii.length;
    var cx0 = document.documentElement.clientWidth / 2;
    var cy0 = document.documentElement.clientHeight / 2;

    var mouse             = { x: cx0, y: cy0 };
    var prevAnim          = { x: cx0, y: cy0 };  // position cible au frame précédent
    var smoothedSpeed     = 0;                    // vitesse lissée (px/frame)
    var smoothedIntensity = radii.map(function () { return 0; });
    var positions         = radii.map(function () { return { x: cx0, y: cy0 }; });
    var lastDirs          = radii.map(function () { return { x: 1, y: 0 }; });
    var circles           = new Array(N);
    var outerStops        = [];
    var grads             = [];

    // <defs> + un <radialGradient> par disque
    var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    for (var i = 0; i < N; i++) {
        var grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        grad.setAttribute('id', 'rg-' + i);
        grad.setAttribute('gradientUnits', 'userSpaceOnUse');
        grad.setAttribute('cx', cx0);
        grad.setAttribute('cy', cy0);
        grad.setAttribute('r', radii[i]);

        var sIn = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        sIn.setAttribute('offset', '0%');
        sIn.setAttribute('stop-color', 'currentColor');
        sIn.setAttribute('stop-opacity', '0');

        var sOut = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        sOut.setAttribute('offset', '100%');
        sOut.setAttribute('stop-color', 'currentColor');
        sOut.setAttribute('stop-opacity', String(baseOp[i]));

        grad.appendChild(sIn);
        grad.appendChild(sOut);
        defs.appendChild(grad);
        grads.push(grad);
        outerStops.push(sOut);
    }

    // Disques du plus grand au plus petit : le plus petit est rendu par-dessus
    for (var i = N - 1; i >= 0; i--) {
        var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        c.setAttribute('r', radii[i]);
        c.setAttribute('cx', cx0);
        c.setAttribute('cy', cy0);
        c.setAttribute('fill', 'url(#rg-' + i + ')');
        c.setAttribute('stroke', 'none');
        svg.appendChild(c);
        circles[i] = c;
    }

    // Point central (suit le disque le plus petit)
    var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '1');
    dot.setAttribute('fill', 'currentColor');
    dot.setAttribute('stroke', 'none');
    dot.setAttribute('cx', cx0);
    dot.setAttribute('cy', cy0);
    dot.setAttribute('opacity', String(baseOp[0]));
    svg.appendChild(dot);

    function resize() {
        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    }
    resize();
    window.addEventListener('resize', resize);

    // Mise à jour de la cible uniquement sur clic (pas sur mousemove)
    document.addEventListener('click', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    document.addEventListener('touchstart', function (e) {
        if (e.touches.length > 0) {
            mouse.x = e.touches[0].clientX;
            mouse.y = e.touches[0].clientY;
        }
    }, { passive: true });

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animate() {
        // Vitesse de saut : non nulle uniquement le frame qui suit un clic
        var dmx = mouse.x - prevAnim.x;
        var dmy = mouse.y - prevAnim.y;
        prevAnim.x = mouse.x;
        prevAnim.y = mouse.y;
        var rawSpeed = Math.sqrt(dmx * dmx + dmy * dmy);
        // Filtre exponentiel : pic à chaque clic, décroissance en ~0,3 s
        smoothedSpeed = smoothedSpeed * 0.85 + rawSpeed * 0.15;
        // Intensité globale : 0 (immobile) → 1 (clic à ≥ 35 px de la position précédente)
        var intensity = Math.min(1, smoothedSpeed / 35);

        for (var i = 0; i < N; i++) {
            positions[i].x += (mouse.x - positions[i].x) * lerps[i];
            positions[i].y += (mouse.y - positions[i].y) * lerps[i];

            var px = positions[i].x;
            var py = positions[i].y;
            circles[i].setAttribute('cx', px.toFixed(1));
            circles[i].setAttribute('cy', py.toFixed(1));

            // Direction cible → centre du disque (normalisée)
            var dx   = mouse.x - px;
            var dy   = mouse.y - py;
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
                lastDirs[i].x = dx / dist;
                lastDirs[i].y = dy / dist;
            }

            // Intensité lissée par disque : les grands disques réagissent plus lentement
            smoothedIntensity[i] += (intensity - smoothedIntensity[i]) * lerps[i];
            var si = smoothedIntensity[i];

            var nx = lastDirs[i].x;
            var ny = lastDirs[i].y;
            var r  = radii[i];

            // Centre du dégradé légèrement décalé vers la cible selon l'intensité
            var offset = r * 0.25 * si;
            grads[i].setAttribute('cx', (px + nx * offset).toFixed(1));
            grads[i].setAttribute('cy', (py + ny * offset).toFixed(1));
            grads[i].setAttribute('r',  r);

            // Opacité au bord : baseOp au repos → brightOp après un clic
            var opOut = baseOp[i] + (brightOp[i] - baseOp[i]) * si;
            outerStops[i].setAttribute('stop-opacity', opOut.toFixed(4));
        }

        dot.setAttribute('cx', positions[0].x.toFixed(1));
        dot.setAttribute('cy', positions[0].y.toFixed(1));
        dot.setAttribute('opacity', (baseOp[0] + (brightOp[0] - baseOp[0]) * smoothedIntensity[0]).toFixed(4));

        if (!reducedMotion) requestAnimationFrame(animate);
    }

    if (!reducedMotion) requestAnimationFrame(animate);
})();
