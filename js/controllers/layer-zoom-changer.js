(function() {

    var app = angular.module('webapp');
    app.controller('LayerZoomChangerController', function($scope) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 10
            },
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                }
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            }
        });

        $scope.$watch('london.zoom', function(zoom) {
            $scope.layers.main.source.url = (zoom > 12) ?
                'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png' :
                'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        });
    });

})();
