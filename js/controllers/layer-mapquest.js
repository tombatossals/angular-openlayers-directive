(function() {

    var app = angular.module('webapp');

    app.controller('LayerMapQuestController', function($scope) {
        angular.extend($scope, {
            quebec: {
                lat: 46.823,
                lon: -71.205,
                zoom: 3
            },
            mapquest: {
                source: {
                    type: 'MapQuest',
                    layer: 'sat'
                }
            }
        });
    });

})();
