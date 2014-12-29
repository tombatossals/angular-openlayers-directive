(function() {

    var app = angular.module('webapp');

    app.controller('LayerGeoJSONController', function($scope) {
        angular.extend($scope, {
            europe: {
                lat: 43.88,
                lon: 7.57,
                zoom: 5
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            },
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                },
                ita: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/ITA.geo.json'
                    },
                    style: {
                        fill: {
                            color: 'rgba(255, 0, 255, 0.6)'
                        },
                        stroke: {
                            color: 'white',
                            width: 3
                        }
                    }
                },
                fra: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/FRA.geo.json'
                    },
                    style: {
                        fill: {
                            color: 'rgba(0, 255, 0, 0.6)'
                        },
                        stroke: {
                            color: 'white',
                            width: 3
                        }
                    }
                },
                esp: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/ESP.geo.json'
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
                },
                prt: {
                    source: {
                        type: 'GeoJSON',
                        url: 'examples/json/PRT.geo.json'
                    },
                    style: {
                        fill: {
                            color: 'rgba(0, 0, 255, 0.6)'
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
