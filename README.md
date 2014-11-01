# angular-openlayers-directive

Work in progress.

[AngularJS](http://angularjs.org/) directive for the OpenLayers (version 3) Javascript
Library. This software allows you to embed maps managed by openlayers on your [AnguarJS](http://angularjs.org/) or [OpenLayers](http://openlayers.org/) project. It's a good starting point to learn the ***Openlayers API*** too.

Let's start with some basic examples. Look at the source code of the example to see all the code you need to embed a similar interactive map on our page.

* [Basic example](http://tombatossals.github.io/angular-openlayers-directive/examples/010-simple-example.html)
* [Center example](http://tombatossals.github.io/angular-openlayers-directive/examples/020-center-example.html)
* [Center url hash example](http://tombatossals.github.io/angular-openlayers-directive/examples/021-center-url-hash-example.html)
* [Center autodiscover example](http://tombatossals.github.io/angular-openlayers-directive/examples/022-center-autodiscover-example.html)
* [Center constrain zoom example](http://tombatossals.github.io/angular-openlayers-directive/examples/023-center-constrain-zoom-example.html)
* [Center with updated bounds example](http://tombatossals.github.io/angular-openlayers-directive/examples/024-center-bounds-example.html)
* [Custom parameters example](http://tombatossals.github.io/angular-openlayers-directive/examples/030-custom-parameters-example.html)
* [Layers change tiles example](http://tombatossals.github.io/angular-openlayers-directive/examples/040-layers-change-tiles-example.html)
* [Layers zoom tiles changer example](http://tombatossals.github.io/angular-openlayers-directive/examples/041-layers-zoom-tiles-changer-example.html)
* [Layers opacity example](http://tombatossals.github.io/angular-openlayers-directive/examples/042-layers-opacity-example.html)
* [Layers Bing Maps example](http://tombatossals.github.io/angular-openlayers-directive/examples/043-layers-bing-maps-example.html)
* [Layers MapQuest example](http://tombatossals.github.io/angular-openlayers-directive/examples/044-layers-mapquest-maps-example.html)
* [Layers GeoJSON example](http://tombatossals.github.io/angular-openlayers-directive/examples/045-layers-geojson-example.html)
* [Layers GeoJSON center example](http://tombatossals.github.io/angular-openlayers-directive/examples/046-layers-geojson-center-example.html)
* [Layers TopoJSON example](http://tombatossals.github.io/angular-openlayers-directive/examples/047-layers-topojson-example.html)
* [Layers static image example](http://tombatossals.github.io/angular-openlayers-directive/examples/048-layers-static-image-example.html)
* [Layers Stamen maps example](http://tombatossals.github.io/angular-openlayers-directive/examples/049-layers-stamen-example.html)
* [Layers GeoJSON change style example](http://tombatossals.github.io/angular-openlayers-directive/examples/050-layer-geojson-change-style-example.html)
* [Layers GeoJSON change style with function example](http://tombatossals.github.io/angular-openlayers-directive/examples/051-layer-geojson-change-style-with-function-example.html)
* [Markers example](http://tombatossals.github.io/angular-openlayers-directive/examples/060-markers-example.html)
* [View rotation example](http://tombatossals.github.io/angular-openlayers-directive/examples/070-view-rotation-example.html)
* [Multiple maps example](http://tombatossals.github.io/angular-openlayers-directive/examples/090-multiple-maps-example.html)
* [Controls example](http://tombatossals.github.io/angular-openlayers-directive/examples/100-controls-example.html)

You can take a look at the current documentation go get a more detailed explanation of how it works and what you can accomplish with this directive:

* [Openlayers directive](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/01-openlayers-directive.md)
* [Center attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/02-center-attribute.md)
* [Defaults attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/03-defaults-attribute.md)
* [Layers attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/04-layers-attribute.md)

## Quick start: How to use it

First of all, load **AngularJS** and **Openlayers(V3)** in your HTML.

After that, you must include the openlayers-directive dependency on your angular module:
```
var app = angular.module("demoapp", ["openlayers-directive"]);
```

After that, you can change the default values of the directive (if you want) on
your angular controller. For example, you can change the tiles source of the main layer, or the
maxzoom on the map. You can see all the customizable default options in the documentation.

```javascript
angular.extend($scope, {
    defaults: {
        layers: {
            main: {
                source: {
                    type; "OSM",
                    url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
                }
            }
        },
        maxZoom: 14
    }
});
```

If you want to set the start of the map to a precise position, you can define
the "center" property of the scope (lat, lng, zoom). It will be updated
interacting on the scope and on the leaflet map in two-way binding. Example:
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
<openlayers center="center" height="480px" width="640px"></openlayers>
```
