import { PanoLoader } from './GSVPano.js';

const panoLoader = new PanoLoader();
panoLoader.onPanoramaLoad = onPanoramaLoad;
panoLoader.loadNextPano = loadNextPano;
panoLoader.sendNextPano = sendNextPano;
panoLoader.setZoom(3);
let path2,
    currentIndex = 0;

self.onmessage = function (e) {
    path2 = e.data.path2;
    loadNextPano();
};

function onPanoramaLoad() {
    const imageBitmap = this.canvas.transferToImageBitmap();
    sendNextPano(imageBitmap);
    loadNextPano();
}


function loadNextPano() {
    if (currentIndex < path2.length) {
        panoLoader.load(path2[currentIndex++]);
    }
}

function sendNextPano(imageBitmap) {
    postMessage({ imageBitmap: imageBitmap }, [
        imageBitmap,
    ]);
}
