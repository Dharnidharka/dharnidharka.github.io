export class EquirectangularLoader {
    constructor(parameters) {
        this.parameters = parameters || {};
        this.canvas = new OffscreenCanvas(512, 512);
        this.context = this.canvas.getContext('2d');
        this.maxZooms = [8192, 8192 / 2, 8192 / Math.pow(2, 2), 8192 / Math.pow(2, 3), 8192 / Math.pow(2, 4)]
    }

    getPanoTileImages(panoId, zoom, tiles, _urlConstructor, _tileData, takeDownurl) {
        if (!panoId) {
            throw new Error('must specify panorama ID')
        }

        zoom = (typeof zoom === 'number' ? zoom : 1) | 0 // integer value
        if (zoom < 0 || zoom > 5) {
            throw new Error('zoom is out of range, must be between 0 - 5 (inclusive)')
        }

        var data = null
        if (_tileData) {
            data = _tileData.getTileData(zoom, tiles)
        } else {
            data = this.getTileData(zoom, tiles)
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
                        url: this.getUrl(panoId, { x: x, y: y, zoom: zoom, takeDownurl: takeDownurl }),
                        position: [x * data.tileWidth, y * data.tileHeight]
                    })
                }
            }
        }
        data.images = images
        return data
    }

    getTileData(zoom, data) {

        var widths = [416, 832, 1664, 3328, 6656, 13312]
        var heights = [416, 416, 832, 1664, 3328, 6656]
        var levelsW = [1, 2, 4, 7, 13, 26]
        var levelsH = [1, 1, 2, 4, 7, 13]

        if (typeof zoom !== 'number') {
            throw new Error('must provide zoom')
        }

        var width, height, cols, rows, squareW, squareH
        if (data) {
            var maxZoom = this.getMaxZoom(data.worldSize.width);
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

        return {
            columns: cols,
            rows: rows,
            tileWidth: squareW,
            tileHeight: squareH,
            width: width,
            height: height
        }
    }

    getMaxZoom(width) {
        for (var i = 0; i < 4; i++) {
            if (width > this.maxZooms[i])
                return 5 - i;
        }
        return 1;
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    getUrl(panoId, opt) {
        opt = opt || {}
        var x = opt.x || 0
        var y = opt.y || 0
        var zoom = opt.zoom || 0
        // alternative:
        //return 'https://www.google.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panoId + '&output=tile&zoom=' + zoom + '&x=' + x + '&y=' + y + '&' + Date.now()    
        if (panoId.indexOf('F:') == 0) {
            panoId = panoId.substring(2);
            var server = Math.floor(this.getRandomArbitrary(3, 6));
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
            var server = Math.floor(this.getRandomArbitrary(1, 4));
            return 'https://geo' + server + '.ggpht.com/cbk?cb_client=maps_sv.tactile&authuser=0&hl=en&panoid=' + panoId + '&output=tile&x=' + x + '&y=' + y + '&zoom=' + zoom + '&nbt&fover=2'
        }
    }

    loadImage(url) {
        return fetch(url, { method: 'GET' })
            .then(res => res.blob())
            .then(blob => createImageBitmap(blob))
            .catch(err => false)
    }

    loadImages(imageItems) {
        const promises = imageItems.map(async imageItem => {
            const { url, position } = imageItem
            const image = await this.loadImage(url)
            return { image, position }
        })
        return Promise.all(promises)
    }

    drawImagesOntoCanvas(loadedImages, width, height) {
        this.canvas.width = width
        this.canvas.height = height
        this.context.clearRect(0, 0, width, height)
        loadedImages.forEach(loadedImages => {
            const { image, position } = loadedImages
            this.context.drawImage(image, position[0] || 0, position[1] || 0)
        })
    }

    async loadEquirectangular(panoId, opt = {}) {
        const { zoom, tiles, _urlConstructor, _tileData, takeDownUrl } = opt
        const data = this.getPanoTileImages(panoId, zoom, tiles, _urlConstructor, _tileData, takeDownUrl)
        const { images, width, height } = data
        const loadedImages = await this.loadImages(images)
        this.drawImagesOntoCanvas(loadedImages, width, height)
        return this.canvas.transferToImageBitmap()
    }

    load(panoId, opt = {}) {
        this.loadEquirectangular(panoId, opt).then((imageBitmap) => {
            this.onPanoramaLoad(imageBitmap);
        });
    }



}