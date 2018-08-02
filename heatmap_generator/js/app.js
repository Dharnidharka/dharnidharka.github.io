$(document).ready(function() {

  var map,
      heatMapData = [],
      weight = 1;


  init();

  function init() {

    initializeMap();
    addClickEvents();
    //generateHeatMap();

  }

  function initializeMap() {

    var center = new google.maps.LatLng(20.5937, 78.9629);

    map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 6,
      mapTypeId: 'satellite',
      labels: true
    });

  }

  function addClickEvents() {

    google.maps.event.addListener(map, 'click', function(event) {
       //console.log("Latitude: "+event.latLng.lat()+" "+", longitude: "+event.latLng.lng());
       addToHeatMap(event.latLng.lat(), event.latLng.lng())
    });

    $('#heatmap-btn').on('click', function(){
      generateHeatMap();
    });

    $('.heatmap-btn').on('click', function(){
      $('.btn-selected').removeClass('btn-selected');
      $(this).addClass('btn-selected');

      weight = parseFloat($(this).attr('data-size'));

    })

  }

  function addToHeatMap(lat, lng) {

    heatMapData.push({ location: new google.maps.LatLng(lat, lng), weight: weight });
    //console.log(heatMapData);
    generateHeatMap();

  }

  function generateHeatMap() {

    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatMapData,
      radius: 20
    });
    heatmap.setMap(map);

  }

});
