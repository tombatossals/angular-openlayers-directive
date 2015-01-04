(function() {

    var app = angular.module('webapp');

    app.controller('LayerStaticImageController', function($scope) {
        angular.extend($scope, {
            center: {
                coord: [900, 600],
                zoom: 3
            },
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
