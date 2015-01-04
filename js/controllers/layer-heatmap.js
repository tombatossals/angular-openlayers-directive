(function() {

    var app = angular.module('webapp');

    app.controller('LayerHeatmapController', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 43.88,
                lon: 7.57,
                zoom: 2
            },
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                },
                heatmap: {
                    type: 'Heatmap',
                    source: {
                        type: 'KML',
                        projection: 'EPSG:3857',
                        url: 'examples/kml/earthquakes.kml',
                        radius: 5
                    }
                }
            }
        });
    });

})();
