angular.module('openlayers-directive')
    .directive('olControl', function($log, $q, olData, olMapDefaults, olHelpers) {

        return {
            restrict: 'E',
            scope: {
                properties: '=olControlProperties'
            },
            replace: false,
            require: '^openlayers',
            link: function(scope, element, attrs, controller) {
                var isDefined   = olHelpers.isDefined;
                var olScope   = controller.getOpenlayersScope();
                var olControl;

                olScope.getMap().then(function(map) {
                    var getControlClasses = olHelpers.getControlClasses;
                    var controlClasses = getControlClasses();

                    if (!isDefined(scope.properties)) {
                        if (attrs.name) {
                            olControl = new controlClasses[attrs.name]();
                            map.addControl(olControl);
                        }
                        return;
                    }

                    if (isDefined(scope.properties.control)) {
                        olControl = scope.properties.control;
                        map.addControl(olControl);
                    }

                    scope.$on('$destroy', function() {
                        map.removeControl(olControl);
                    });
                });
            }
        };
    });
