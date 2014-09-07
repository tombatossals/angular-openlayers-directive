'tiles' Attribute Documentation
===================================

This sub-directive needs the **openlayers** main directive, so it is normaly used as an attribute of the *openlayers* tag, like this:

```
<openlayers tiles="tiles"></openlayers>
```

It will map an object _tiles_ of our controller scope with the corresponding object on our leaflet directive isolated scope. It's not a bidirectional relationship, only the changes made to our _tiles_ object on the controller scope will affect the map, but no viceversa.

This object is basically composed of three attributes: **type**, **url** and **attribution**. Let's see them in an example definition:
```
$scope.tiles = {
    type: "OSM",
    url: "http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}
```

And that's all, we can see how the map is affected when we change the _tiles_ scope object values, like these examples:

* [tiles-example.html](http://tombatossals.github.io/angular-openlayers-directive/examples/04-tiles-example.html).
* [tiles-zoom-changer-example.html](http://tombatossals.github.io/angular-openlayers-directive/examples/05-tiles-zoom-changer-example.html).
