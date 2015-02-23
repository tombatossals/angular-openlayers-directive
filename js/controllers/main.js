(function() {

    var app = angular.module('webapp');

    app.controller('MainController', function($scope, $http, $q, $timeout) {

        var examples = $q.defer();

        $scope.$on('$routeChangeSuccess', function(event, route) {
            var url = route.params.example;
            $scope.section = route.params.section;

            var getSource = function(example) {
                $http.get(example.extUrl).success(function(data) {
                    example.source = data;
                    $timeout(function() {
                        Prism.highlightAll();
                    }, 200);
                });
            };

            examples.promise.then(function(examples) {
                console.log('section', $scope.section);
                if (!$scope.section) {
                    $scope.section = 'first';
                }
                var sectionExamples = examples[$scope.section];
                for (var i in sectionExamples) {
                    var example = sectionExamples[i];
                    if (example.url === url) {
                        $scope.activeExample = example;
                        getSource(example);
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
