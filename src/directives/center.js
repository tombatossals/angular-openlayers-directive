angular.module("openlayers-directive").directive('center', function ($log, $location, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var safeApply         = olHelpers.safeApply,
                isValidCenter     = olHelpers.isValidCenter,
                isDefined         = olHelpers.isDefined,
                isArray           = olHelpers.isArray,
                isNumber          = olHelpers.isNumber,
                isSameCenterOnMap = olHelpers.isSameCenterOnMap,
                equals            = olHelpers.equals,
                olScope           = controller.getOpenlayersScope();

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id),
                    center = olScope.center;

                var view = map.getView();
                var setCenter = function(view, projection, newCenter) {
                    if (newCenter.projection === projection) {
                        view.setCenter([ newCenter.lon, newCenter.lat ]);
                    } else {
                        view.setCenter(ol.proj.transform([ newCenter.lon, newCenter.lat ], projection, newCenter.projection));
                    }
                };

                if (!center.projection) {
                    if (defaults.view.projection !== 'pixel') {
                        center.projection = defaults.center.projection;
                    } else {
                        center.projection = defaults.view.projection;
                    }
                }

                if (attrs.center.search("-") !== -1) {
                    $log.error('[AngularJS - Openlayers] The "center" variable can\'t use a "-" on his key name: "' + attrs.center + '".');
                    setCenter(view, defaults.view.projection, defaults.center);
                    return;
                }

                if (!isValidCenter(center)) {
                    $log.warn("[AngularJS - Openlayers] invalid 'center'");
                    center = angular.copy(defaults.center);
                }

                if (!isNumber(center.zoom)) {
                    center.zoom = 1;
                }

                setCenter(view, defaults.view.projection, center);
                view.setZoom(center.zoom);

                var centerUrlHash;
                if (center.centerUrlHash === true) {
                    var extractCenterFromUrl = function() {
                        var search = $location.search();
                        var centerParam;
                        if (isDefined(search.c)) {
                            var cParam = search.c.split(":");
                            if (cParam.length === 3) {
                                centerParam = {
                                    lat: parseFloat(cParam[0]),
                                    lon: parseFloat(cParam[1]),
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
                                lat: urlCenter.lat,
                                lon: urlCenter.lon,
                                zoom: urlCenter.zoom
                            };
                        }
                    });
                }

                var geolocation;
                olScope.$watch("center", function(center) {
                    if (!center.projection) {
                        center.projection = defaults.center.projection;
                    }

                    if (center.autodiscover) {
                        if (!geolocation) {
                            geolocation = new ol.Geolocation({
                                projection: ol.proj.get(defaults.view.projection)
                            });

                            geolocation.on('change', function() {
                                if (center.autodiscover) {
                                    var location = geolocation.getPosition();
                                    safeApply(olScope, function(scope) {
                                        scope.center.lat = location[1];
                                        scope.center.lon = location[0];
                                        scope.center.zoom = 12;
                                        scope.center.autodiscover = false;
                                        geolocation.setTracking(false);
                                    });
                                }
                            });
                        }
                        geolocation.setTracking(true);
                        return;
                    }

                    if (!isValidCenter(center)) {
                        $log.warn("[AngularJS - Openlayers] invalid 'center'");
                        center = defaults.center;
                    }

                    var viewCenter = view.getCenter();
                    if (viewCenter) {
                        if (defaults.view.projection === 'pixel') {
                            view.setCenter(center.coord);
                            return;
                        }
                        var actualCenter = ol.proj.transform(viewCenter, center.projection, defaults.view.projection);
                        if (!equals({ lat: actualCenter[1], lon: actualCenter[0] }, { lat: center.lat, lon: center.lon })) {
                            setCenter(view, defaults.view.projection, center);
                        }
                    }

                    if (view.getZoom() !== center.zoom) {
                        view.setZoom(center.zoom);
                    }
                }, true);

                view.on('change:resolution', function() {
                    safeApply(olScope, function(scope) {
                        scope.center.zoom = view.getZoom();

                        // Calculate the bounds if needed
                        if (isArray(scope.center.bounds)) {
                            var extent = view.calculateExtent(map.getSize());
                            scope.center.bounds = ol.proj.transform(extent, scope.center.projection, defaults.view.projection);
                        }
                    });
                });

                view.on("change:center", function() {
                    safeApply(olScope, function(scope) {
                        var center = map.getView().getCenter();
                        if (defaults.view.projection === 'pixel') {
                            scope.center.coord = center;
                            return;
                        }

                        var proj = ol.proj.transform(center, scope.center.projection, defaults.view.projection);
                        if (scope.center) {
                            scope.center.lat = proj[1];
                            scope.center.lon = proj[0];

                            // Calculate the bounds if needed
                            if (isArray(scope.center.bounds)) {
                                var extent = view.calculateExtent(map.getSize());
                                scope.center.bounds = ol.proj.transform(extent, scope.center.projection, defaults.view.projection);
                            }
                        }
                    });
                });

            });
        }
    };
});
