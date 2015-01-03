(function() {

    var app = angular.module('webapp');

    app.controller('MainController', function($scope, $http) {
        $scope.getExample = function() {
            for (var i in $scope.examples) {
                if ($scope.examples[i].url === $scope.activeExample) {
                    return $scope.examples[i];
                }
            }
        };

        $http.get('json/examples.json').success(function(data) {
            if (!$scope.section) {
                $scope.section = 'first';
            }
            $scope.examples = data.examples;
        });

        $scope.$on('$routeChangeSuccess', function(event, route) {
            $scope.activeExample = route.params.example;
            $scope.section = route.params.section;
        });

    });

})();
