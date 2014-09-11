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
                    if (!isDefined(layers.main) ||
                        !isDefined(layers.main.source) || !isDefined(layers.main.source.type)) {
                        $log.warn("[AngularJS - OpenLayers] At least one layer has to be defined.");
                        layers = angular.copy(defaults.layers);
                    }

                    if (!equals(layers.main, oldLayers.main)) {
                        if (isDefined(olLayers.main)) {
                            map.removeLayer(olLayers.main);
                            delete olLayers.main;
                        }
                        var l = createLayer(layers.main);
                        map.addLayer(l);
                        olLayers.main = l;
                        olData.setLayers(olLayers, attrs.id);
                        _olLayers.resolve(olLayers);
                    }
                }, true);
            });
        }
    };
});
