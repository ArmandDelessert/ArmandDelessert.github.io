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
    let urlPattern = new RegExp('^(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?$');
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
