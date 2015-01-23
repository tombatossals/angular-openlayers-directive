angular.module('openlayers-directive')
       .directive('olControl', function($log, $q, olData, olMapDefaults, olHelpers) {

    return {
        restrict: 'E',
        scope: false,
        replace: false,
        require: '^openlayers',
        link: function(scope, element, attrs, controller) {
            var olScope   = controller.getOpenlayersScope();
            var control;

            olScope.getMap().then(function(map) {
                var getControlClasses = olHelpers.getControlClasses;
                var controlClasses = getControlClasses();
                if (attrs.name) {
                    control = new controlClasses[attrs.name]();
                    map.addControl(control);
                }

                scope.$on('$destroy', function() {
                    map.removeControl(control);
                });
            });
        }
    };
});
