const PathUrlParam = 'path';
const RedirectUrlParam = 'redirect';
const InputUrlId = 'inputUrl';
const OutputUrlId = 'outputUrl';

let urlHashTable = {};

function loadPathFromURL() {
    let urlParams = new URLSearchParams(window.location.search);
    let path = urlParams.get(PathUrlParam);
    let redirect = urlParams.get(RedirectUrlParam);
    if (path) {
        document.getElementById(InputUrlId).value = decodeURIComponent(path);
        generateShortUrl();
        if (redirect === 'true') {
            redirectToShortUrl();
        }
    }
}

function redirectToShortUrl() {
    let shortUrl = document.getElementById(OutputUrlId).value;
    if (shortUrl) {
        window.location.href = shortUrl;
    }
}

function generateShortUrl() {
    let url = document.getElementById(InputUrlId).value;
    if (isValidUrl(url)) {
        let hash = hashCode(url);
        addUrlToHashTable(url, hash);
        let shortUrl = 'http://example.com/' + hash;
        document.getElementById(OutputUrlId).value = shortUrl;
    } else {
        alert('Veuillez entrer une URL valide.');
    }
}

function isValidUrl(url) {
    return true; // DEBUG

    let urlPattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '(((a-z\\d*)\\.)+[a-z]{2,}|'+ // domain name and extension
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?'+ // port
        '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
        '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!urlPattern.test(url);
}

function hashCode(s) {
    return s.split('').reduce(function(a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
}

function addUrlToHashTable(url, hash) {
    let date = new Date();
    urlHashTable[hash] = {url: url, date: date};
}

function copyToClipboard() {
    let outputUrlElement = document.getElementById('outputUrl');
    outputUrlElement.select();
    document.execCommand('copy');
}
