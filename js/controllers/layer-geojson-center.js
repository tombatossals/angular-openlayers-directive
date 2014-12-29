(function() {

    var app = angular.module('webapp');

    app.controller('LayerGeoJSONCenterController', function($scope, olData) {
        angular.extend($scope, {
            japan: {
                lat: 27.26,
                lon: 78.86,
                zoom: 3
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            },
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                },
                geojson: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/JPN.geo.json'
                    }
                }
            }
        });

        $scope.centerJSON = function() {
            olData.getMap().then(function(map) {
                olData.getLayers().then(function(layers) {
                    var extent = layers.geojson.getSource().getExtent();
                    map.getView().fitExtent(extent, map.getSize());
                });
            });
        };
    });

})();
