angular.module('openlayers-directive').directive('events', function($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: ['openlayers', '?layers'],
        link: function(scope, element, attrs, controller) {
            var setEvents     = olHelpers.setEvents;
            var isDefined     = olHelpers.isDefined;
            var mapController = controller[0];
            var olScope       = mapController.getOpenlayersScope();

            mapController.getMap().then(function(map) {

                var getLayers;
                if (isDefined(controller[1]) && controller[1] !== null) {
                    getLayers = controller[1].getLayers;
                } else {
                    getLayers = function() {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    };
                }

                getLayers().then(function(layers) {
                    olScope.$watch('events', function(events) {
                        setEvents(events, map, olScope, layers);
                    });
                });
            });
        }
    };
});
