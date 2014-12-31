(function() {

    var app = angular.module('webapp');

    app.controller('EventDefaultsController', function($scope) {
        angular.extend($scope, {
            london: {
                lat: 51.505,
                lon: -0.09,
                zoom: 4
            },
            events: {
                map: ['singleclick', 'pointermove']
            },
            mouseposition: {},
            mouseclickposition: {},
            projection: 'EPSG:3857',
            changeProjection: function(proj) {
                $scope.projection = proj;
            }
        });

        $scope.$on('openlayers.map.pointermove', function(event, coord) {
            $scope.$apply(function() {
                if ($scope.projection === coord.projection) {
                    $scope.mouseposition = coord;
                } else {
                    var p = ol.proj.transform([coord.lon, coord.lat], coord.projection, $scope.projection);
                    $scope.mouseposition = {
                        lat: p[1],
                        lon: p[0],
                        projection: $scope.projection
                    };
                }
            });
        });

        $scope.$on('openlayers.map.singleclick', function(event, coord) {
            $scope.$apply(function() {
                if ($scope.projection === coord.projection) {
                    $scope.mouseclickposition = coord;
                } else {
                    var p = ol.proj.transform([coord.lon, coord.lat], coord.projection, $scope.projection);
                    $scope.mouseclickposition = {
                        lat: p[1],
                        lon: p[0],
                        projection: $scope.projection
                    };
                }
            });
        });
    });

})();
