angular.module('openlayers-directive').directive('olLayers', function($log, $q, olData, olMapDefaults, olHelpers) {
    var _olLayers;

    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: 'openlayers',
        controller: function() {
            _olLayers = $q.defer();
            this.getLayers = function() {
                return _olLayers.promise;
            };
        },
        link: function(scope, element, attrs, controller) {
            var isDefined   = olHelpers.isDefined;
            var equals      = olHelpers.equals;
            var olLayers    = {};
            var olScope     = controller.getOpenlayersScope();
            var createLayer = olHelpers.createLayer;
            var createStyle = olHelpers.createStyle;
            var isBoolean   = olHelpers.isBoolean;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                var projection = map.getView().getProjection();

                olScope.$watch('layers', function(layers, oldLayers) {
                    if (!isDefined(layers)) {
                        $log.warn('[AngularJS - OpenLayers] At least one layer has to be defined.');
                        layers = angular.copy(defaults.layers);
                    }

                    var layer = layers[Object.keys(layers)[0]];
                    var name;
                    if (!isDefined(layer) || !isDefined(layer.source) || !isDefined(layer.source.type)) {
                        $log.warn('[AngularJS - OpenLayers] At least one layer has to be defined.');
                        layers = angular.copy(defaults.layers);
                    }

                    // Delete non existent layers from the map
                    for (name in olLayers) {
                        layer = olLayers[name];
                        if (!layers.hasOwnProperty(name)) {
                            // Remove from the map if it's on it
                            var activeLayers = map.getLayers();
                            for (var i in activeLayers) {
                                if (activeLayers[i] === layer) {
                                    map.removeLayer(layer);
                                }
                            }
                            delete olLayers[name];
                        }
                    }

                    // add new layers
                    for (name in layers) {
                        layer = layers[name];
                        var olLayer;
                        var style;

                        if (!isDefined(layer.visible)) {
                            layer.visible = true;
                        }

                        if (!isDefined(layer.opacity)) {
                            layer.opacity = 1;
                        }

                        if (!olLayers.hasOwnProperty(name)) {
                            olLayer = createLayer(layers[name], projection);
                            if (isDefined(olLayer)) {
                                olLayers[name] = olLayer;
                                map.addLayer(olLayer);

                                if (layer.opacity) {
                                    olLayer.setOpacity(layer.opacity);
                                }

                                if (layer.style) {
                                    if (!angular.isFunction(layer.style)) {
                                        style = createStyle(layer.style);
                                    } else {
                                        style = layer.style;
                                    }
                                    olLayer.setStyle(style);
                                }
                            }
                        } else {
                            layer = layers[name];
                            var oldLayer = oldLayers[name];
                            olLayer = olLayers[name];
                            if (isDefined(oldLayer) && !equals(layer, oldLayer)) {
                                if (!equals(layer.source, oldLayer.source)) {

                                    var layerCollection = map.getLayers();

                                    for (var j = 0; j < layerCollection.getLength(); j++) {
                                        var l = layerCollection.item(j);
                                        if (l === olLayer) {
                                            layerCollection.removeAt(j);
                                            olLayer = createLayer(layer, projection);
                                            if (isDefined(olLayer)) {
                                                olLayers[name] = olLayer;
                                                layerCollection.insertAt(j, olLayer);
                                            }
                                        }
                                    }
                                }

                                if (isBoolean(layer.visible) && layer.visible !== oldLayer.visible) {
                                    olLayer.setVisible(layer.visible);
                                }

                                if (layer.opacity && layer.opacity !== oldLayer.opacity) {
                                    olLayer.setOpacity(layer.opacity);
                                }

                                if (layer.style && !equals(layer.style, oldLayer.style)) {
                                    if (!angular.isFunction(layer.style)) {
                                        style = createStyle(layer.style);
                                    } else {
                                        style = layer.style;
                                    }
                                    olLayer.setStyle(style);
                                }
                            }
                        }
                    }
                    // We can resolve the layer promises
                    _olLayers.resolve(olLayers);
                    olData.setLayers(olLayers, attrs.id);
                }, true);

            });
        }
    };
});
