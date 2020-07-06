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
        useVectorBasemaps: false, // False loads raster tile basemaps
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

  //Function is used to accept the return values from a query and add the results to graphics layer
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

        //Trail info to be shown when clicked (click event functionality implemented further down)
        popupTemplate: {
          title: "{TRL_NAME}",
          content: "This is a {PARK_NAME} trail located in {CITY_JUR}",
        },
      });
      graphicsLayer.add(g);
    });
  }

  //Function builds a query that will return all the listed fields and geometry from feature layer
  function queryFeatureLayer(
    point,
    distance,
    spatialRelationship,
    sqlExpression
  ) {
    var query = {
      geometry: point,
      distance: distance,
      spatialRelationship: spatialRelationship,
      outFields: ["*"],
      returnGeometry: true,
      where: sqlExpression,
    };

    //queryFeatures method executes the query
    //When features are returned, results are passed into the addGraphics function defined above.
    featureLayer.queryFeatures(query).then(function (result) {
      addGraphics(result, true);
    });
  }
  //Searches for and displays features in the center of map
  view.when(function () {
    queryFeatureLayer(view.center, 1500, "intersects");
  });

  //Calls the queryFeatureLayer function and searches for features when clicked
  //Searches for and displays only the features that are 1500 meters from the point
  view.on("click", function (event) {
    queryFeatureLayer(event.mapPoint, 1500, "intersects");
  });

  //Define function to execute client-side query with the same fields as the server-side query.
  function queryFeatureLayerView(
    point,
    distance,
    spatialRelationship,
    sqlExpression
  ) {
    //If layer is missing, add it
    if (!map.findLayerById(featureLayer.id)) {
      featureLayer.outFields = ["*"];
      map.add(featureLayer, 0);
    }
    //Build the query
    var query = {
      geometry: point,
      distance: distance,
      spatialRelationship: spatialRelationship,
      outFields: ["*"],
      returnGeometry: true,
      where: sqlExpression,
    };
    //Now that layerView is added and attributes are present, execute the client-side query.
    view.whenLayerView(featureLayer).then(function (featureLayerView) {
      if (featureLayerView.updating) {
        var handle = featureLayerView.watch("updating", function (isUpdating) {
          if (!isUpdating) {
            //implement the query
            featureLayerView.queryFeatures(query).then(function (result) {
              addGraphics(result);
            });
            handle.remove();
          }
        });
      } else {
        //Implement query
        featureLayerView.queryFeatures(query).then(function (result) {
          addGraphics(result);
        });
      }
    });
  }
  //Updating the when and on handlers to call the queryFeatureLayerView function with same parameters
  view.when(function () {
    queryFeatureLayerView(view.center, 1500, "intersects");
  });

  view.on("click", function (event) {
    queryFeatureLayerView(event.mapPoint, 1500, "intersects");
  });
});
