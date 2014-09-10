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
            var isDefined = olHelpers.isDefined,
                olLayers = {},
                olScope  = controller.getOpenLayersScope(),
                layers = olScope.layers,
                createLayer = olHelpers.createLayer;

            controller.getMap().then(function(map) {
                // Do we have a baselayers property?
                if (!isDefined(layers) || !isDefined(layers.main) || !isDefined(layers.main.type)) {
                    $log.error('[AngularJS - OpenLayers] At least one main layer has to be defined');
                    return;
                }

                olLayers.baselayers = {};
                olLayers.overlays = {};

                var defaults = olMapDefaults.getDefaults(attrs.id);

                olScope.$watch("layers", function(layers) {
                    if (!isDefined(layers) || !isDefined(layers.main) || !isDefined(layers.main.type)) {
                        $log.warn("[AngularJS - OpenLayers] The 'layers' definition isn't defined correctly.");
                        layers = angular.copy(defaults.layers);
                    }

                    var l = createLayer(layers.main);
                    map.addLayer(l);
                    olLayers.main = l;
                });

                _olLayers.resolve(olLayers);
                olData.setLayers(olLayers, attrs.id);

            });
        }
    };
});
