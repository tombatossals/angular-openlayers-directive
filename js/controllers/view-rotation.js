(function() {

    var app = angular.module('webapp');

    app.controller('ViewRotationController', function($scope) {
        angular.extend($scope, {
            degrees: 0,
            center: {
                lat: 18.17,
                lon: -66.37,
                zoom: 8
            },
            view: {
                rotation: 0
            }
        });

        $scope.degreesToRadians = function() {
            $scope.view.rotation = parseFloat($scope.degrees, 10).toFixed(2) * (Math.PI / 180);
        };

        $scope.$watch('view.rotation', function(value) {
            $scope.degrees = (value * 180 / Math.PI).toFixed(2);
        });
    });

})();
