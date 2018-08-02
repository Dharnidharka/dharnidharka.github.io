$(document).ready(function() {

  var map,
      heatmap,
      heatMapData = [],
      weight = 1,
      cmdFlag= 1;


  init();

  function init() {

    initializeMap();
    generateHeatMap();
    addClickEvents();

  }

  function initializeMap() {

    var center = new google.maps.LatLng(24.5937, 78.9629);

    map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 7,
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

    $('#save-data').on('click', function(){
      saveDataToFile();
    });

    $('.heatmap-btn').on('click', function(){
      $('.btn-selected').removeClass('btn-selected');
      $(this).addClass('btn-selected');

      weight = parseFloat($(this).attr('data-size'));

    });

    $(document).keydown(function(e) {

      console.log(e.keyCode);
      if(e.keyCode == 91) {
        cmdFlag = 1;
      }
      else if(e.keyCode == 90 && cmdFlag == 1) {
          heatMapData.pop();
          heatmap.setData(heatMapData);
      } else {
        cmdFlag = 0;
      }

    });

  }

  function addToHeatMap(lat, lng) {

    heatMapData.push({ location: new google.maps.LatLng(lat, lng), weight: weight });
    heatmap.setData(heatMapData);

  }

  function generateHeatMap() {

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: heatMapData,
      radius: 20
    });
    heatmap.setMap(map);

  }

  function saveDataToFile() {

      var data  = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(heatMapData));
      var a       = document.getElementById('save-data');
      a.href      = 'data:' + data;
      a.download  = 'data.txt';

      document.getElementById('save-data').appendChild(a);

  }

});
