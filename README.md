angular-openlayers-directive
============================
[![Build Status](https://travis-ci.org/tombatossals/angular-openlayers-directive.png)](https://travis-ci.org/tombatossals/angular-openlayers-directive)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![npm version](https://badge.fury.io/js/angular-openlayers-directive.svg)](http://badge.fury.io/js/angular-openlayers-directive)

Work in progress.

[AngularJS](http://angularjs.org/) directive for the OpenLayers (version 3) Javascript Library. This software allows you to embed maps managed by openlayers on your [AnguarJS](http://angularjs.org/) or [OpenLayers](http://openlayers.org/) project. It's a good starting point to learn the ***Openlayers API*** too.

Let's start with some basic examples. Look at the source code of the example to see all the code you need to embed a similar interactive map on our page.

- [Basic example](http://tombatossals.github.io/angular-openlayers-directive/examples/010-simple-example.html)
- [Center example](http://tombatossals.github.io/angular-openlayers-directive/examples/020-center-example.html)
- [Center with no javascript](http://tombatossals.github.io/angular-openlayers-directive/examples/026-center-no-javascript-example.html)
- [Center url hash example](http://tombatossals.github.io/angular-openlayers-directive/examples/021-center-url-hash-example.html)
- [Center autodiscover example](http://tombatossals.github.io/angular-openlayers-directive/examples/022-center-autodiscover-example.html)
- [Center constrain zoom example](http://tombatossals.github.io/angular-openlayers-directive/examples/023-center-constrain-zoom-example.html)
- [Center with updated bounds example](http://tombatossals.github.io/angular-openlayers-directive/examples/024-center-bounds-example.html)
- [Custom parameters example](http://tombatossals.github.io/angular-openlayers-directive/examples/030-custom-parameters-example.html)
- [Layers customized with no javascript](http://tombatossals.github.io/angular-openlayers-directive/examples/056-layers-no-javascript-example.html)
- [Layers change tiles example](http://tombatossals.github.io/angular-openlayers-directive/examples/040-layers-change-tiles-example.html)
- [Layers zoom tiles changer example](http://tombatossals.github.io/angular-openlayers-directive/examples/041-layers-zoom-tiles-changer-example.html)
- [Layers opacity example](http://tombatossals.github.io/angular-openlayers-directive/examples/042-layers-opacity-example.html)
- [Layers Bing Maps example](http://tombatossals.github.io/angular-openlayers-directive/examples/043-layers-bing-maps-example.html)
- [Layers MapQuest example](http://tombatossals.github.io/angular-openlayers-directive/examples/044-layers-mapquest-maps-example.html)
- [Layers GeoJSON example](http://tombatossals.github.io/angular-openlayers-directive/examples/045-layers-geojson-example.html)
- [Layers GeoJSON center example](http://tombatossals.github.io/angular-openlayers-directive/examples/046-layers-geojson-center-example.html)
- [Layers TopoJSON example](http://tombatossals.github.io/angular-openlayers-directive/examples/047-layers-topojson-example.html)
- [Layers static image example](http://tombatossals.github.io/angular-openlayers-directive/examples/048-layers-static-image-example.html)
- [Layers Stamen maps example](http://tombatossals.github.io/angular-openlayers-directive/examples/049-layers-stamen-example.html)
- [Layers GeoJSON change style example](http://tombatossals.github.io/angular-openlayers-directive/examples/050-layer-geojson-change-style-example.html)
- [Layers GeoJSON change style with function example](http://tombatossals.github.io/angular-openlayers-directive/examples/051-layer-geojson-change-style-with-function-example.html)
- [Layers Heatmap example](http://tombatossals.github.io/angular-openlayers-directive/examples/052-heatmap-example.html)
- [Layers Image WMS example](http://tombatossals.github.io/angular-openlayers-directive/examples/053-layers-image-wms-example.html)
- [Add/Remove/Change Layers dynamically example](http://tombatossals.github.io/angular-openlayers-directive/examples/054-add-remove-multiple-layers-example.html)
- [Load inline GeoJson in layer example](http://tombatossals.github.io/angular-openlayers-directive/examples/055-layers-geojon-dynamic-load-example.html)
- [Layer Clustering](http://tombatossals.github.io/angular-openlayers-directive/examples/059-layer-clustering.html)
- [Marker example](http://tombatossals.github.io/angular-openlayers-directive/examples/060-marker-example.html)
- [Marker and layer with no javascsript example](http://tombatossals.github.io/angular-openlayers-directive/examples/066-markers-with-layers-no-javascript-example.html)
- [Marker add/remove from map example](http://tombatossals.github.io/angular-openlayers-directive/examples/061-markers-add-remove-example.html)
- [Marker with label example](http://tombatossals.github.io/angular-openlayers-directive/examples/062-markers-label-example.html)
- [Dynamic marker properties example](http://tombatossals.github.io/angular-openlayers-directive/examples/063-markers-properties-example.html)
- [Marker with HTML render inside label example](http://tombatossals.github.io/angular-openlayers-directive/examples/064-markers-render-html-inside-labels-example.html)
- [Marker in static image layer example](http://tombatossals.github.io/angular-openlayers-directive/examples/065-markers-static-image-layer-example.html)
- [Marker custom icon example](http://tombatossals.github.io/angular-openlayers-directive/examples/067-marker-custom-icon-example.html)
- [View rotation example](http://tombatossals.github.io/angular-openlayers-directive/examples/070-view-rotation-example.html)
- [Events propagation example](http://tombatossals.github.io/angular-openlayers-directive/examples/080-events-propagation-example.html)
- [Events with vectors example](http://tombatossals.github.io/angular-openlayers-directive/examples/081-events-vector-example.html)
- [Events with vectors and dynamic styles example](http://tombatossals.github.io/angular-openlayers-directive/examples/082-events-vector-dynamic-styles-example.html)
- [Events in an static image layer example](http://tombatossals.github.io/angular-openlayers-directive/examples/083-events-static-image-layer-example.html)
- [Events in a KML layer example](http://tombatossals.github.io/angular-openlayers-directive/examples/085-events-kml-example.html)
- [Multiple maps example](http://tombatossals.github.io/angular-openlayers-directive/examples/090-multiple-maps-example.html)
- [Controls example](http://tombatossals.github.io/angular-openlayers-directive/examples/100-controls-example.html)
- [Fullscreen control example](http://tombatossals.github.io/angular-openlayers-directive/examples/101-controls-fullscreen-example.html)

You can take a look at the current documentation go get a more detailed explanation of how it works and what you can accomplish with this directive:

- [Openlayers directive](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/01-openlayers-directive.md)
- [Center attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/02-center-attribute.md)
- [Defaults attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/03-defaults-attribute.md)
- [Layers attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/04-layers-attribute.md)

Install
--------

Build the files yourself, download from bower

```
$ bower install angular-openlayers-directive --save
```

or from npm

```
$ npm install angular-openlayers-directive --save
```

Quick start: How to use it
--------------------------

First of all, load **AngularJS** and **Openlayers(V3)** in your HTML.

After that, you must include the openlayers-directive dependency on your angular module:

```
var app = angular.module("demoapp", ["openlayers-directive"]);
```

The default behaviour will show an OpenstreetMap layer and the zoom and attributions controls, but you can customize those default vaules to fit your needs. Furthermore, you can set a bi-directional update of values between the map and the variables of your controler. This way you can interact easily with the map. Example:

```javascript
angular.extend($scope, {
    center: {
        lat: 51.505,
        lon: -0.09,
        zoom: 8
    }
});

```

Finally, you must include the markup directive on your HTML page, like this:

```html
<openlayers ol-center="center" height="480px" width="640px"></openlayers>
```

Contributing
--------------------------

Contributions are more than welcome. Please refer to the [contributions guidelines](CONTRIBUTING.md) for more details on code style, development life-cycle etc.
