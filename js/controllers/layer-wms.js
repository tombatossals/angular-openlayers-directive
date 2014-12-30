(function() {

    var app = angular.module('webapp');

    app.controller('LayerWMSController', function($scope) {
        angular.extend($scope, {
            usa: {
                lat: 37.7,
                lon: -96.67,
                zoom: 4
            },
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                },
                wms: {
                    source: {
                        type: 'ImageWMS',
                        url: 'http://demo.opengeo.org/geoserver/wms',
                        params: { LAYERS: 'topp:states' }
                    }
                }
            }
        });
    });

})();
