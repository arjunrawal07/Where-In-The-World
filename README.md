# Where-In-The-World
This application displays nature trails using Esri's ArcGIS API for JavaScript.

# Background
According to their website, [Esri](https://www.esri.com) builds ArcGIS, "the world's most powerful mapping and spacial analytics software." ArcGIS can be used for a variety of purposes including optimizing routes for product delivery, identifying COVID-19 testing sites in neighborhoods, and mapping conflict zones for aid workers to deliver life-saving assistance. 

Esri provides very short, easy-to-follow tutorials to build applications with their ArcGIS tool. I followed these tutorials to get the application up and running. 

# Technologies
* ArcGIS
* JavaScript

# Developer's Note:
While the Esri tutorials write the code in the ```<script></script>``` tag of the ```index.html``` file, I wrote the code in a separate ```script.js``` file to practice separation of concerns and keep the code organized.

# Features
1. 2D MapView
  I created a simple 2D MapView by using an [Asynchronous Module Definition (AMD) format](https://dojotoolkit.org/documentation/tutorials/1.10/modules/index.html). To load the 2D Map, I loaded the Map, MapView, and other modules with a ```require``` statement to expose the data within eacch module. I utilized a callback function because I needed a way to reference and access the data within each module later in the code. 

The ```require``` statement loads the module and calls the callback function by passing any modules as parameters. Per best practices, the parameter names are identical to the module names.

  
  ```js
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
  ```
2. Basemaps
  Esri provides a number of basemaps developers can access and load. The tutorial initially takes you through using the BasemapToggle widget, which allow end-users to toggle between two kinds of maps. I took it a step further and loaded the raster tiles into the BasemapGallery widget, located in the top-right corner of the map.
  ```js 
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
  ```
 3. Trails, Trails, Trails! 
 I'm an avid hiker, and have become an even more avid hiker during COVID-19, so I was especially drawn to this feature. While I enjoy navigating on a trail without a map (to test my skills), I do find value in knowing a little bit of information prior to starting any trek. This feature specifically includes trailheads, trails, and parks. Esri categorizes these as "feature layers" that developers can access through ArcGIS Online or ArcGIS Enterprise. I used ArcGIS Online, a software-as-a-service (SaaS), "...that can be used to create, share, and manage maps, scenes, layers, apps, and other geographic content."
 
 Note: the ```0``` is used with the ``add``` method so the layers are added to the beginning of the collection and draw in the correct order: polygons, lines, and then points.
 
 ```js 
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
  ```
 4. Querying a feature layer
 Esri allows you to execute server and client side queries on its features layers. See description below from Esri:
``` 
 * Server-side Query: To request a subset of data from the server without adding the feature layer to a map, use the queryFeatures method on a FeatureLayer object.
 * Client-side Query: To access a subset of data on the client, you have to add the feature layer to a map first, and then use the queryFeatures method on a FeatureLayerView object. Since the data is on the client, client-side queries execute very quickly.
 
The main difference between client-side and server-side queries is that client-side querying is only possible after the feature layer is added to a map and the attributes are present.
```

To execute client-side queries, the feature layer must be added first with attributes present before the query can be implemented. 
```js
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
  ```
  
 # Known Limitations
 This app uses the Malibu / Greater Los Angeles area as its center, thus limiting the user's ability to search for trailheads based on this geography.
 
 # Future Development
 * Expand the geographic access of the user, allowing the user to access trails anywhere in the world (and potentially based on their current location).
 * Add additional data to trails rendered on the map including information about local wildlife, any precautions, difficulty level, as well as emergency contact information.
