(function() {

    var app = angular.module('webapp');

    app.controller('MainController', function($scope, $http) {
        $http.get('json/examples.json').success(function(data) {
            $scope.examples = data;
        });

        $scope.$on('$routeChangeSuccess', function(event, route) {
            $scope.active = route.params.example;
        });
    });

})();
