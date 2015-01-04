(function() {

    var app = angular.module('webapp');

    app.controller('MarkerAddRemoveController', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 51.505,
                lon: -0.09,
                zoom: 7
            },
            markers: [
                {
                    name: 'London',
                    active: true,
                    lat: 51.505,
                    lon: -0.09
                }, {
                    name: 'Bath',
                    active: true,
                    lat: 51.375,
                    lon: -2.35
                }, {
                    name: 'Canterbury',
                    active: false,
                    lat: 51.267,
                    lon: 1.083
                }
            ]
        });
    });

})();
