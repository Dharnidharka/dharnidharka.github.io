import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';
const panoWorker = new Worker('./panoWorker.js', { type: 'module' });

export function init(data) {
  const { canvas, inputElement, panoData, depthMap } = data;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });

  renderer.autoClear = false;
  renderer.setClearColor(0xffffff, 1.0);
  const width = inputElement.width;
  const height = inputElement.height;
  // renderer.setSize(width, height);
  let camera, cameraRig, controls, scene;
  let mesh1, mesh2, currentMesh, sphere, stats;
  let vertexShader, fragmentShader;
  let currentIndex = 0;
  const perf = false;
  let timer1, timer2, timer3, timer4, timer5;
  let playing = false;
  let count = 0;
  const clock = new THREE.Clock();
  let delta;
  let defaultDepthmap;
  timer1 = Date.now();
  const wireframe = false;
  const defaultSpeed = 17;
  let velocity;
  let panoAvailable = 0;
  let panoCount = 0;
  let texture, nextTexture;
  let nextRotation = 1;
  const blend = 700;

  // Sphere setup
  const sphereRadius = 4;
  const verticalSphereSegments = 256;
  const horizontalSphereSegments = 256;

  var zoom = 3;
  var movementSpeed = 60;
  var startPercentage;
  var displacement = 250;
  const alphaBlend = 0.50;
  var ringBufferFullFlag = 0;
  var panoramas = {};
  var targetBlend = 0.74;
  var targetBlendSign = 1;

  var startingSphere = 0,
    currentSphere;
  var sphereAfterLoad = 0;
  var progress = 0;
  var dataBuffer = [],
    bufferCount = 0;

  var initialPanoLoaded = false;

  var bufferSize = 100;
  // var ringBuffer = new RingBuffer(bufferSize);

  var startedFlag = false;

  var numPanos;

  // let path1 = [], path2 = [], temp = [path1, path2];

  // path.forEach((v, i) => temp[i % 2].push(v));

  initShader();
  initScene();
  initListeners();

  initDefaultDepthMap(depthMap);

  inputElement.addEventListener('mousemove', onMouseMove);
  inputElement.addEventListener('keydown', onMouseDown);

  function initScene() {
    panoWorker.postMessage({
      type: 'start',
      panoData: panoData,
    });

    // console.log('85', navigator.xr);
    // console.log(navigator.xr.isSessionSupported('immersive-vr'));

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 20000);
    cameraRig = new THREE.Object3D();
    cameraRig.position.set(1.0210885819436255, -0.0312, 0.10467270074265482);
    camera.position.copy(cameraRig.position);
    controls = new OrbitControls(camera, inputElement);
    controls.target.set(0, 0, 0);
    controls.update();
    scene.add(cameraRig);

    const light = new THREE.AmbientLight(0xffffff); // soft white light
    scene.add(light);

    // window.camera = camera;

    // Make main geo
    var geo = new THREE.SphereBufferGeometry(
      sphereRadius,
      horizontalSphereSegments,
      verticalSphereSegments
    );
    var mat1 = createMaterial();
    mesh1 = new THREE.Mesh(geo, mat1);
    mesh1.scale.multiplyScalar(0.01);
    mesh1.frustumCulled = false;
    mesh1.rotation.x = Math.PI;
    // mesh1.visible = false;
    // mesh1.position.y = 200;
    scene.add(mesh1);

    var mat2 = createMaterial();
    mesh2 = new THREE.Mesh(geo, mat2);
    mesh2.scale.multiplyScalar(0.01);
    mesh2.frustumCulled = false;
    mesh2.rotation.x = Math.PI;
    // mesh2.position.y = 200;
    // mesh2.visible = false;
    scene.add(mesh2);
  }

  function initShader() {
    vertexShader = /*glsl*/ `
    uniform sampler2D displace;	
    uniform float displacement;		
    varying vec2 vUv;

    void main() {
        // Pass uv to fragment
        vUv = uv;

        // float df = 15.0;
        float df = 40.0 * texture2D(displace, uv).r;

        vec4 displacedPosition = vec4(normal * df, 0.0) + vec4(position, 1.0) / displacement;

        // Clear out ripples at base center
        // displacedPosition.y = max(-0.5, displacedPosition.y);
        displacedPosition.y = displacedPosition.y - 1.00;

        gl_Position = projectionMatrix * modelViewMatrix * displacedPosition;
    }
  `;

    fragmentShader = /*glsl*/ `
    uniform sampler2D textureMap;
    uniform sampler2D textureMap2;
    uniform float nextBlend;

    varying vec2 vUv;

    const float saturation = 1.2;
    const float brightness = 0.0;
    const float contrast = 1.2;

    mat4 brightnessMatrix( float brightness )
    {
        return mat4( 1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    brightness, brightness, brightness, 1 );
    }

    mat4 contrastMatrix( float contrast )
    {
        float t = ( 1.0 - contrast ) / 2.0;

        return mat4( contrast, 0, 0, 0,
                    0, contrast, 0, 0,
                    0, 0, contrast, 0,
                    t, t, t, 1 );

    }

    mat4 saturationMatrix( float saturation )
    {
        vec3 luminance = vec3( 0.3086, 0.6094, 0.0820 );
        float oneMinusSat = 1.0 - saturation;

        vec3 red = vec3( luminance.x * oneMinusSat );
        red+= vec3( saturation, 0, 0 );

        vec3 green = vec3( luminance.y * oneMinusSat );
        green += vec3( 0, saturation, 0 );

        vec3 blue = vec3( luminance.z * oneMinusSat );
        blue += vec3( 0, 0, saturation );

        return mat4( red,     0,
                    green,   0,
                    blue,    0,
                    0, 0, 0, 1 );
    }


    void main() {

      vec4 color = vec4(texture2D(textureMap, vUv).rgb, nextBlend);
      // vec3 colorA = texture2D(textureMap, vUv).rgb;
      // vec3 colorB = texture2D(textureMap2, vUv).rgb;
      // vec3 colorB = vec3(1.0, 0.58, 0.86);
  
      // vec4 color = vec4(mix(colorA, colorB, nextBlend), 1.0);
      // gl_FragColor = color;
      gl_FragColor = brightnessMatrix( brightness ) * contrastMatrix( contrast ) * saturationMatrix( saturation ) * color;

    }
  `;
  }

  function initListeners() {
    panoWorker.onmessage = panoWorkerMessageListener;
  }

  function panoWorkerMessageListener(e) {

    timer4 = Date.now();
    if (perf)
      console.log(
        `panoWorker onMessage Start Loop Execution time: ${timer4 - timer1} ms`
      );

    nextRotation = -e.data.info.rot + e.data.info.heading + Math.PI;

    if (!playing) {
      if (count == 0) {
        var texture = new THREE.CanvasTexture(e.data.imageBitmap);
        mesh1.material.uniforms.displace.value = defaultDepthmap;
        mesh1.material.uniforms.textureMap.value = texture;
        mesh1.material.uniforms.nextBlend.value = 1.0;
        mesh1.material.needsUpdate = true;
        // mesh1.position.x = -8;
        mesh1.rotation.y = nextRotation;
        mesh2.material.uniforms.displace.value = defaultDepthmap;
        mesh2.material.uniforms.nextBlend.value = 0.0;
        mesh2.position.x = -16;
        mesh2.material.needsUpdate = true;
      } else {
        nextTexture = new THREE.CanvasTexture(e.data.imageBitmap);
        // mesh2.rotation.set(0, nextRotation, 0);
        mesh2.rotation.y = nextRotation;
        mesh2.material.uniforms.textureMap.value = nextTexture;
        mesh2.material.needsUpdate = true;
        playing = true;
      }
      count++;
    } else {
      nextTexture = new THREE.CanvasTexture(e.data.imageBitmap);
      // mesh2.rotation.set(0, nextRotation, 0);
      mesh2.rotation.y = nextRotation;

      mesh2.material.uniforms.textureMap.value = nextTexture;
      mesh2.material.needsUpdate = true;
      count++;
      panoAvailable = 1;
    }

    if (!panoAvailable) {
      panoWorker.postMessage({
        type: 'fetch',
      });
    }

    timer5 = Date.now();
    if (perf)
      console.log(
        `panoWorker onMessage End Loop Execution time: ${timer5 - timer1} ms`
      );
  }

  animate(0);

  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = inputElement.width / inputElement.height;
    camera.updateProjectionMatrix();
  }

  async function initDefaultDepthMap() {
    const response = await fetch(depthMap);
    const fileBlob = await response.blob();
    let imageBitmap = await createImageBitmap(fileBlob);

    const texture = new THREE.CanvasTexture(imageBitmap);
    texture.minFilter = THREE.LinearFilter;
    defaultDepthmap = texture;
  }

  function onMouseMove() {
    if (playing === false) {
      render();
    }
  }

  function onMouseDown() {
    playing = !playing;
  }

  function loadNextPano() {
    if (panoAvailable) {
      texture = nextTexture;
      mesh1.rotation.y = nextRotation;
      mesh1.material.uniforms.textureMap.value = texture;

      mesh1.material.uniforms.nextBlend.value = 1;
      mesh2.material.uniforms.nextBlend.value = 0;
      // mesh2.visible = false;

      // mesh1.material.depthTest = true;
      // mesh2.material.depthTest = true;
      // mesh1.material.transparent = false;
      // mesh2.material.transparent = false;

      mesh1.material.needsUpdate = true;
      mesh2.material.needsUpdate = true;
      mesh1.position.x = -8;
      mesh2.position.x = -24;
      panoAvailable = 0;
      playing = true;
      panoWorker.postMessage({
        type: 'fetch',
      });
    } else {
      playing = false;
      mesh1.material.uniforms.nextBlend.value = 1;
      mesh2.material.uniforms.nextBlend.value = 0;
    }
  }

  function createMaterial() {
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        textureMap: {
          type: 't',
          value: undefined,
        },
        displace: {
          type: 't',
          value: undefined,
        },
        nextBlend: {
          type: 'f',
          value: 0,
        },
        displacement: {
          type: 'f',
          value: 250.0,
        },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.DoubleSide,
      wireframe: wireframe,
      blending: THREE.NormalBlending,
      depthTest: true,
      transparent: false,
    });
    mat.needsUpdate = true;
    return mat;
  }

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = 2048; // inputElement.width;
    const height = 1024; // inputElement.height;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function update(delta) {
    mesh1.position.x += .12;
    mesh2.position.x += .12;

    let sphereProgress = (mesh1.position.x + 8) / 16;

    if (sphereProgress > 1 - alphaBlend) {

      mesh1.material.uniforms.nextBlend.value = (1 - sphereProgress) * (1 / alphaBlend);
      mesh2.material.uniforms.nextBlend.value = 1 - ((1 - sphereProgress) * (1 / alphaBlend));
      mesh2.visible = true;

      mesh1.material.depthTest = false;
      mesh2.material.depthTest = false;
      // mesh1.material.depthWrite = false;
      // mesh2.material.depthWrite = false;
      mesh1.material.transparent = true;
      // mesh2.material.transparent = true;
    } else {
      mesh1.material.uniforms.nextBlend.value = 1;
      mesh2.material.uniforms.nextBlend.value = 0;
      mesh2.visible = false;

      mesh1.material.depthTest = true;
      mesh2.material.depthTest = true;
      // mesh1.material.depthWrite = true;
      // mesh2.material.depthWrite = true;
      mesh1.material.transparent = false;
      mesh2.material.transparent = false;
    }

    if (mesh1.position.x >= 8) {
      loadNextPano();
    }
    
  }

  function render() {
    // console.log(camera.position);
    if (playing) {
      delta = clock.getDelta();
      update(delta);
    }
    controls.update();
    renderer.render(scene, camera);
  }

  function animate() {
    requestAnimationFrame(animate);
    render();
  }

  render();
}

export function newPanoData(data) {
  panoWorker.postMessage({
    type: 'newData',
    panoData: data,
  });
}