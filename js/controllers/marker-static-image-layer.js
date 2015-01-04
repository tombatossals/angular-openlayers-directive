(function() {

    var app = angular.module('webapp');

    app.controller('MarkerStaticImageLayerController', function($scope) {
        var markers = [
            {
                coord: [853, 670],
                projection: 'pixel',
                label: {
                    message: '<img src="examples/images/eiffel.jpg" />',
                    show: false,
                    showOnMouseOver: true
                }
            },
            {
                coord: [980, 580],
                projection: 'pixel',
                label: {
                    message: '<img src="examples/images/gizah.jpg" />',
                    show: false,
                    showOnMouseOver: true
                }
            }
        ];
        angular.extend($scope, {
            center: {
                coord: [900, 600],
                zoom: 2
            },
            markers: markers,
            defaults: {
                view: {
                    projection: 'pixel',
                    extent: [0, 0, 1800, 1200]
                }
            },
            layers: {
                main: {
                    source: {
                        type: 'ImageStatic',
                        url: 'http://blog.wallpops.com/wp-content/upLoads/2013/05/WPE0624.jpg',
                        imageSize: [1800, 1200]
                    }
                }
            }
        });
    });

})();
