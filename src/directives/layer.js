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
            var createStyle = olHelpers.createStyle;
            var isBoolean   = olHelpers.isBoolean;
            var isNumber    = olHelpers.isNumber;

            olScope.getMap().then(function(map) {
                var projection = map.getView().getProjection();
                var olLayer;

                if (!isDefined(scope.properties) ||
                    !isDefined(scope.properties.source) ||
                    !isDefined(scope.properties.source.type)) {
                    $log.warn('[AngularJS - OpenLayers] Layer definition is not valid.');
                    return;
                }

                scope.$on('$destroy', function() {
                    map.removeLayer(olLayer);
                });

                if (!isDefined(scope.properties.visible)) {
                    scope.properties.visible = true;
                }

                if (!isDefined(scope.properties.opacity)) {
                    scope.properties.opacity = 1;
                }

                scope.$watch('properties', function(properties, oldProperties) {

                    var style;
                    if (!isDefined(olLayer)) {
                        olLayer = createLayer(properties, projection);
                        map.addLayer(olLayer);

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
                            olLayer.setStyle(properties);
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
                                olLayer.setStyle(properties);
                            }
                        }
                    }
                }, true);
            });
        }
    };
});
