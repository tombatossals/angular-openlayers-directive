angular.module('openlayers-directive').directive('center', function($log, $location, olMapDefaults, olHelpers) {
    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var safeApply         = olHelpers.safeApply;
            var isValidCenter     = olHelpers.isValidCenter;
            var isDefined         = olHelpers.isDefined;
            var isArray           = olHelpers.isArray;
            var isNumber          = olHelpers.isNumber;
            var isSameCenterOnMap = olHelpers.isSameCenterOnMap;
            var olScope           = controller.getOpenlayersScope();

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                var center = olScope.center;
                var view = map.getView();
                var setCenter = function(view, projection, newCenter) {
                    if (newCenter.projection === projection) {
                        view.setCenter([newCenter.lon, newCenter.lat]);
                    } else {
                        var coord = [newCenter.lon, newCenter.lat];
                        view.setCenter(ol.proj.transform(coord, projection, newCenter.projection));
                    }
                };

                if (!center.projection) {
                    if (defaults.view.projection !== 'pixel') {
                        center.projection = defaults.center.projection;
                    } else {
                        center.projection = defaults.view.projection;
                    }
                }

                if (attrs.center.search('-') !== -1) {
                    $log.error('[AngularJS - Openlayers] The "center" variable can\'t use ' +
                               'a "-" on his key name: "' + attrs.center + '".');
                    setCenter(view, defaults.view.projection, defaults.center);
                    return;
                }

                if (!isValidCenter(center)) {
                    $log.warn('[AngularJS - Openlayers] invalid \'center\'');
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
                            var cParam = search.c.split(':');
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

                    olScope.$on('$locationChangeSuccess', function() {
                        centerUrlHash = extractCenterFromUrl();
                    });
                }

                var geolocation;
                olScope.$watch('center', function(center) {

                    if (isDefined(centerUrlHash)) {
                        var urlCenter = extractCenterFromUrl();
                        if  (!isSameCenterOnMap(urlCenter, map)) {
                            center.lat = centerUrlHash.lat;
                            center.lon = centerUrlHash.lon;
                            center.zoom = centerUrlHash.zoom;
                        }
                        centerUrlHash = undefined;
                    }


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
                        $log.warn('[AngularJS - Openlayers] invalid \'center\'');
                        center = defaults.center;
                    }

                    var viewCenter = view.getCenter();
                    if (viewCenter) {
                        if (defaults.view.projection === 'pixel') {
                            view.setCenter(center.coord);
                            return;
                        }
                        var actualCenter = ol.proj.transform(viewCenter, center.projection, defaults.view.projection);
                        if (!(actualCenter[1] === center.lat && actualCenter[0] === center.lon)) {
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

                        // Notify the controller about a change in the center position
                        olHelpers.notifyCenterUrlHashChanged(olScope, scope.center, $location.search());

                        // Calculate the bounds if needed
                        if (isArray(scope.center.bounds)) {
                            var extent = view.calculateExtent(map.getSize());
                            var centerProjection = scope.center.projection;
                            var viewProjection = defaults.view.projection;
                            scope.center.bounds = ol.proj.transform(extent, centerProjection, viewProjection);
                        }
                    });
                });

                view.on('change:center', function() {
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

                            // Notify the controller about a change in the center position
                            olHelpers.notifyCenterUrlHashChanged(olScope, scope.center, $location.search());

                            // Calculate the bounds if needed
                            if (isArray(scope.center.bounds)) {
                                var extent = view.calculateExtent(map.getSize());
                                var centerProjection = scope.center.projection;
                                var viewProjection = defaults.view.projection;
                                scope.center.bounds = ol.proj.transform(extent, centerProjection, viewProjection);
                            }
                        }
                    });
                });

            });
        }
    };
});
