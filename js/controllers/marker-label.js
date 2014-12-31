(function() {

    var app = angular.module('webapp');

    app.controller('MarkerLabelController', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 41.02,
                lon: 29.08,
                zoom: 11
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            }
        });
    });

})();
