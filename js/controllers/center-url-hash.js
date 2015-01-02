(function() {

    var app = angular.module('webapp');

    app.controller('CenterUrlHashController', function($scope, $location) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 4,
                centerUrlHash: true
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            }
        });

        var first;
        if ($location.search().c) {
            first = $location.search().c;
            $location.search({ c: '' });
        }

        $scope.$on('centerUrlHash', function(event, centerHash) {
            if (first) {
                centerHash = first;
                first = undefined;
            }
            $location.search({ c: centerHash });
        });
    });

})();
