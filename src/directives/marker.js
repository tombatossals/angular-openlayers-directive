angular.module('openlayers-directive')
       .directive('olMarker', function($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: 'E',
        scope: {
            lat: '=lat',
            lon: '=lon',
            message: '=message'
        },
        require: '^openlayers',
        replace: false,

        link: function(scope, element, attrs, olScope) {
            var isDefined = olHelpers.isDefined;
            var createMarkerLayer = olHelpers.createMarkerLayer;
            var createMarker = olHelpers.createMarker;
            var createOverlay = olHelpers.createOverlay;

            olScope.getMap().then(function(map) {
                var olMarkers = {};

                olData.setMarkers(olMarkers, attrs.id);

                // Create the markers layer and add it to the map
                var markerLayer = createMarkerLayer();
                var data = {
                    lat: scope.lat,
                    lon: scope.lon,
                    message: scope.message
                };

                var marker = createMarker(data, element);
                if (!isDefined(marker)) {
                    $log.error('[AngularJS - Openlayers] Received invalid data on ' +
                               'the marker.');
                }
                markerLayer.getSource().addFeature(marker);
                map.addLayer(markerLayer);

                if (scope.message) {
                    var ov = createOverlay(element);
                    map.addOverlay(ov);
                }
                scope.$on('$destroy', function() {
                    map.removeLayer(markerLayer);
                });

            });
        }
    };
});
