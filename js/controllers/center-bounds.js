(function() {

    var app = angular.module('webapp');

    app.controller('CenterBoundsController', function($scope) {
        angular.extend($scope, {
            cairo: {
                lat: 30.0047,
                lon: 31.2586,
                zoom: 10,
                bounds: []
            }
        });
    });

})();
