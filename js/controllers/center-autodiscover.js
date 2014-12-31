(function() {
    var app = angular.module('webapp');

    app.controller('CenterAutodiscoverController',  function($scope) {
        angular.extend($scope, {
            center: {
                lat: 0,
                lon: 0,
                autodiscover: false
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            }
        });
    });
})();
