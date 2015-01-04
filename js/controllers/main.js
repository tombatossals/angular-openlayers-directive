(function() {

    var app = angular.module('webapp');

    app.controller('MainController', function($scope, $http, $q) {

        var examples = $q.defer();

        $scope.$on('$routeChangeSuccess', function(event, route) {
            var url = route.params.example;
            $scope.section = route.params.section;

            Prism.highlightAll();
            console.log(url);

            examples.promise.then(function(examples) {
                var sectionExamples = examples[$scope.section];
                for (var i in sectionExamples) {
                    var example = sectionExamples[i];
                    if (example.url === url) {
                        $scope.activeExample = example;
                    }
                }
            });
        });

        $http.get('json/examples.json').success(function(data) {
            if (!$scope.section) {
                $scope.section = 'first';
            }
            $scope.examples = data.examples;
            examples.resolve(data.examples);
        });
    });

})();
