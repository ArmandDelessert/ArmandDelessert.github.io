function convertPath() {
    var path = document.getElementById('inputPath').value;
    var uri = path.replace(/\\/g, "/").replace(/^([a-zA-Z]):/, 'file:///$1:');
    document.getElementById('outputPath').value = uri;
}
