require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/BasemapToggle",
    "esri/widgets/BasemapGallery",
    "esri/layers/FeatureLayer",
  ], function (Map, MapView, BasemapToggle, BasemapGallery, FeatureLayer) {
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
  });