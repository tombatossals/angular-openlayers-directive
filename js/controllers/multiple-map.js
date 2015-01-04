(function() {

    var app = angular.module('webapp');

    app.controller('MultipleMapController', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 43.7350,
                lon: -79.3734,
                zoom: 10
            },
            defaults: {
                view: {
                    maxZoom: 11,
                    minZoom: 3
                }
            },
            layers1: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                },
                geojson: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/toronto1.json'
                    }
                }
            },
            layers2: {
                main: {
                    source: {
                        type: 'Stamen',
                        layer: 'terrain'
                    }
                },
                geojson: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/toronto2.json'
                    }
                }
            },
            markers1: {
                one: {
                    lat: 43.75,
                    lon: -79.56
                },
                two: {
                    lat: 43.76,
                    lon: -79.50
                }
            },
            markers2: {
                one: {
                    lat: 43.75,
                    lon: -79.56
                },
                two: {
                    lat: 43.75,
                    lon: -79.45
                },
                three: {
                    name: 'Marker Three',
                    lat: 43.81,
                    lon: -79.26
                }
            }
        });
    });

})();
