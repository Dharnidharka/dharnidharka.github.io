import { EquirectangularLoader } from './lib/loadEquirectangular.js';
// const panoFetcher = new Worker('./panoFetcher.js', { type: 'module' });

let path1, path2,
  currentIndex = 0,
  panoArray1 = [],
  panoArray2 = [],
  panoData,
  panoStarted = 0,
  loadingCount = 0,
  count = 0;

const panoLoader = new EquirectangularLoader();
panoLoader.onPanoramaLoad = onPanoramaLoad;
panoLoader.loadNextPano = loadNextPano;
panoLoader.sendNextPano = sendNextPano;
// panoLoader.setZoom(3);

self.onmessage = function (e) {
  switch (e.data.type) {
    case 'start':
      panoData = e.data.panoData;
      loadNextPano();
      // loadPanoInWorker();
      break;
    case 'newData':
      console.log("new data received");
      panoData = [...panoData, ...e.data.panoData];
      break;

    case 'fetch':
      if (count < panoData.length) {
        sendNextPano();
      }
      break;
  }
};

function onPanoramaLoad(imageBitmap) {
  panoData[loadingCount].imageBitmap = imageBitmap;
  loadingCount++;
  if (!panoStarted && loadingCount > 3) {
    panoStarted = 1;
    count = 0;
    sendNextPano();
  }
  if (loadingCount < panoData.length) {
    loadNextPano();
  }
}

function loadNextPano() {
  // if (currentIndex < panoData.length) {
  //   panoLoader.load(path1[currentIndex++]);
  // }
  const data = panoData[loadingCount];
  const panoId = data.panoId;
  panoLoader.load(panoId, { zoom: data.zoom, tiles: data.tiles, _urlConstructor: data._urlConstructor, _tileData: data._tileData, takeDownUrl: data.takeDownUrl });

}

function sendNextPano() {
  // if (count % 2 == 0) {
  //   const imageBitmap = panoArray1.pop();
  //   postMessage({ count: panoArray1.length + panoArray2.length, imageBitmap: imageBitmap }, [
  //     imageBitmap,
  //   ]);
  // } else {
  //   const imageBitmap = panoArray2.pop();
  //   postMessage({ count: panoArray1.length + panoArray2.length, imageBitmap: imageBitmap }, [
  //     imageBitmap,
  //   ]);
  // }

  const data = panoData[count];
  const panoId = data.panoId;
  const imageBitmap = data.imageBitmap;
  const info = {
    lat: data.lat,
    lng: data.lng,
    rot: data.rotation,
    index: data.index,
    heading: data.heading
  };
  // console.log(panoId, info.index);
  const dimensions = 512;
  postMessage({ info, panoId, dimensions, imageBitmap }, [imageBitmap]);
  count++;
}

// function loadPanoInWorker() {
//   panoFetcher.postMessage({
//     path2: path2,
//   });

//   panoFetcher.onmessage = panoFetcherMessageListener;

// }

// function panoFetcherMessageListener(e) {
//   panoArray2.push(e.data.imageBitmap);
// }