(function() {

    var app = angular.module('webapp');

    app.controller('CustomController', function($scope) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 8
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: true
                }
            }
        });
    });

})();
