# angular-openlayers-directive

Work in progress.

[AngularJS](http://angularjs.org/) directive for the OpenLayers (version 3) Javascript
Library. This software aims to easily embed maps managed by openlayers on your
[OpenLayers](http://openlayers.org/) project.

See some basic examples:

* [Basic example](http://tombatossals.github.io/angular-openlayers-directive/examples/01-simple-example.html)
* [Center example](http://tombatossals.github.io/angular-openlayers-directive/examples/02-center-example.html)


To see it in action, go to the main page where you can find more examples and
some documentation:

 * http://tombatossals.github.com/angular-openlayers-directive


## How to use it

You must include the openlayers-directive dependency on your angular module:
```
var app = angular.module("demoapp", ["openlayers-directive"]);
```

After that, you can change the default values of the directive (if you want) on
your angular controller. For example, you can change the tiles source or the
maxzoom on the map. You can see all the customizable default options in the documentation.

```javascript
angular.extend($scope, {
    defaults: {
        tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
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
<openlayers defaults="defaults" center="center" height="480px" width="640px"></openlayers>
```
