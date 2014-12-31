(function() {

    var app = angular.module('webapp');

    app.controller('LayerGeoJSONInlineController', function($scope, $http) {
        $http.get('examples/json/ITA.geo.json').success(function(data) {
            var italy = data;
            $scope.layers.ita = {
                source: {
                    type: 'GeoJSON',
                    geojson: {
                        object: italy,
                        projection: 'EPSG:3857'
                    }
                },
                style: {
                    fill: {
                        color: 'rgba(255, 0, 0, 0.6)'
                    },
                    stroke: {
                        color: 'white',
                        width: 3
                    }
                }
            };
        });

        angular.extend($scope, {
            europe: {
                lat: 43.88,
                lon: 7.57,
                zoom: 5
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
                }
            }
        });

    });

})();
