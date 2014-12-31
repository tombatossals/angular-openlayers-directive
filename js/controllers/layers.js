(function() {

    var app = angular.module('webapp');
    app.controller('LayerController', function($scope) {
        $scope.sources = {
            openstreetmap: {
                name: 'OpenStreetMap',
                type: 'OSM'
            },
            mapboxTerrain: {
                name: 'MapBox Terrain',
                type: 'TileJSON',
                url: 'https://api.tiles.mapbox.com/v3/examples.map-i86nkdio.jsonp'
            },
            mapboxNight: {
                name: 'MapBox Night',
                type: 'TileJSON',
                url: 'https://api.tiles.mapbox.com/v3/examples.map-0l53fhk2.jsonp'
            },
            mapboxGeographyclass: {
                name: 'Mapbox Geography',
                type: 'TileJSON',
                url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
            }
        };

        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 3
            },
            layers: {
                main: {
                    source: $scope.sources.mapboxGeographyclass
                }
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            }
        });
    });

})();
