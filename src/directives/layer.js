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
            var addLayerToGroup = olHelpers.addLayerToGroup;
            var removeLayerFromGroup = olHelpers.removeLayerFromGroup;
            var getGroup = olHelpers.getGroup;

            olScope.getMap().then(function(map) {
                var projection = map.getView().getProjection();
                var defaults = olMapDefaults.setDefaults(olScope);
                var layerCollection = map.getLayers();
                var olLayer;

                scope.$on('$destroy', function() {
                    if (scope.properties.group) {
                        removeLayerFromGroup(layerCollection, olLayer, scope.properties.group);
                    } else {
                        removeLayer(layerCollection, olLayer.index);
                    }

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
                    var group;
                    var collection;
                    if (!isDefined(olLayer)) {
                        olLayer = createLayer(properties, projection);
                        if (isDefined(properties.group)) {
                            addLayerToGroup(layerCollection, olLayer, properties.group);
                        } else if (isDefined(properties.index)) {
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
                            // not every layer has a setStyle method
                            if (olLayer.setStyle && angular.isFunction(olLayer.setStyle)) {
                                olLayer.setStyle(style);
                            }
                        }

                        if (properties.minResolution) {
                            olLayer.setMinResolution(properties.minResolution);
                        }

                        if (properties.maxResolution) {
                            olLayer.setMaxResolution(properties.maxResolution);
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
                            collection = layerCollection;
                            group = olLayer.get('group');

                            if (group) {
                                collection = getGroup(layerCollection, group).getLayers();
                            }

                            collection.removeAt(idx);

                            olLayer = createLayer(properties, projection);
                            olLayer.set('group', group);

                            if (isDefined(olLayer)) {
                                insertLayer(collection, idx, olLayer);

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
                            collection = layerCollection;
                            group = olLayer.get('group');

                            if (group) {
                                collection = getGroup(layerCollection, group).getLayers();
                            }

                            removeLayer(collection, olLayer.index);
                            insertLayer(collection, properties.index, olLayer);
                        }

                        // set group
                        if (isDefined(properties.group) && properties.group !== oldProperties.group) {
                            removeLayerFromGroup(layerCollection, olLayer, oldProperties.group);
                            addLayerToGroup(layerCollection, olLayer, properties.group);
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
                            // not every layer has a setStyle method
                            if (olLayer.setStyle && angular.isFunction(olLayer.setStyle)) {
                                olLayer.setStyle(style);
                            }
                        }

                        //set min resolution
                        if (!equals(properties.minResolution, oldProperties.minResolution) || isNewLayer(olLayer)) {
                            if (isDefined(properties.minResolution)) {
                                olLayer.setMinResolution(properties.minResolution);
                            }
                        }

                        //set max resolution
                        if (!equals(properties.maxResolution, oldProperties.maxResolution) || isNewLayer(olLayer)) {
                            if (isDefined(properties.maxResolution)) {
                                olLayer.setMaxResolution(properties.maxResolution);
                            }
                        }
                    }
                }, true);
            });
        }
    };
});
