angular.module('openlayers-directive').directive('compile', ['$compile','$rootScope', function($compile,$rootScope){
    return function(scope, element, attrs) {
        scope.$watch(
            function(scope) {
                // watch the 'compile' expression for changes
                return scope.$eval(attrs.compile);
            },
            function(value) {
                var content = $compile(value)($rootScope);
                element.append(content);
            }
        );
    };
}]);
