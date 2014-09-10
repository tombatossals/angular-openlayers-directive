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
                equals      = olHelpers.equals,
                olLayers    = {},
                olScope     = controller.getOpenlayersScope(),
                createLayer = olHelpers.createLayer;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                olScope.$watch("layers", function(layers, oldLayers) {
                    if (!isDefined(layers) || !isDefined(layers.main) || !isDefined(layers.main.type)) {
                        $log.warn("[AngularJS - OpenLayers] At least one main layer has to be defined.");
                        layers = angular.copy(defaults.layers);
                    }

                    // Check if the main layer is the same type but different URL
                    if (isDefined(layers.main) && isDefined(layers.main.type) &&
                        isDefined(oldLayers.main) && isDefined(oldLayers.main.type) &&
                        layers.main.type === oldLayers.main.type && layers.main.url !== oldLayers.main.url) {
                            olLayers.main.getSource().setUrl(layers.main.url);
                            return;
                    }

                    if (!isDefined(olLayers.main) || !equals(layers.main, oldLayers.main)) {
                        if (isDefined(olLayers.main) && oldLayers.main.type !== layers.main.type) {
                            map.removeLayer(olLayers.main);
                        }
                        var l = createLayer(layers.main);
                        map.addLayer(l);
                        olLayers.main = l;
                    }
                    _olLayers.resolve(olLayers);
                }, true);
                olData.setLayers(olLayers, attrs.id);
            });
        }
    };
});
