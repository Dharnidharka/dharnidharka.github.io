function createFirstGeometryArray() {

  // var geomMinX = 10, geomMaxX = -10;
  // var geomMinY = 10, geomMaxY = -10;
  // var geomMinZ = 10, geomMaxZ = -10;

  geom.vertices.forEach(function(v) {
    geomArrayX.push(v.x);
    geomArrayY.push(v.y);
    geomArrayZ.push(v.z);

    geom1ArrayX.push(v.x);
    geom1ArrayY.push(v.y);
    geom1ArrayZ.push(v.z);

    // if(v.x < geomMinX) geomMinX = v.x;
    // if(v.y < geomMinY) geomMinY = v.y;
    // if(v.z < geomMinZ) geomMinZ = v.z;
    //
    // if(v.x > geomMaxX) geomMaxX = v.x;
    // if(v.y > geomMaxY) geomMaxY = v.y;
    // if(v.z > geomMaxZ) geomMaxZ = v.z;

  });

  geom1ArrayX.onUpdate = function() {
    var count = 0;
    rotationFlag = 0;
    geom.vertices.forEach(function(v) {
      v.x = geomArrayX[count];
      count++;
    });
    count++;
    geom.verticesNeedUpdate = true;
  };﻿

  geom1ArrayY.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.y = geomArrayY[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

  geom1ArrayZ.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.z = geomArrayZ[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

  geom1ArrayX.onComplete = function() {

    rotationFlag = 1;
    t1.restart();

  }

}

function createSecondGeometryArray() {

  var geom2 = new THREE.ParametricGeometry(paramFunction4, 65, 65);

  var count = 0;

  geom2.vertices.forEach(function(v) {
    if(count < geom.vertices.length) {
      geom2ArrayX.push(v.x);
      geom2ArrayY.push(v.y);
      geom2ArrayZ.push(v.z);
      count++;

    }

  });

  geom2ArrayX.onUpdate = function() {
    var count = 0;
    rotationFlag = 0;
    geom.vertices.forEach(function(v) {
      v.x = geomArrayX[count];
      count++;
    });
    count++;
    geom.verticesNeedUpdate = true;
  };﻿

  geom2ArrayY.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.y = geomArrayY[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

  geom2ArrayZ.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.z = geomArrayZ[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

  geom2ArrayX.onComplete = function() {

    rotationFlag = 1;

  }

}

function createThirdGeometryArray() {

  var geom3 = new THREE.ParametricGeometry(paramFunction3, 65, 65);

  var count = 0;

  console.log('124');
  console.log(geom3.vertices.length);

  geom3.vertices.forEach(function(v) {
    if(count < geom.vertices.length) {
      geom3ArrayX.push(v.x);
      geom3ArrayY.push(v.y);
      geom3ArrayZ.push(v.z);
      count++;

    }

  });

  geom3ArrayX.onUpdate = function() {
    var count = 0;
    rotationFlag = 0;
    geom.vertices.forEach(function(v) {
      v.x = geomArrayX[count];
      count++;
    });
    count++;
    geom.verticesNeedUpdate = true;
  };﻿

  geom3ArrayY.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.y = geomArrayY[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

  geom3ArrayZ.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.z = geomArrayZ[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

  geom3ArrayX.onComplete = function() {

    rotationFlag = 1;

  }

}

function createScatterArray() {

  for(var i = 0; i < geom.vertices.length; i++) {

    geomScatterX.push((Math.random() * 10) -5 );
    geomScatterY.push((Math.random() * 10) -5 );
    geomScatterZ.push((Math.random() * 10) -5 );

  }

  geomScatterX.onUpdate = function() {
    var count = 0;
    rotationFlag = 0;
    geom.vertices.forEach(function(v) {
      v.x = geomArrayX[count];
      count++;
    });
    count++;
    geom.verticesNeedUpdate = true;
  };﻿

  geomScatterY.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.y = geomArrayY[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

  geomScatterZ.onUpdate = function() {
    var count = 0;
    geom.vertices.forEach(function(v) {
      v.z = geomArrayZ[count];
      count++;
    });
    geom.verticesNeedUpdate = true;
  };

}
