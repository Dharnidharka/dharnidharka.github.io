const canvas = new OffscreenCanvas(512, 512)
const context = canvas.getContext('2d')

//////////////////////////////////////////////////////////////////////
/* image-tiles.js  */
function getPanoTileImages(panoId, zoom, tiles, _urlConstructor, _tileData, takeDownurl) {
    if (!panoId) {
        throw new Error('must specify panorama ID')
    }

    zoom = (typeof zoom === 'number' ? zoom : 1) | 0 // integer value
    if (zoom < 0 || zoom > 5) {
        throw new Error('zoom is out of range, must be between 0 - 5 (inclusive)')
    }

    console.log('16', tiles);

    var data = null
    if (_tileData) {
        data = _tileData.getTileData(zoom, tiles)
    } else {
        data = getTileData(zoom, tiles)
    }
    var images = []
    if (_urlConstructor) {
        for (var y = 0; y < data.rows; y++) {
            for (var x = 0; x < data.columns; x++) {
                images.push({
                    url: _urlConstructor.getUrl(panoId, { x: x, y: y, zoom: zoom }),
                    position: [x * data.tileWidth, y * data.tileHeight]
                })
            }
        }
    } else {
        for (var y = 0; y < data.rows; y++) {
            for (var x = 0; x < data.columns; x++) {
                images.push({
                    url: getUrl(panoId, { x: x, y: y, zoom: zoom, takeDownurl: takeDownurl }),
                    position: [x * data.tileWidth, y * data.tileHeight]
                })
            }
        }
    }
    data.images = images
    return data
}

//////////////////////////////////////////////////////////////////////
/* google-panorama-tiles */
var widths = [416, 832, 1664, 3328, 6656, 13312]
var heights = [416, 416, 832, 1664, 3328, 6656]
var levelsW = [1, 2, 4, 7, 13, 26]
var levelsH = [1, 1, 2, 4, 7, 13]


function getTileData(zoom, data) {
    if (typeof zoom !== 'number') {
        throw new Error('must provide zoom')
    }

    var width, height, cols, rows, squareW, squareH
    if (data) {
        console.log('61', data);
        var maxZoom = getMaxZoom(data.worldSize.width);
        // if meta info is specified, we will compute the exact tile sizes
        // works with StreetView and PhotoSphere
        //var ratio = data.worldSize.width / data.tileSize.width
        //var nearestZoom = Math.floor(Math.log(ratio) / Math.log(2))
        //width = Math.floor(data.worldSize.width * Math.pow(2, zoom - 1) / Math.pow(2, nearestZoom))
        //height = Math.floor(data.worldSize.height * Math.pow(2, zoom - 1) / Math.pow(2, nearestZoom))
        width = data.worldSize.width / Math.pow(2, (maxZoom - zoom));
        height = data.worldSize.height / Math.pow(2, (maxZoom - zoom));
        cols = Math.max(1, Math.ceil(width / data.tileSize.width))
        rows = Math.max(1, Math.ceil(height / data.tileSize.height))
        squareW = data.tileSize.width
        squareH = data.tileSize.height
    } else {
        // otherwise, we approximate them assuming the result is
        // a regular StreetView panorama
        width = widths[zoom]
        height = heights[zoom]
        cols = levelsW[zoom]
        rows = levelsH[zoom]
        squareW = 512
        squareH = 512
    }

    console.log('85', width, height);

    return {
        columns: cols,
        rows: rows,
        tileWidth: squareW,
        tileHeight: squareH,
        width: width,
        height: height
    }
}
var maxZooms = [8192, 8192 / 2, 8192 / Math.pow(2, 2), 8192 / Math.pow(2, 3), 8192 / Math.pow(2, 4)]
function getMaxZoom(width) {
    for (var i = 0; i < 4; i++) {
        if (width > maxZooms[i])
            return 5 - i;
    }
    return 1;
}
/////////////////////////////////////////////////////////
/* google-panorama-url */
//http://lh3.ggpht.com/-A251mWHqbno/ViBeisgIUEI/AAAAAAAAOXE/9_Orsl1sdfsogz2jUe6DIpNUiTOw8c0Xg/x7-y2-z3/p
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
function getUrl(panoId, opt) {
    opt = opt || {}
    var x = opt.x || 0
    var y = opt.y || 0
    var zoom = opt.zoom || 0
    // alternative:
    //return 'https://www.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panoId + '&output=tile&zoom=' + zoom + '&x=' + x + '&y=' + y + '&' + Date.now()    
    if (panoId.indexOf('F:') == 0) {
        panoId = panoId.substring(2);
        var server = Math.floor(getRandomArbitrary(3, 6));
        return 'https://lh' + server + '.ggpht.com/' + panoId + '/x' + x + '-y' + y + '-z' + zoom + '/p';
    }
    //"https://www.google.com/cbk?cb_client=apiv3&output=report&image_key=!1e10!2sAF1QipMX2u0uBTVMOsCuQSTHXe6mWJcR3viU2PMIPw9b"
    else if (panoId.length == 64) {
        if (opt.takeDownurl) {
            var imageKey = opt.takeDownurl.substr(opt.takeDownurl.indexOf("image_key=!1e10!2s") + "image_key=!1e10!2s".length);
        }
        return "https://lh3.ggpht.com/p/" + imageKey + "=x" + x + "-y" + y + "-z" + zoom;
    }
    else {
        var server = Math.floor(getRandomArbitrary(1, 4));
        return 'https://geo' + server + '.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panoId + '&output=tile&x=' + x + '&y=' + y + '&zoom=' + zoom + '&nbt&fover=2'
    }
}

function loadImage(url) {
    return fetch(url, { method: 'GET' })
        .then(res => res.blob())
        .then(blob => createImageBitmap(blob))
        .catch(err => false)
}

function loadImages(imageItems) {
    const promises = imageItems.map(async imageItem => {
        const { url, position } = imageItem
        const image = await loadImage(url)
        return { image, position }
    })
    return Promise.all(promises)
}

function drawImagesOntoCanvas(loadedImages, width, height) {
    canvas.width = width
    canvas.height = height
    context.clearRect(0, 0, width, height)
    loadedImages.forEach(loadedImages => {
        const { image, position } = loadedImages
        context.drawImage(image, position[0] || 0, position[1] || 0)
    })
}

async function loadEquirectangular(panoId, opt = {}) {
    const { zoom, tiles, _urlConstructor, _tileData, takeDownUrl } = opt
    // console.log(zoom, tile)
    const data = getPanoTileImages(panoId, zoom, tiles, _urlConstructor, _tileData, takeDownUrl)
    console.log('162', data)
    const { images, width, height } = data
    const loadedImages = await loadImages(images)
    drawImagesOntoCanvas(loadedImages, width, height)
    return canvas.transferToImageBitmap()
}
