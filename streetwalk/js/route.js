const directionsService = new google.maps.DirectionsService();
const minDist = 12;

export function getRoute(request, callback) {
  directionsService.route(request, function (result, status) {
    var path = [];
    var pathArray = [];

    // push all points to an array
    var route = result.routes[0];
    for (var l = 0; l < route.legs.length; l++) {
      var leg = route.legs[l];
      for (var s = 0; s < leg.steps.length; s++) {
        var step = leg.steps[s];
        var line = step.polyline.points;

        var geo = google.maps.geometry.encoding.decodePath(line);
        for (var g = 0; g < geo.length; g++) {
          path.push(geo[g]);
        }
      }
    }

    var polyline = new google.maps.Polyline({ path: path });
    let road = polyline.GetPointsAtDistance(minDist);

    for (let i = 0; i < road.length; i++) {
      pathArray.push(road[i].lat() + ',' + road[i].lng());
    }

    // measure after everything, just to keep it simple
    let dist = 0;
    for (var i = 0; i < road.length - 1; i++) {
      dist += measure(road[i], road[i + 1]);
    }

    var km = (dist / 1000).toFixed(2);
    var miles = ((dist / 1000) * 0.621371).toFixed(2);
    var time = ((miles / 10) * 60).toFixed(0);

    console.log(
      road.length +
      ' spheres, ' +
      time +
      ' minutes, ' +
      miles +
      ' miles, ' +
      km +
      ' km'
    );

    if (callback) callback(road, pathArray);
  });
}
