'layers' Attribute Documentation
===================================

This sub-directive needs the **openlayers** main directive, so it is normaly used as an attribute of the *openlayers* tag, like this:

```
<openlayers layers="layers"></openlayers>
```

It will map an object _layers_ of our controller scope with the corresponding object on our leaflet directive isolated scope. It's not a bidirectional relationship, only the changes made to our _tiles_ object on the controller scope will affect the map, but no viceversa.

This object defines the layers that integrate the map, so it's basically composed of three attributes: **type**, **url** and **attribution**. Let's see them in an example definition:
```
$scope.layers = {
    main: {
        type: "tile",
        source: {
            type: "OSM",
            url: "http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    }
}
```

And that's all, we can see how the map is affected when we change the _layers_ scope object values, like these examples:

* [layers-change-tiles-example.html](http://tombatossals.github.io/angular-openlayers-directive/examples/040-layers-change-tiles-example.html).
* [layers-zoom-tiles-changer-example.html](http://tombatossals.github.io/angular-openlayers-directive/examples/041-layers-zoom-tiles-changer-example.html).
* [layers-opacity-example.html](http://tombatossals.github.io/angular-openlayers-directive/examples/042-layers-opacity-example.html).
