(function() {

    var app = angular.module('webapp');
    app.controller('LayerOpacityController', function($scope) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 3
            },
            layers: {
                mapbox: {
                    visible: true,
                    opacity: 0.6,
                    source: {
                        type: 'TileJSON',
                        url: 'https://api.tiles.mapbox.com/v3/examples.map-i86nkdio.jsonp'
                    }
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
