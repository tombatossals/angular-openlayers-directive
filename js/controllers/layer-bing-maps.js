(function() {

    var app = angular.module('webapp');

    app.controller('LayerBingMapsController', function($scope) {
        angular.extend($scope, {
            quebec: {
                lat: 46.823,
                lon: -71.205,
                zoom: 12
            },
            layers: {
                main: {
                    source: {
                        name: 'Bing Maps',
                        type: 'BingMaps',
                        key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
                        imagerySet: 'Road'
                    }
                }
            }
        });
    });

})();
