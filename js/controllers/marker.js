(function() {

    var app = angular.module('webapp');

    app.controller('MarkerController', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 51.505,
                lon: -0.09,
                zoom: 8
            }
        });
    });

})();
