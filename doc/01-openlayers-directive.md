Openlayers directive Documentation
==================================

This directive acts as an intermediary between the AngularJS framework and the Openlayers (version 3) map management library. It's composed of a main directive **&lt;openlayers&gt;** and attributes (coded as sub-directives) of the main directive. For example, we could add to our HTML code:

```
<openlayers center="center" width="640px" height="480px">
```

Here we have the main **openlayers** directive, with the attribute **center** and two more attributes **width** and **height**.

Before detailing how to use the directive and its attributes, let's talk about initializing our web page to be able to work with the directive. We must load the required JS libraries and CSS in our HTML:

```
<html>
  <head>
     <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min.js"></script>
     <script src="http://openlayers.org/en/v3.0.0/build/ol.js"></script>
     <script src="http://tombatossals.github.io/angular-openlayers-directive/dist/angular-openlayers-directive.min.js"></script>
  </head>
</html>
```

After loading the required libraries, we only need to define our AngularJS application (depending on 'openlayers-directive') and an application controller to be able to load our map. Showing the map on screen will require that we set the width and height of our map, via CSS or as attributes of the *openlayers* tag. Let' see how to do it:

- We can add *height* and *width* attributes to our *openlayers* directive inline. Example:

```
<openlayers width="640px" height="480px"></openlayers>
```

- We can set the *width* and *height* of the common CSS class '*angular-openlayers-map*' applied to all maps. Beware this will be applied to all maps rendered on your application. Example:

```
<style>
  .angular-openlayers-map {
    width: 640px;
    height: 480px;
  }
</style>
```

- We can set and *id* to our map, and set the CSS properties to this specifid id. Example:

```
<style>
  #main {
    width: 640px;
    height: 480px;
  }
</style>
...
<openlayers id="main"></openlayers>
```

Great, let's see now the complete HTML and inline javascript code needed to load our first map:

```
<!DOCTYPE html>
<html ng-app="demoapp">
  <head>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.23/angular.min.js"></script>
    <script src="http://openlayers.org/en/v3.0.0/build/ol.js"></script>
    <script src="http://tombatossals.github.io/angular-openlayers-directive/dist/angular-openlayers-directive.min.js"></script>
    <script>
        var app = angular.module("demoapp", ['openlayers-directive']);
    </script>
    <link rel="stylesheet" href="css/style.css" />
  </head>
  <body ng-controller="DemoController">
    <openlayers width="640px" height="400px"></openlayers>
  </body>
</html>
```

You can see this example in action on the [simple-example demo file](http://tombatossals.github.io/angular-openlayers-directive/examples/01-simple-example.html).

Take a look at the [AnguarJS controller documentation](http://docs.angularjs.org/guide/controller) if you want to learn more about Angular controller definition, or to the [AngularJS ngApp](http://docs.angularjs.org/api/ng.directive:ngApp) to know how to bootstrap an Angular application.

Attributes Documentation
========================

We have much more possibilities than showing a simple map, but this will need that we take a closer look at the attributes, listed below:

- [ol-defaults attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/defaults-attribute.md)
- [ol-center attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/center-attribute.md)
- [ol-layers attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/layers-attribute.md)
- [ol-markers attribute](https://github.com/tombatossals/angular-openlayers-directive/blob/master/doc/markers-attribute.md)
