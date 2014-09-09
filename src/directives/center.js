angular.module("openlayers-directive").directive('center', function ($log, $location, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var safeApply     = olHelpers.safeApply,
                isValidCenter = olHelpers.isValidCenter,
                isDefined = olHelpers.isDefined,
                isSameCenterOnMap = olHelpers.isSameCenterOnMap,
                equals         = olHelpers.equals,
                olScope       = controller.getOpenlayersScope();

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id),
                    center = olScope.center;

                if (attrs.center.search("-") !== -1) {
                    $log.error('[AngularJS - Openlayers] The "center" variable can\'t use a "-" on his key name: "' + attrs.center + '".');
                    map.setView(new ol.View({
                        center: ol.proj.transform([ defaults.center.coord.lon, defaults.center.coord.lat ], 'EPSG:4326', 'EPSG:3857')
                    }));

                    return;
                }

                if (center.autoDiscover) {
                    center = angular.copy(defaults.center);
                }

                if (!isValidCenter(center)) {
                    $log.warn("[AngularJS - Openlayers] invalid 'center'");
                    center = angular.copy(defaults.center);
                }

                var view = new ol.View({
                    center: ol.proj.transform([ center.coord.lon, center.coord.lat ], 'EPSG:4326', 'EPSG:3857')
                });
                map.setView(view);

                var centerUrlHash;
                if (center.centerUrlHash === true) {
                    var extractCenterFromUrl = function() {
                        var search = $location.search();
                        var centerParam;
                        if (isDefined(search.c)) {
                            var cParam = search.c.split(":");
                            if (cParam.length === 3) {
                                centerParam = {
                                    coord: {
                                        lat: parseFloat(cParam[0]),
                                        lon: parseFloat(cParam[1])
                                    },
                                    zoom: parseInt(cParam[2], 10)
                                };
                            }
                        }
                        return centerParam;
                    };
                    centerUrlHash = extractCenterFromUrl();

                    olScope.$on('$locationChangeSuccess', function(event) {
                        var scope = event.currentScope;
                        var urlCenter = extractCenterFromUrl();
                        if (isDefined(urlCenter) && !isSameCenterOnMap(urlCenter, map)) {
                            scope.center = {
                                coord: {
                                  lat: urlCenter.coord.lat,
                                  lon: urlCenter.coord.lon
                                },
                                zoom: urlCenter.zoom
                            };
                        }
                    });
                }

                olScope.$watch("center", function(center) {
                    if (center.autoDiscover) {
                        center = angular.copy(defaults.center);
                    }

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
