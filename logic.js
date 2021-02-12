// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log(data)
  // Once we get a response, send the data.features object to the createFeatures function

  createFeatures(data.features);
});

function createFeatures(earthquakeData) {
  

  quakeMarkers = []
  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature) {

    
    var depth = feature.geometry.coordinates[2]
    // console.log(depth)
    
    quakeMarkers.push(L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      color: "#000000",
      weight: .1,
      fillColor: colorPicker(depth),
      fillOpacity: feature.properties.mag * .10,
      radius: feature.properties.mag * 20000,
      interactive: true,
      bubblingMouseEvents: true
    }).bindPopup("<h3>" + feature.properties.place +
    "<hr><h4><strong> Magnitude: " + feature.properties.mag + " Depth: " + depth + "</strong></h4>"+
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" ));
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(quakeMarkers);
}

function colorPicker(depth) {
  
    if (depth >= 90){
      return "#A04000";}

    else if (depth >= 70){
        return "#AF601A";}

    else if (depth >= 50) {
       return "#B9770E";}

    else if (depth >= 30) {
        return "#B7950B";}
      
    else if (depth >= 10){
        return "#239B56";}

    else {
        return "#58D68D";}   
  
};


function createMap(quakeMarkers) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var quakeCircles = L.layerGroup(quakeMarkers);

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
     "Earthquakes By Magnitude": quakeCircles
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [darkmap, quakeCircles]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (map) {

  var div = L.DomUtil.create('div', 'info legend');
  labels = ['<h4>Epicenter Depths</h4>'],
  depths = [90, 70, 50, 30,10, 1];

  for (var i = 0; i < depths.length; i++) {

          div.innerHTML += 
          labels.push(
              '<i class="square" style="background:' + colorPicker(depths[i]) + '"></i> ' + " >" + 
          (depths[i] ? depths[i] + "m" : '+'));

      }
      div.innerHTML = labels.join('<br>');
  return div;
  };
  

legend.addTo(myMap);

}
