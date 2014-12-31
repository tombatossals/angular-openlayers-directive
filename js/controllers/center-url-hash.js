(function() {

    var app = angular.module('webapp');

    app.controller('CenterUrlHashController', function($scope, $location) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 4,
                centerUrlHash: true
            }
        });
        $scope.$on('centerUrlHash', function(event, centerHash) {
            $location.search({ c: centerHash });
        });
    });

})();
