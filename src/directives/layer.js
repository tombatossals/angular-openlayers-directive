angular.module('openlayers-directive').directive('olLayer', function($log, $q, olData, olMapDefaults, olHelpers) {

    return {
        restrict: 'E',
        scope: {
            properties: '=olLayerProperties'
        },
        replace: false,
        require: '^openlayers',
        link: function(scope, element, attrs, controller) {
            var isDefined   = olHelpers.isDefined;
            var equals      = olHelpers.equals;
            var olScope     = controller.getOpenlayersScope();
            var createLayer = olHelpers.createLayer;
            var setVectorLayerEvents = olHelpers.setVectorLayerEvents;
            var detectLayerType = olHelpers.detectLayerType;
            var createStyle = olHelpers.createStyle;
            var isBoolean   = olHelpers.isBoolean;
            var isNumber    = olHelpers.isNumber;

            olScope.getMap().then(function(map) {
                var projection = map.getView().getProjection();
                var defaults = olMapDefaults.setDefaults(olScope);
                var olLayer;

                scope.$on('$destroy', function() {
                    map.removeLayer(olLayer);
                });

                if (!isDefined(scope.properties)) {
                    if (isDefined(attrs.sourceType) && isDefined(attrs.sourceUrl)) {
                        var l = {
                            source: {
                                url: attrs.sourceUrl,
                                type: attrs.sourceType
                            }
                        };

                        olLayer = createLayer(l, projection);
                        if (detectLayerType(l) === 'Vector') {
                            setVectorLayerEvents(defaults.events, map, scope, attrs.name);
                        }
                        map.addLayer(olLayer);
                        olData.getLayers().then(function(layers) {
                            if (isDefined(attrs.name)) {
                                layers[attrs.name] = olLayer;
                            }
                        });
                    }
                    return;
                }

                scope.$watch('properties', function(properties, oldProperties) {
                    if (!isDefined(properties.source) || !isDefined(properties.source.type)) {
                        return;
                    }

                    if (!isDefined(properties.visible)) {
                        properties.visible = true;
                        return;
                    }

                    if (!isDefined(properties.opacity)) {
                        properties.opacity = 1;
                        return;
                    }

                    var style;
                    if (!isDefined(olLayer)) {
                        olLayer = createLayer(properties, projection);
                        map.addLayer(olLayer);

                        if (detectLayerType(properties) === 'Vector') {
                            setVectorLayerEvents(defaults.events, map, scope, properties.name);
                        }

                        olData.getLayers().then(function(layers) {
                            if (properties.name) {
                                layers[properties.name] = olLayer;
                            } else {
                                layers[attrs.olLayerProperties] = olLayer;
                            }
                        });

                        if (isBoolean(properties.visible)) {
                            olLayer.setVisible(properties.visible);
                        }

                        if (properties.opacity) {
                            olLayer.setOpacity(properties.opacity);
                        }

                        if (properties.style) {
                            if (!angular.isFunction(properties.style)) {
                                style = createStyle(properties.style);
                            } else {
                                style = properties.style;
                            }
                            olLayer.setStyle(style);
                        }

                    } else {
                        if (isDefined(oldProperties) && !equals(properties, oldProperties)) {
                            if (!equals(properties.source, oldProperties.source)) {
                                var layerCollection = map.getLayers();

                                for (var j = 0; j < layerCollection.getLength(); j++) {
                                    var l = layerCollection.item(j);
                                    if (l === olLayer) {
                                        layerCollection.removeAt(j);
                                        olLayer = createLayer(properties, projection);
                                        if (isDefined(olLayer)) {
                                            layerCollection.insertAt(j, olLayer);

                                            if (detectLayerType(properties) === 'Vector') {
                                                setVectorLayerEvents(defaults.events, map, scope, properties.name);
                                            }
                                        }
                                    }
                                }
                            }

                            if (isBoolean(properties.visible) && properties.visible !== oldProperties.visible) {
                                olLayer.setVisible(properties.visible);
                            }

                            if (properties.opacity !== oldProperties.opacity) {
                                if (isNumber(properties.opacity) || isNumber(parseFloat(properties.opacity))) {
                                    olLayer.setOpacity(properties.opacity);
                                }
                            }

                            if (isDefined(properties.style) && !equals(properties.style, oldProperties.style)) {
                                if (!angular.isFunction(properties.style)) {
                                    style = createStyle(properties.style);
                                } else {
                                    style = properties.style;
                                }
                                olLayer.setStyle(style);
                            }
                        }
                    }
                }, true);
            });
        }
    };
});
