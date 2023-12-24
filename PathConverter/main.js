function loadPathFromURL() {
    var urlParams = new URLSearchParams(window.location.search);
    var path = urlParams.get('path');
    var redirect = urlParams.get('redirect');
    if (path) {
        document.getElementById('inputPath').value = decodeURIComponent(path);
        convertPath();
        if (redirect === 'true') {
            window.location.href = document.getElementById('outputPath').value;
        }
    }
}

function convertPath() {
    var path = document.getElementById('inputPath').value;
    var uri = path.replace(/\\/g, "/").replace(/^([a-zA-Z]):/, 'file:///$1:');
    document.getElementById('outputPath').value = uri;
}
