angular.module("openlayers-directive").directive('layers', function ($log, $q, olData, olMapDefaults, olHelpers) {
    var _olLayers;

    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',
        controller: function () {
            _olLayers = $q.defer();
            this.getLayers = function() {
                return _olLayers.promise;
            };
        },
        link: function(scope, element, attrs, controller) {
            var isDefined   = olHelpers.isDefined,
                olLayers    = {},
                olScope     = controller.getOpenlayersScope(),
                createLayer = olHelpers.createLayer;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                olScope.$watch("layers", function(layers) {
                    if (!isDefined(layers.main) ||
                        !isDefined(layers.main.source) || !isDefined(layers.main.source.type)) {
                        $log.warn("[AngularJS - OpenLayers] At least one layer has to be defined.");
                        layers = angular.copy(defaults.layers);
                    }

                    // Delete non existent layers from the map
                    var name, layer;
                    for (name in olLayers) {
                        layer = olLayers[name];
                        if (!layers.hasOwnProperty[name]) {
                            // Remove from the map if it's on it
                            var activeLayers = map.getLayers();
                            for (var i in activeLayers) {
                                if (activeLayers[i] === layer) {
                                    map.removeLayer(layers);
                                }
                            }
                            delete olLayers[name];
                        }
                    }

                    // add new layers
                    for (name in layers) {
                        if (!layers.hasOwnProperty[name]) {
                            layer = createLayer(layers[name]);
                            if (isDefined(layer)) {
                                olLayers[name] = layer;
                                // Only add the visible layer to the map
                                if (layers[name].visible === true) {
                                    map.addLayer(olLayers[name]);
                                }
                            }
                        }
                    }

                    if (Object.keys(olLayers).length === 0) {
                        $log.error('[AngularJS - Leaflet] At least one "main" layer has to be defined');
                        return;
                    }

                    //we have layers, so we need to make, at least, one visible
                    var found = false;
                    // search for an active layer
                    for (var key in olLayers) {
                        layer = olLayers[key];
                        if (layer.getVisible()) {
                            found = true;
                            break;
                        }
                    }

                    // If there is no active layer make the main layer active
                    if (!found) {
                        if (olLayers.hasOwnProperty("main")) {
                            olLayers.main.setVisible(true);
                        } else {
                            olLayers[Object.keys(olLayers)[0]].setVisible(true);
                        }

                    }

                }, true);
            });
        }
    };
});
