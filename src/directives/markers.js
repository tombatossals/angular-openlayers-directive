angular.module('openlayers-directive')
       .directive('olMarkers', function($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: ['openlayers', '?layers'],

        link: function(scope, element, attrs, controller) {
            var mapController = controller[0];
            var isDefined = olHelpers.isDefined;
            var olScope  = mapController.getOpenlayersScope();
            var createMarkerLayer = olHelpers.createMarkerLayer;
            var createMarker = olHelpers.createMarker;

            mapController.getMap().then(function(map) {
                var olMarkers = {};
                var getLayers;

                // If the layers attribute is used, we must wait until the layers are created
                if (isDefined(controller[1]) && controller[1] !== null) {
                    getLayers = controller[1].getLayers;
                } else {
                    getLayers = function() {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    };
                }

                getLayers().then(function() {
                    olData.setMarkers(olMarkers, attrs.id);

                    // Create the markers layer and add it to the map
                    var markerLayer = createMarkerLayer();

                    olScope.$watch('markers', function(newMarkers) {
                        // Delete markers from the array
                        for (var name in olMarkers) {
                            if (!isDefined(olMarkers) || !isDefined(newMarkers[name])) {
                                markerLayer.getSource().removeFeature(olMarkers[name]);
                                delete olMarkers[name];
                            }
                        }

                        // add new markers
                        for (var newName in newMarkers) {
                            if (newName.search('-') !== -1) {
                                $log.error('[AngularJS - Openlayers] The marker can\'t use a "-" on ' +
                                           'his key name: "' + newName + '".');
                                continue;
                            }

                            if (!isDefined(olMarkers[newName])) {
                                var markerData = newMarkers[newName];
                                var marker = createMarker(markerData);
                                if (!isDefined(marker)) {
                                    $log.error('[AngularJS - Openlayers] Received invalid data on ' +
                                               'the marker ' + newName + '.');
                                    continue;
                                }
                                olMarkers[newName] = marker;
                                markerLayer.getSource().addFeature(marker);
                            }
                        }
                        map.addLayer(markerLayer);
                    }, true);
                });
            });
        }
    };
});
