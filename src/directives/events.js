angular.module("openlayers-directive").directive('events', function ($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: [ 'openlayers', 'layers' ],
        link: function(scope, element, attrs, controller) {
            var sendGeoJSONEvents = olHelpers.sendGeoJSONEvents,
                isDefined = olHelpers.isDefined,
                isArray = olHelpers.isArray,
                mapController = controller[0],
                olScope     = mapController.getOpenlayersScope();

            mapController.getMap().then(function(map) {

                var getLayers;
                if (isDefined(controller[1])) {
                    getLayers = controller[1].getLayers;
                } else {
                    getLayers = function() {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    };
                }

                getLayers().then(function(layers) {
                    var defaults = olMapDefaults.getDefaults(attrs.id);
                    olScope.$watch("events", function(events) {
                        if (isDefined(events.layers) && isArray(events.layers.geojson)) {
                            angular.forEach(events.layers.geojson, function(eventType) {
                                console.log(events, defaults, layers);
                                sendGeoJSONEvents(eventType, map, olScope);
                            });
                        }
                    });
                });
            });
        }
    };
});
