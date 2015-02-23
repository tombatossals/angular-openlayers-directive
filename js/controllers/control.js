(function() {

    var app = angular.module('webapp');

    app.controller('ControlController', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 43.88,
                lon: 7.57,
                zoom: 4
            },
            view: {
                rotation: -1
            },
            controls: [
                { name: 'zoom', active: true },
                { name: 'rotate', active: true },
                { name: 'attribution', active: true }
            ]
        });

        $scope.degreesToRadians = function() {
            $scope.view.rotation = parseFloat($scope.degrees, 10).toFixed(2) * (Math.PI / 180);
        };

        $scope.$watch('view.rotation', function(value) {
            $scope.degrees = (value * 180 / Math.PI).toFixed(2);
        });
    });

})();
