(function() {

    var app = angular.module('webapp');

    app.controller('CenterUrlHashController', function($scope, $location, $timeout) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 4,
                centerUrlHash: true
            }
        });
        var promise;
        $scope.$on('centerUrlHash', function(event, centerHash) {
            if (promise) {
                $timeout.cancel(promise);
            }
            promise = $timeout(function() {
                $location.search({ c: centerHash });
            }, 300);
        });
    });

})();
