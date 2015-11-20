'Defaults' Attribute Documentation
==================================

This sub-directive needs the **openlayers** main directive, so it is normaly used as an attribute of the *openlayers* tag, like this:

```
<openlayers ol-defaults="defaults"></openlayers>
```

It will define the default parameters from which we want to initialize our map. It's not used as a bi-directional attribute, so it will only apply the initial map parameters and nothing more. Let's see its possibilities.

We can define some custom parameters that apply to the Leaflet map creation. This is the list:


Let's see an example of how to use this. First of all, in our controller, we will create a new object *defaults* inside the *$scope* where we will set the parameters that we want to change.

```
angular.extend($scope, {
    defaults: {
        layer: {
            url: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png"
        },
        interactions: {
            mouseWheelZoom: false
        },
        controls: {
            zoom: {
                position: 'topright'
            }
        }
   }
});
```

And after that, in our HTML code we will define our openlayers directive like this:
```
<openlayers ol-defaults="defaults"></openlayers>
```

And that's all. A full example of using this attribute can be found [here](http://tombatossals.github.io/angular-openlayers-directive/examples/030-custom-parameters-example.html).
