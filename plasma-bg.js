// Animation : lignes de niveau topographiques (marching squares + SVG)
// Principe : champ de plasma évalué sur une grille → marching squares détecte
// où chaque seuil traverse chaque cellule → point exact par interpolation →
// segments vectoriels SVG. Les formes évoluent car t avance chaque frame.
(function () {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const svg = document.querySelector(".plasma-bg");
  if (!svg) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // ── Grille ───────────────────────────────────────────────────────
  const COLS = 100; // résolution horizontale
  const ROWS = 60; // résolution verticale

  // ── Niveaux de seuil répartis uniformément dans ]0, 1[ ──────────
  const N = 7;
  const THRESHOLDS = Array.from({ length: N }, (_, i) => (i + 1) / (N + 1));

  // ── Couleurs de trait par niveau (du plus foncé au plus clair) ───
  const isDark = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const DARK_CLR = [
    "#222",
    "#2b2b2b",
    "#353535",
    "#404040",
    "#4b4b4b",
    "#575757",
    "#636363",
  ];
  const LIGHT_CLR = [
    "#e0e0e0",
    "#d4d4d4",
    "#c8c8c8",
    "#bcbcbc",
    "#b0b0b0",
    "#a4a4a4",
    "#989898",
  ];

  // ── Formule plasma ───────────────────────────────────────────────
  // 3 ondes sinus à vitesses différentes → interférences organiques.
  // t avance lentement → les formes naissent et meurent progressivement.
  function plasma(cx, cy, t) {
    const x = cx * 10;
    const y = cy * 7;
    return (
      (Math.sin(x + t) +
        Math.sin(y + t * 0.7) +
        Math.sin((x + y) * 0.6 + t * 0.9)) /
      3
    ); // −1 … 1
  }

  // ── Table marching squares ───────────────────────────────────────
  // Encodage : bit 0=TL, 1=TR, 2=BR, 3=BL  (1 si valeur > seuil)
  // Arêtes   : 0=haut, 1=droite, 2=bas, 3=gauche
  // Chaque entrée = liste de paires d'arêtes [eA, eB] à relier
  const CASES = [
    [],       // 0  ·  ·  /  ·  ·
    [[0, 3]], // 1  TL
    [[0, 1]], // 2  TR
    [[1, 3]], // 3  TL+TR
    [[1, 2]], // 4  BR
    [
      [0, 3],
      [1, 2],
    ],        // 5  TL+BR  (selle)
    [[0, 2]], // 6  TR+BR
    [[2, 3]], // 7  TL+TR+BR
    [[2, 3]], // 8  BL
    [[0, 2]], // 9  TL+BL
    [
      [0, 1],
      [2, 3],
    ],        // 10 TR+BL  (selle)
    [[1, 2]], // 11 TL+TR+BL
    [[1, 3]], // 12 BR+BL
    [[0, 1]], // 13 TL+BR+BL
    [[0, 3]], // 14 TR+BR+BL
    [],       // 15 tous au-dessus
  ];

  // ── Interpolation du point de croisement sur une arête ───────────
  // Retourne [x, y] en coordonnées écran
  function crossPt(edge, c, r, v, T, W, H) {
    var u;
    switch (edge) {
      case 0: // haut  : TL(v[0]) → TR(v[1])
        u = (T - v[0]) / (v[1] - v[0]);
        return [((c + u) / COLS) * W, (r / ROWS) * H];
      case 1: // droite : TR(v[1]) → BR(v[2])
        u = (T - v[1]) / (v[2] - v[1]);
        return [((c + 1) / COLS) * W, ((r + u) / ROWS) * H];
      case 2: // bas   : BL(v[3]) → BR(v[2])
        u = (T - v[3]) / (v[2] - v[3]);
        return [((c + u) / COLS) * W, ((r + 1) / ROWS) * H];
      case 3: // gauche : TL(v[0]) → BL(v[3])
        u = (T - v[0]) / (v[3] - v[0]);
        return [(c / COLS) * W, ((r + u) / ROWS) * H];
    }
  }

  // ── Éléments SVG ─────────────────────────────────────────────────
  var paths = THRESHOLDS.map(function () {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("fill", "none");
    p.setAttribute("stroke-width", "1");
    p.setAttribute("stroke-linecap", "round");
    svg.appendChild(p);
    return p;
  });

  // ── Redimensionnement ─────────────────────────────────────────────
  var W, H;
  function resize() {
    W = document.documentElement.clientWidth;
    H = document.documentElement.clientHeight;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  }
  resize();
  window.addEventListener("resize", resize);

  // ── Grille de valeurs ─────────────────────────────────────────────
  var grid = new Float32Array((COLS + 1) * (ROWS + 1));

  // ── Boucle d'animation ────────────────────────────────────────────
  var t = 0;

  function frame() {
    var c, r, li;

    // 1. Évaluer le champ plasma sur chaque nœud de la grille
    for (r = 0; r <= ROWS; r++) {
      var cy = r / ROWS;
      for (c = 0; c <= COLS; c++) {
        grid[r * (COLS + 1) + c] = (plasma(c / COLS, cy, t) + 1) * 0.5;
      }
    }

    var colors = isDark() ? DARK_CLR : LIGHT_CLR;

    // 2. Marching squares pour chaque niveau de seuil
    for (li = 0; li < N; li++) {
      var T = THRESHOLDS[li];
      var d = [];

      for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
          var vTL = grid[r * (COLS + 1) + c];
          var vTR = grid[r * (COLS + 1) + c + 1];
          var vBR = grid[(r + 1) * (COLS + 1) + c + 1];
          var vBL = grid[(r + 1) * (COLS + 1) + c];
          var v = [vTL, vTR, vBR, vBL];

          // Indice du cas : un bit par coin
          var idx =
            (vTL > T ? 1 : 0) |
            (vTR > T ? 2 : 0) |
            (vBR > T ? 4 : 0) |
            (vBL > T ? 8 : 0);

          // Générer les segments pour ce cas
          var pairs = CASES[idx];
          for (var p = 0; p < pairs.length; p++) {
            var pA = crossPt(pairs[p][0], c, r, v, T, W, H);
            var pB = crossPt(pairs[p][1], c, r, v, T, W, H);
            d.push(
              "M" +
                pA[0].toFixed(1) +
                "," +
                pA[1].toFixed(1) +
                "L" +
                pB[0].toFixed(1) +
                "," +
                pB[1].toFixed(1),
            );
          }
        }
      }

      paths[li].setAttribute("stroke", colors[li]);
      paths[li].setAttribute("d", d.length ? d.join("") : "M0,0");
    }

    t += 0.003; // très lent — les formes évoluent sur ~10 min
    requestAnimationFrame(frame);
  }

  frame();
})();
