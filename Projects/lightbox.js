// Lightbox pour les figures des pages de projet
(function () {
    // Créer l'overlay avec styles inline (robustesse face au cache CSS)
    var overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.style.cssText = 'display:none;position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.88);align-items:center;justify-content:center;padding:1.5rem;cursor:zoom-out;';

    var img = document.createElement('img');
    img.setAttribute('alt', '');
    img.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;border-radius:4px;cursor:default;box-shadow:0 8px 40px rgba(0,0,0,0.6);';
    overlay.appendChild(img);
    document.body.appendChild(overlay);

    // Rendre chaque image de figure cliquable
    document.querySelectorAll('.project-figure img').forEach(function (source) {
        source.classList.add('lightbox-trigger');
        source.style.cursor = 'zoom-in';
        source.addEventListener('click', function () {
            img.src = source.src;
            img.alt = source.alt;
            overlay.style.display = 'flex';
        });
    });

    // Fermer sur clic de l'overlay (mais pas sur l'image elle-même)
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.style.display = 'none';
    });

    // Fermer avec Échap
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') overlay.style.display = 'none';
    });
})();
