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
            var olControlOps;
            var getControlClasses = olHelpers.getControlClasses;
            var controlClasses = getControlClasses();

            olScope.getMap().then(function(map) {

                scope.$on('$destroy', function() {
                    map.removeControl(olControl);
                });

                scope.$watch('properties', function(properties) {
                    if (!isDefined(properties)) {
                        return;
                    }

                    initCtrls(properties);
                });

                function initCtrls(properties) {
                    if (properties && properties.control) {
                        // the control instance is already defined,
                        // so simply use it and go ahead

                        // is there already a control, so destroy and recreate it?
                        if (olControl) {
                            map.removeControl(olControl);
                        }

                        olControl = properties.control;
                        map.addControl(olControl);
                    } else {

                        // the name is the key to instantiate an ol3 control
                        if (attrs.name) {
                            if (isDefined(properties)) {
                                olControlOps = properties;
                            }

                            // is there already a control, so destroy and recreate it?
                            if (olControl) {
                                map.removeControl(olControl);
                            }

                            olControl = new controlClasses[attrs.name](olControlOps);
                            map.addControl(olControl);
                        }
                    }
                }

                initCtrls(scope.properties);

            });

        }
    };
});
