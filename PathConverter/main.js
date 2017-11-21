const PathUrlParam = 'path';
const RedirectUrlParam = 'redirect';
const InputPathId = 'inputPath';
const OutputPathId = 'outputPath';

function loadPathFromURL() {
    let urlParams = new URLSearchParams(window.location.search);
    let path = urlParams.get(PathUrlParam);
    let redirect = urlParams.get(RedirectUrlParam);
    if (path) {
        document.getElementById(InputPathId).value = decodeURIComponent(path);
        convertAndSetPath();
        if (redirect === 'true') {
            redirectToConvertedPath();
        }
    }
}

function convertAndSetPath() {
    let path = document.getElementById(InputPathId).value;
    let uri = path.replace(/\\/g, "/").replace(/^([a-zA-Z]):/, 'file:///$1:');
    document.getElementById(OutputPathId).value = uri;
}

function redirectToConvertedPath() {
    window.location.href = document.getElementById(OutputPathId).value;
}
