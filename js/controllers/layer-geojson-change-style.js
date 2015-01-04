(function() {

    var app = angular.module('webapp');

    app.controller('LayerGeoJSONChangeStyleController', function($scope) {
        angular.extend($scope, {
            europe: {
                lat: 39.2,
                lon: -1.27,
                zoom: 5
            },
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                },
                esp: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/ESP.geo.json'
                    },
                    style: {
                        fill: {
                            color: 'red'
                        },
                        stroke: {
                            color: 'white',
                            width: 3
                        }
                    }
                }
            }
        });
    });

})();
