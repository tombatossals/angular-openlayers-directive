angular.module('openlayers-directive').directive('olEvents', function($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: ['openlayers', '?olLayers'],
        link: function(scope, element, attrs, controller) {
            var setEvents     = olHelpers.setEvents;
            var isDefined     = olHelpers.isDefined;
            var mapController = controller[0];
            var olScope       = mapController.getOpenlayersScope();

            olScope.getMap().then(function(map) {

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
