import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

export function init(data) {
  const { canvas, inputElement } = data;
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setClearColor(0xffffff, 1.0);

  let cube;
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

  const geometry = new THREE.SphereBufferGeometry(50, 32, 32);
  geometry.scale(-1, 1, 1);

  var loader = new THREE.ImageBitmapLoader().setPath('../');
  loader.setOptions({ imageOrientation: 'flipY' });
  loader.load('textures/test spherical 4096_2048px.jpg', function (
    imageBitmap
  ) {
    var texture = new THREE.CanvasTexture(imageBitmap);
    var material = new THREE.MeshBasicMaterial({ map: texture });

    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    cube.position.x = x;
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

    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = inputElement.width / inputElement.height;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
