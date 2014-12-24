var app = angular.module('webapp');

app.controller('CustomController', function($scope) {
    angular.extend($scope, {
        london: {
            lat: 51.505,
            lon: -0.09,
            zoom: 8
        },
        defaults: {
            layers: {
                main: {
                    source: {
                        type: 'OSM',
                        url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
                    }
                }
            },
            interactions: {
                mouseWheelZoom: false
            },
            controls: {
                zoom: false,
                rotate: false,
                attribution: false
            }
        }
    });
});
