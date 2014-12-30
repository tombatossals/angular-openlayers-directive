(function() {

    var app = angular.module('webapp');

    app.controller('LayerStamenMapsController', function($scope) {
        angular.extend($scope, {
            newyork: {
                lat: 40.74,
                lon: -73.97,
                zoom: 12
            },
            layers: {
                main: {
                    source: {
                        type: 'Stamen',
                        layer: 'terrain'
                    }
                }
            }
        });
    });

})();
