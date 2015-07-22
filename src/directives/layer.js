angular.module('openlayers-directive').directive('olLayer', function($log, $q, olMapDefaults, olHelpers) {

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
            var addLayerBeforeMarkers = olHelpers.addLayerBeforeMarkers;
            var isNumber    = olHelpers.isNumber;
            var insertLayer = olHelpers.insertLayer;
            var removeLayer = olHelpers.removeLayer;

            olScope.getMap().then(function(map) {
                var projection = map.getView().getProjection();
                var defaults = olMapDefaults.setDefaults(olScope);
                var layerCollection = map.getLayers();
                var olLayer;

                scope.$on('$destroy', function() {
                    removeLayer(layerCollection, olLayer.index);
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

                        olLayer = createLayer(l, projection, attrs.layerName);
                        if (detectLayerType(l) === 'Vector') {
                            setVectorLayerEvents(defaults.events, map, scope, attrs.name);
                        }
                        addLayerBeforeMarkers(layerCollection, olLayer);
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
                        if (isDefined(properties.index)) {
                            insertLayer(layerCollection, properties.index, olLayer);
                        } else {
                            addLayerBeforeMarkers(layerCollection, olLayer);
                        }

                        if (detectLayerType(properties) === 'Vector') {
                            setVectorLayerEvents(defaults.events, map, scope, properties.name);
                        }

                        if (isBoolean(properties.visible)) {
                            olLayer.setVisible(properties.visible);
                        }

                        if (properties.opacity) {
                            olLayer.setOpacity(properties.opacity);
                        }

                        if (angular.isArray(properties.extent)) {
                            olLayer.setExtent(properties.extent);
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
                        var isNewLayer = (function(olLayer) {
                            // this function can be used to verify whether a new layer instance has
                            // been created. This is needed in order to re-assign styles, opacity
                            // etc...
                            return function(layer) {
                                return layer !== olLayer;
                            };
                        })(olLayer);

                        // set source properties
                        if (isDefined(oldProperties) && !equals(properties.source, oldProperties.source)) {
                            var idx = olLayer.index;
                            layerCollection.removeAt(idx);

                            olLayer = createLayer(properties, projection);

                            if (isDefined(olLayer)) {
                                insertLayer(layerCollection, idx, olLayer);

                                if (detectLayerType(properties) === 'Vector') {
                                    setVectorLayerEvents(defaults.events, map, scope, properties.name);
                                }
                            }
                        }

                        // set opacity
                        if (isDefined(oldProperties) &&
                            properties.opacity !== oldProperties.opacity || isNewLayer(olLayer)) {
                            if (isNumber(properties.opacity) || isNumber(parseFloat(properties.opacity))) {
                                olLayer.setOpacity(properties.opacity);
                            }
                        }

                        // set index
                        if (isDefined(properties.index) && properties.index !== olLayer.index) {
                            removeLayer(layerCollection, olLayer.index);
                            insertLayer(layerCollection, properties.index, olLayer);
                        }

                        // set visibility
                        if (isDefined(oldProperties) &&
                            isBoolean(properties.visible) &&
                            properties.visible !== oldProperties.visible || isNewLayer(olLayer)) {
                            olLayer.setVisible(properties.visible);
                        }

                        // set style
                        if (isDefined(properties.style) &&
                            !equals(properties.style, oldProperties.style) || isNewLayer(olLayer)) {
                            if (!angular.isFunction(properties.style)) {
                                style = createStyle(properties.style);
                            } else {
                                style = properties.style;
                            }
                            olLayer.setStyle(style);
                        }
                    }
                }, true);
            });
        }
    };
});
