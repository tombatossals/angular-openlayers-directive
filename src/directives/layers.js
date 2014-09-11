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
                isArray     = olHelpers.isArray,
                equals      = olHelpers.equals,
                olLayers    = [],
                olScope     = controller.getOpenlayersScope(),
                createLayer = olHelpers.createLayer;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                olScope.$watch("layers", function(layers, oldLayers) {
                    if (!isArray(layers) || layers.length === 0 || !isDefined(layers[0].source) || !isDefined(layers[0].source.type)) {
                        $log.warn("[AngularJS - OpenLayers] At least one layer has to be defined.");
                        layers = angular.copy(defaults.layers);
                    }

                    for (var i=0; i<layers.length; i++) {
                        var layer = layers[i];
                        var oldLayer = oldLayers[i];
                        var olLayer = olLayers[i];
                        if (!equals(layer, oldLayer)) {
                            if (isDefined(olLayer)) {
                                map.removeLayer(olLayer);
                                olLayers.pop(olLayer);
                            }
                        }
                        var l = createLayer(layer);
                        map.addLayer(l);
                        olLayers.push(l);
                    }
                }, true);
                _olLayers.resolve(olLayers);
                olData.setLayers(olLayers, attrs.id);
            });
        }
    };
});
