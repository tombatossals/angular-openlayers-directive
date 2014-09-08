angular.module("openlayers-directive").directive('center', function ($log, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var safeApply     = olHelpers.safeApply,
                isValidCenter = olHelpers.isValidCenter,
                equals         = olHelpers.equals,
                olScope       = controller.getOpenlayersScope();

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id),
                    center = olScope.center;

                if (!isValidCenter(center)) {
                    $log.warn("[AngularJS - Openlayers] invalid 'center'");
                    center = defaults.center;
                }

                var proj = ol.proj.transform([ center.coord.lon, center.coord.lat ],
                                        'EPSG:4326',
                                        'EPSG:3857');
                var view = new ol.View({
                    center: proj
                });
                map.setView(view);

                olScope.$watch("center", function(center) {
                    if (!isValidCenter(center)) {
                        $log.warn("[AngularJS - Openlayers] invalid 'center'");
                        center = defaults.center;
                    }

                    if (view.getCenter()) {
                        var actualCenter = ol.proj.transform(view.getCenter(),
                                                'EPSG:3857',
                                                'EPSG:4326');

                        if (!equals({ lat: actualCenter[1], lon: actualCenter[1] }, center.coord)) {
                            var proj = ol.proj.transform([ center.coord.lon, center.coord.lat ],
                                                    'EPSG:4326',
                                                    'EPSG:3857');
                            view.setCenter(proj);
                        }
                    }


                    if (view.getZoom() !== center.zoom) {
                        view.setZoom(center.zoom);
                    }
                }, true);

                view.on('change:resolution', function() {
                    safeApply(olScope, function(scope) {
                        if (scope.center && scope.center.zoom !== view.getZoom()) {
                            scope.center.zoom = view.getZoom();
                        }
                    });
                });

                view.on("change:center", function() {
                    safeApply(olScope, function(scope) {
                        var center = map.getView().getCenter();
                        var proj = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326');
                        if (scope.center) {
                            scope.center.coord = {
                              lat: proj[1],
                              lon: proj[0]
                            };
                        }
                    });
                });

            });
        }
    };
});
