(function() {

    var app = angular.module('webapp');

    app.controller('CenterConstrainZoomController', function($scope) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 5
            },
            defaults: {
                view: {
                    maxZoom: 9,
                    minZoom: 6
                }
            }
        });
    });

})();
