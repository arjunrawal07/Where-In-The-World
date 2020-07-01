require([
  "esri/Map",
  "esri/views/MapView",
  "esri/widgets/BasemapToggle",
  "esri/widgets/BasemapGallery",
  "esri/layers/FeatureLayer",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
], function (
  Map,
  MapView,
  BasemapToggle,
  BasemapGallery,
  FeatureLayer,
  GraphicsLayer,
  Graphic
) {
  //Map is the container for layers
  var map = new Map({
    basemap: "streets-navigation-vector",
  });
  //View draws the layers to the div provided
  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-118.805, 34.027], //longitude, latitude
    zoom: 13,
  });
  // var basemapToggle = new BasemapToggle({
  //   view: view,
  //   nextBasemap: "satellite",
  // });
  //Adds basemapToggle widget into bottom-right corner
  // view.ui.add(basemapToggle, "bottom-right");
  var basemapGallery = new BasemapGallery({
    view: view,
    source: {
      portal: {
        url: "https://www.arcgis.com",
        useVectorBasemaps: false, // loads raster tile basemaps
      },
    },
  });
  view.ui.add(basemapGallery, "top-right");
  //Trailheads feature layer (points)
  var trailheadsLayer = new FeatureLayer({
    url:
      "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads/FeatureServer/0",
  });
  map.add(trailheadsLayer);

  //Trails feature layer (lines)
  var trailsLayer = new FeatureLayer({
    url:
      "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trails/FeatureServer/0",
  });
  map.add(trailsLayer, 0);

  //Parks and open spaces (polygons)
  var parksLayer = new FeatureLayer({
    url:
      "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Parks_and_Open_Space/FeatureServer/0",
  });
  map.add(parksLayer, 0);

  //Referencing the trailheads feature layer to query
  var featureLayer = new FeatureLayer({
    url:
      "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
  });

  //Layer used to draw graphics returned
  var graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);
});

//USed to accept the return values from a query and add the results to graphics layer
function addGraphics(result) {
  graphicsLayer.removeAll(); //Clears the graphics layer each time
  result.features.forEach(function (feature) {
    var g = new Graphic({
      geometry: feature.geometry,
      attributes: feature.attributes,
      symbol: {
        type: "simple-marker", //Creates a black symbol with cyan outline
        color: [0, 0, 0],
        outline: {
          width: 2,
          color: [0, 255, 255],
        },
        size: "20px",
      },
      popupTemplate: { //Shows some trail info when clicked
        title: "{TRL_NAME}",
        content: "This is a {PARK_NAME} trail located in {CITY_JUR}",
      },
    });
    graphicsLayer.add(g);
  });
}
