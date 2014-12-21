var app = angular.module('webapp');
app.controller('LayerController', function($scope) {
    $scope.sources = {
        openstreetmap: {
            name: 'OpenStreetMap',
            type: 'OSM'
        },
        mapboxStreets: {
            name: 'MapBox Streets',
            type: 'TileJSON',
            url: 'https://api.tiles.mapbox.com/v3/tombatossals.map-fmyyujjl.jsonp'
        },
        mapboxTerrain: {
            name: 'MapBox Terrain',
            type: 'TileJSON',
            url: 'https://api.tiles.mapbox.com/v3/tombatossals.jbn2nnon.jsonp'
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
        }
    });
});
