angular.module('openlayers-directive').directive('olView', function($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: 'openlayers',
        link: function(scope, element, attrs, controller) {
            var olScope = controller.getOpenlayersScope();
            var isNumber = olHelpers.isNumber;
            var safeApply = olHelpers.safeApply;
            var createView = olHelpers.createView;

            olScope.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(olScope);
                var view = olScope.view;

                if (!view.projection) {
                    view.projection = defaults.view.projection;
                }

                if (!view.maxZoom) {
                    view.maxZoom = defaults.view.maxZoom;
                }

                if (!view.minZoom) {
                    view.minZoom = defaults.view.minZoom;
                }

                if (!view.rotation) {
                    view.rotation = defaults.view.rotation;
                }

                var mapView = createView(view);
                map.setView(mapView);

                olScope.$watchCollection('view', function(view) {
                    if (isNumber(view.rotation)) {
                        mapView.setRotation(view.rotation);
                    }
                });

                mapView.on('change:rotation', function() {
                    safeApply(olScope, function(scope) {
                        scope.view.rotation = map.getView().getRotation();
                    });
                });

            });
        }
    };
});
