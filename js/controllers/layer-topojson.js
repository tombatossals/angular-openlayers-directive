(function() {

    var app = angular.module('webapp');

    app.controller('LayerTopoJSONController', function($scope) {
        angular.extend($scope, {
            europe: {
                lat: 43.88,
                lon: 7.57,
                zoom: 3
            },
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                },
                topojson: {
                    source: {
                        type: 'TopoJSON',
                        url: 'examples/json/world.topo.json'
                    },
                    style: {
                        fill: {
                            color: 'rgba(255, 0, 0, 0.6)'
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
