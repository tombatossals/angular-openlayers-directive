(function() {

    var app = angular.module('webapp');

    app.controller('LayerGeoJSONCenterController', function($scope, olData) {
        angular.extend($scope, {
            japan: {
                lat: 27.26,
                lon: 78.86,
                zoom: 3
            },
            geojson: {
                source: {
                    type: 'GeoJSON',
                    url: 'examples/json/JPN.geo.json'
                }
            }
        });

        $scope.centerJSON = function() {
            olData.getMap().then(function(map) {
                var layers = map.getLayers();
                layers.forEach(function(layer) {
                    if (layer.get('name') === 'geojson') {
                        var extent = layer.getSource().getExtent();
                        map.getView().fitExtent(extent, map.getSize());
                    }
                });
            });
        };
    });

})();
