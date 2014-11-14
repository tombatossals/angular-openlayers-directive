angular.module('openlayers-directive')
       .directive('olControls', function($log, $q, olData, olMapDefaults, olHelpers) {

    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: 'openlayers',
        link: function(scope, element, attrs, controller) {
            var olScope   = controller.getOpenlayersScope();

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                var detectControls = olHelpers.detectControls;
                var getControlClasses = olHelpers.getControlClasses;
                var controls = olScope.controls;

                for (var control in defaults.controls) {
                    if (!controls.hasOwnProperty(control)) {
                        controls[control] = defaults.controls[control];
                    }
                }

                olScope.$watch('controls', function(controls) {
                    var actualControls = detectControls(map.getControls());
                    var controlClasses = getControlClasses();
                    var c;

                    // Delete the controls removed
                    for (c in actualControls) {
                        if (!controls.hasOwnProperty(c) || controls[c] === false) {
                            map.removeControl(actualControls[c]);
                            delete actualControls[c];
                        }
                    }

                    for (c in controls) {
                        if ((controls[c] === true || angular.isObject(controls[c])) && !actualControls.hasOwnProperty(c)) {
                            console.log(controlClasses[c]);
                            map.addControl(new controlClasses[c]());
                        }
                    }
                }, true);
            });
        }
    };
});
