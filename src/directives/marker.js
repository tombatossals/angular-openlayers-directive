angular.module('openlayers-directive')
       .directive('olMarker', function($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: 'E',
        scope: {
            lat: '=lat',
            lon: '=lon',
            label: '=label'
        },
        require: '^openlayers',
        replace: true,
        template: '<div class="marker popup-label">{{ message }}</div>',

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
                    message: attrs.message
                };

                var marker = createMarker(data, element);
                if (!isDefined(marker)) {
                    $log.error('[AngularJS - Openlayers] Received invalid data on ' +
                               'the marker.');
                }
                markerLayer.getSource().addFeature(marker);
                map.addLayer(markerLayer);

                if (attrs.message) {
                    scope.message = attrs.message;
                    var pos = ol.proj.transform([data.lon, data.lat], 'EPSG:4326', 'EPSG:3857');
                    var ov = createOverlay(element, pos);
                    map.addOverlay(ov);
                }
                scope.$on('$destroy', function() {
                    map.removeLayer(markerLayer);
                });

            });
        }
    };
});
