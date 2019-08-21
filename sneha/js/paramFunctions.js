var paramFunction1 = function (u, v, target) {

		var u = (u * 2 * Math.PI);
    var v = (v * 2 * Math.PI) - Math.PI;

    var x = 2 * Math.sin(u) * Math.sin(v);
    var y = 2 * Math.cos(u) * Math.sin(v);
    var z = 2 * Math.cos(v);

    target.set( x, y, z );

}

// create parametric and add to scene
var paramFunction2 = function (u, v, target) {
    var u = u * 2 * Math.PI;
    var v = (v * 2 * Math.PI) - Math.PI;

    var x = Math.cos(u);
    var y = Math.sin(u) + Math.cos(v);
    var z = Math.sin(v);

    target.set( x, y, z );

}

// create parametric and add to scene
var paramFunction3 = function (u, v, target) {
    var u = (u * 2 * Math.PI) - Math.PI;
    var v = (v * 2 * Math.PI) - Math.PI;
    var R = 4;
    var r = 2;

    var x = (R + r * Math.cos(v)) * Math.cos(u);
    var y = (R + r * Math.cos(v)) * Math.sin(u);
    var z = r * Math.sin(v);

    target.set( x, y, z );

}

// create parametric and add to scene - hanging light
var paramFunction4 = function (u, v, target) {
    var u = u * 2;
    var v = (v * 4 * Math.PI);

    var x = Math.cos(v) * Math.sin(u);
    var y = Math.sin(v) * Math.sin(u);
    var z = 0.2 * v + (Math.cos(u) + Math.log(Math.tan(u / 2)));

    target.set( x, y, z );
}

// create parametric and add to scene - different type of sphere
var paramFunction5 = function (u, v, target) {

	var u = (u * 2 * Math.PI);
	var v = (v * 2 * Math.PI) - Math.PI;

	var x = 2 * Math.cos(u) * Math.cos(v);
	var y = 2 * Math.sin(u) * Math.cos(v);
	var z = 2 * Math.sin(v);

	target.set( x, y, z );

}

//flower formula
var paramFunction6 = function (u, v, target) {

	var u = (u * 2 * Math.PI);
	var v = (v * 2 * Math.PI) - Math.PI;

	var R = 2, m = 4, n = 1, k = 8;

	var x = R * Math.cos(m*u) * Math.pow(Math.cos(n*v), k) * Math.cos(u) * Math.cos(v);
	var z = R * Math.cos(m*u) * Math.pow(Math.cos(n*v), k) * Math.sin(u) * Math.cos(v);
	var y = R * Math.cos(m*u) * Math.pow(Math.cos(n*v), k) * Math.sin(v);

	target.set( x, y, z );

}
