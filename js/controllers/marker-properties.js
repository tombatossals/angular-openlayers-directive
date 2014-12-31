(function() {

    var app = angular.module('webapp');

    app.controller('MarkerPropertiesController', function($scope) {
        angular.extend($scope, {
            center: {
                lat: 42.9515,
                lon: -8.6619,
                zoom: 9
            },
            styleCheckboxes: function() {
                $('.ui.checkbox').checkbox();
                return true;
            },
            changeShowLabel: function(marker) {
                marker.label.show = !marker.label.show;
            },
            changeShowLabelOnMouseOver: function(marker) {
                marker.label.showOnMouseOver = !marker.label.showOnMouseOver;
            },
            defaults: {
                interactions: {
                    mouseWheelZoom: false
                }
            },
            markers: {
                finisterre: {
                    name: 'Finisterre',
                    lat: 42.907800500000000000,
                    lon: -9.265031499999964000,
                    label: {
                        message: 'Finisterre',
                        show: true,
                        showOnMouseOver: true
                    }
                },
                santiago: {
                    name: 'Santiago de Compostela',
                    lat: 42.880596200000010000,
                    lon: -8.544641200000001000,
                    label: {
                        message: 'Santiago de Compostela',
                        show: true,
                        showOnMouseOver: true
                    }
                }
            }
        });
    });

})();
