import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

export function init(data) {
  const { canvas, inputElement } = data;
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setClearColor(0xffffff, 1.0);

  let cube, skyBox;
  const fov = 75;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 4;

  const controls = new OrbitControls(camera, inputElement);
  controls.target.set(0, 0, 0);
  controls.update();

  const scene = new THREE.Scene();

  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }

  // const geometry = new THREE.SphereBufferGeometry(50, 32, 32);
  // geometry.scale(-1, 1, 1);

  var materials = [];

  var textures = [];

  for (var i = 0; i < 6; i++) {
    textures[i] = new THREE.Texture();
  }

  var loader = new THREE.ImageBitmapLoader().setPath('../');
  // loader.setOptions({ imageOrientation: 'flipY' });
  loader.load('textures/testcube.jpg', function (imageBitmap) {
    var canvas, context;
    var tileWidth = imageBitmap.height;

    for (var i = 0; i < textures.length; i++) {
      canvas = new OffscreenCanvas(1, 1);
      console.log(i, canvas);
      context = canvas.getContext('2d');
      canvas.height = tileWidth;
      canvas.width = tileWidth;
      context.drawImage(
        imageBitmap,
        tileWidth * i,
        0,
        tileWidth,
        tileWidth,
        0,
        0,
        tileWidth,
        tileWidth
      );
      textures[i].image = canvas;
      textures[i].needsUpdate = true;
    }

    for (var i = 0; i < 6; i++) {
      materials.push(new THREE.MeshBasicMaterial({ map: textures[i] }));
    }

    skyBox = new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), materials);
    skyBox.geometry.scale(-1, 1, 1);
    scene.add(skyBox);
  });

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = inputElement.width;
    const height = inputElement.height;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;
    // skyBox.rotation.z += time;

    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = inputElement.width / inputElement.height;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
