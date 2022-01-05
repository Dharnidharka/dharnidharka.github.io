export class PanoLoader {
  constructor(parameters) {
    this.parameters = parameters || {};
    this._zoom = 3;
    this._count = 0;
    this._total = 0;
    this.panoId = 's8zAPA8pS-foUCYQ1fM74A';
    this._canvas1 = new OffscreenCanvas(1, 1);
    this._ctx1 = this._canvas1.getContext('2d');
    this._canvas2 = new OffscreenCanvas(1, 1);
    this._ctx2 = this._canvas2.getContext('2d');
  }

  setZoom(z) {
    this._zoom = z;
    this.adaptTextureToZoom();
  }

  adaptTextureToZoom() {
    var w1 = 416 * Math.pow(2, this._zoom),
      h1 = 416 * Math.pow(2, this._zoom - 1);
    this._canvas1.width = w1;
    this._canvas1.height = h1;
    this._ctx1.translate(this._canvas1.width, 0);
    this._ctx1.scale(-1, 1);

    var w2 = 512 * Math.pow(2, this._zoom),
      h2 = 512 * Math.pow(2, this._zoom - 1);
    this._canvas2.width = w2;
    this._canvas2.height = h2;
    this._ctx2.translate(this._canvas2.width, 0);
    this._ctx2.scale(-1, 1);
  }

  load(latLng) {
    this.getPanoId(latLng);
    // this.composePanorama();
  }

  getPanoId(latLng) {
    const location = latLng;
    let panoUrl =
      'https://maps.googleapis.com/maps/api/streetview/metadata?location=' +
      location +
      '&key=AIzaSyBKLnln1EJHcjN66Qci1x3FDqFS8GiRMZ4';
    fetch(panoUrl, {
      credentials: 'omit',
      headers: { 'sec-metadata': 'destination="", site=cross-site' },
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      method: 'GET',
      mode: 'cors',
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
      })
      .then((data) => {
        console.log('60 gsvpano', data.location, data.pano_id);
        if (data.pano_id == this.panoId) {
          this.loadNextPano();
        } else {
          this.panoId = data.pano_id;
          this.composePanorama(data.pano_id);
        }
      });
  }

  composePanorama(panoId) {
    // this.setProgress(0);
    // console.log('Loading panorama for zoom ' + this._zoom + '...');
    var w = Math.pow(2, this._zoom),
      h = Math.pow(2, this._zoom - 1),
      self = this,
      url,
      x,
      y;

    this._count = 0;
    this._total = w * h;

    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        url =
          'https://maps.google.com/cbk?output=tile&panoid=' +
          panoId +
          '&zoom=' +
          self._zoom +
          '&x=' +
          x +
          '&y=' +
          y;

        (function (x, y, url) {
          fetch(url, {
            credentials: 'omit',
            headers: { 'sec-metadata': 'destination="", site=cross-site' },
            referrerPolicy: 'no-referrer-when-downgrade',
            body: null,
            method: 'GET',
            mode: 'cors',
          })
            // fetch(url)
            .then((response) => {
              // TODO
              if (response.status === '200') {
                // A-OK
              } else {
                // GOT A 400 and need to change dimensions
              }
              return response.blob();
            })
            .then((blob) => createImageBitmap(blob))
            .then(
              (image) => {
                // console.log(x, y, image);
                self.composeFromTile(x, y, image);
              },
              (err) => {
                console.error(err);
              }
            );
        })(x, y, url);
      }
    }
  }

  composeFromTile(x, y, texture) {
    this._ctx1.drawImage(texture, x * 512, y * 512);
    this._ctx2.drawImage(texture, x * 512, y * 512);
    this._count++;

    var p = Math.round((this._count * 100) / this._total);
    // this.setProgress(p);

    if (this._count === this._total) {
      // Decide if there is missing stuff... (416x416 or 512x512)
      // It is a bit hacky but gets the job done. Grab the bottom
      // left corner and check for black - if so it is too small
      var h = Math.pow(2, this._zoom - 1);
      var data = this._ctx2.getImageData(0, h * 512 - 1, 5, 1).data;

      this.canvas = this._canvas2;
      if (
        data.toString() === '0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255,0,0,0,255'
      ) {
        this.dimensions = 416;
        this._ctx2.resetTransform();
        this._ctx2.drawImage(
          this._canvas1,
          0,
          0,
          this._canvas2.width,
          this._canvas2.height
        );
      } else {
        this.dimensions = 512;
      }

      if (this._zoom > 1) {
        this.canvas = new OffscreenCanvas(
          this._canvas2.width / 2,
          this._canvas2.height / 2
        );
        var ctx = this.canvas.getContext('2d');
        ctx.drawImage(
          this._canvas2,
          0,
          0,
          this._canvas2.width,
          this._canvas2.height,
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );
      }

      if (this.onPanoramaLoad) {
        this.onPanoramaLoad(this.canvas);
      }
    }
  }
}
