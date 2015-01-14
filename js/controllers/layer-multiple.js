(function() {

    var app = angular.module('webapp');

    app.controller('LayerMultipleController', function($scope) {
        angular.extend($scope, {
            europe: {
                lat: 43.88,
                lon: 7.57,
                zoom: 3
            },
            layers: [
                {
                    name: 'Mapbox Geography Class',
                    active: false,
                    opacity: 1,
                    source: {
                        type: 'TileJSON',
                        url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
                    }
                },
                {
                    active: true,
                    name: 'Bing Maps',
                    opacity: 0.8,
                    source: {
                        type: 'BingMaps',
                        key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
                        imagerySet: 'Road'
                    }
                },
                {
                    active: true,
                    name: 'TopoJSON of Europe',
                    opacity: 0.3,
                    source: {
                        type: 'TopoJSON',
                        url: 'examples/json/world.topo.json'
                    },
                    style: {
                        fill: {
                            color: 'yellow'
                        },
                        stroke: {
                            color: 'white',
                            width: 3
                        }
                    }
                }
            ]
        });
    });

})();
