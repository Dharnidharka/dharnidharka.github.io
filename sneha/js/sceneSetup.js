var cube_count,
  meshes = [],
  materials = [],
  xgrid = 20,
  ygrid = 10;

var texture, material, mesh, finalMesh;

function addScene() {

  // create a scene, that will hold all our elements such as objects, cameras and lights.
  scene = new THREE.Scene();
  // scene.background = new THREE.Color(0x092241);

}

function addCamera() {

  // create a camera, which defines where we're looking at.
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 2000);

  // position and point the camera to the center of the scene
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 400;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

}

function addLights() {

  var directionalLight = new THREE.DirectionalLight();
  directionalLight.position.set(-30, 50, 50);
  scene.add(directionalLight);

}

function addRenderer() {

  // create a render, sets the background color and the size
  renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setClearColor(0x000000, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // add the output of the renderer to the html element
  document.body.appendChild(renderer.domElement);

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );

}

function createPointCloud() {

  var tLoader = new THREE.TextureLoader();
  texture = tLoader.load( 'assets/sneha.png' );
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  texture2 = tLoader.load( 'assets/sneha2.png' );
  texture2.minFilter = THREE.LinearFilter;
  texture2.magFilter = THREE.LinearFilter;
  texture2.format = THREE.RGBFormat;

  texture3 = tLoader.load( 'assets/sneha3.png' );
  texture3.minFilter = THREE.LinearFilter;
  texture3.magFilter = THREE.LinearFilter;
  texture3.format = THREE.RGBFormat;

  var i, j, ux, uy, ox, oy,
    geometry,
    xsize, ysize;

  ux = 1 / xgrid;
  uy = 1 / ygrid;

  xsize = (200) / xgrid;
  ysize = (200) / ygrid;

  var parameters = { color: 0xffffff, map: texture };

  cube_count = 0;

  for ( i = 0; i < xgrid; i ++ )
  for ( j = 0; j < ygrid; j ++ ) {

    ox = i;
    oy = j;

    geometry = new THREE.BoxGeometry( xsize, ysize, xsize );

    change_uvs( geometry, ux, uy, ox, oy );

    materials[ cube_count ] = new THREE.MeshLambertMaterial( parameters );

    material = materials[ cube_count ];

    material.hue = i/xgrid;
    material.saturation = 1 - j/ygrid;

    // material.color.setHSL( material.hue, material.saturation, 0.5 );

    mesh = new THREE.Mesh( geometry, material );

    mesh.position.x =   ( i - xgrid/2 ) * xsize;
    mesh.position.y =   ( j - ygrid/2 ) * ysize;
    mesh.position.z = 0;

    // finalMeshPositions[i][j] = {};
    // finalMeshPositions[i][j].x =   ( i - xgrid/2 ) * xsize;
    // finalMeshPositions[i][j].y =   ( j - ygrid/2 ) * ysize;

    // setTimeout(function() {
    //   mesh.position.x =   ( i - xgrid/2 ) * xsize;
    //   mesh.position.y =   ( j - ygrid/2 ) * ysize;
    //   mesh.position.z = 0;
    // }, 3000);

    mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.01;

    scene.add( mesh );

    meshes[ cube_count ] = mesh;

    cube_count += 1;
  }


}

function change_uvs( geometry, unitx, unity, offsetx, offsety ) {

  var faceVertexUvs = geometry.faceVertexUvs[ 0 ];

  for ( var i = 0; i < faceVertexUvs.length; i ++ ) {

    var uvs = faceVertexUvs[ i ];

    for ( var j = 0; j < uvs.length; j ++ ) {

      var uv = uvs[ j ];

      uv.x = ( uv.x + offsetx ) * unitx;
      uv.y = ( uv.y + offsety ) * unity;

    }

  }

}
