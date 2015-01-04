(function() {

    var app = angular.module('webapp');

    app.controller('MarkerRenderHTMLController', function($scope) {
        var markers = [
            {
                name: 'Eiffel Tower',
                lat: 48.858093,
                lon: 2.294694,
                label: {
                    message: '<img src="examples/images/eiffel.jpg" />',
                    show: false,
                    showOnMouseOver: true
                }
            },
            {
                name: 'Notre Dame de Paris',
                lat: 48.852966,
                lon: 2.349902,
                label: {
                    message: '<img src="examples/images/notredame.jpg" />',
                    show: true,
                    showOnMouseOver: true
                }
            },
            {
                name: 'Palace of Versailles',
                lat: 48.804722,
                lon: 2.121782,
                label: {
                    message: '<img src="examples/images/versailles.jpg" />',
                    show: false,
                    showOnMouseOver: true
                }
            }
        ];

        angular.extend($scope, {
            center: {
                lat: 48.828093,
                lon: 2.294694,
                zoom: 11
            },
            markers: markers
        });

        $scope.centerAndShow = function(marker) {
            if (!marker.label.show) {
                markers.filter(function(marker) {
                    marker.label.show = false;
                });
                $scope.center.lat = marker.lat;
                $scope.center.lon = marker.lon;
            }
            marker.label.show = !marker.label.show;
        };

    });

})();
