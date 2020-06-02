var container;
var renderer;
var controls;
var startIndex = 0, currentIndex = 0;

// init scene and camera
var scene = new THREE.Scene();
var camera = new THREE.Camera();
var mesh, model;

var arToolkitSource;
var arToolkitContext;

init();
animate();

function init() {

    setupArToolkit();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera.position.z = 10;
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    
    container.appendChild( renderer.domElement );

    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.update();

    renderer.setSize(640, 480);

    arToolkitSource.init(function onReady() {
        setTimeout(() => {
            onResize()
        }, 2000);
    });

    // initialize it
    arToolkitContext.init(function onCompleted() {
        // copy projection matrix to camera
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    })

    // add a torus knot
    var geometry = new THREE.CubeGeometry(1, 1, 1);
    var material = new THREE.MeshNormalMaterial({
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = 0;
    mesh.scale.multiplyScalar(0.2);
    scene.add(mesh);

    // handle resize
    window.addEventListener('resize', function () {
        onResize()
    })

    loadModel();

    setupTouchEvents();

}

function setupArToolkit() {

    arToolkitSource = new THREEx.ArToolkitSource({
        // to read from the webcam
        sourceType: 'webcam',
    });
    
    
    // create atToolkitContext
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: THREEx.ArToolkitContext.baseURL + 'data/camera_para.dat',
        detectionMode: 'mono',
    })

}

function setupTouchEvents() {

    var zt = new ZingTouch.Region(document.body);
    var panGesture = new ZingTouch.Pan({ numInputs: 1 });
    var pinchGesture = new ZingTouch.Distance();

    zt.bind(container, panGesture, function (e) {
    adjustModelPan(e.detail.data[0].change)
    }, false);

    zt.bind(container, pinchGesture, function (e) {
    adjustModelZoom(e.detail.change)
    }, false);

}

const adjustModelPan = (pos) => {

    model.position.x += (pos.x * 0.01);
    model.position.y -= (pos.y * 0.01);

}

const adjustModelZoom = (change) => {

    model.scale.x += change * 0.01;
    model.scale.y += change * 0.01;
    model.scale.z += change * 0.01;

}

function loadModel() {

    loader = new THREE.GLTFLoader();

    var dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath('libs/draco/');
    loader.setDRACOLoader(dracoLoader);

    loader.load('./assets/PLAYBOY_uncompressed_draco.glb', function (data) {

        gltf = data;

        model = gltf.scene;

        model.traverse(function (node) {

            if (node.isMesh || node.isLight) {
                node.castShadow = true;
                node.visible = false;
            }

        });

        model.scale.multiplyScalar(0.02);
        model.position.y = -2;
        model.children[0].visible = true;
        scene.add(model);

    }, undefined, function (error) {
        console.error(error);
    });

}

function onResize() {
    arToolkitSource.onResizeElement()
    arToolkitSource.copyElementSizeTo(renderer.domElement)
    if (arToolkitContext.arController !== null) {
        arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)
    }
}

function getName(index) {

    var name = "Frame_0";
    if (index < 10) name += "00" + index;
    else if (index < 100) name += "0" + index;
    else name += index;

    return name;

}

function render() {
    renderer.render(scene, camera);
}

function animate() {

    setTimeout(function () {
        requestAnimationFrame(animate);
    }, 1000 / 45);
    
    // controls.update();

    if (model) {

        scene.getObjectByName(getName(currentIndex)).visible = false;
        currentIndex++;
        if (currentIndex == 601) currentIndex = 0;
        scene.getObjectByName(getName(currentIndex)).visible = true;

    }

    render();
}