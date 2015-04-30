angular.module('openlayers-directive').directive('olCenter', function($log, $location, olMapDefaults, olHelpers) {

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
            var setCenter         = olHelpers.setCenter;
            var setZoom           = olHelpers.setZoom;
            var olScope           = controller.getOpenlayersScope();

            olScope.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(olScope);
                var view = map.getView();
                var center = olScope.center;

                if (attrs.olCenter.search('-') !== -1) {
                    $log.error('[AngularJS - Openlayers] The "center" variable can\'t use ' +
                               'a "-" on his key name: "' + attrs.center + '".');
                    setCenter(view, defaults.view.projection, defaults.center, map);
                    return;
                }

                if (!isDefined(center)) {
                    center = {};
                }

                if (!isValidCenter(center)) {
                    $log.warn('[AngularJS - Openlayers] invalid \'center\'');
                    center.lat = defaults.center.lat;
                    center.lon = defaults.center.lon;
                    center.zoom = defaults.center.zoom;
                    center.projection = defaults.center.projection;
                }

                if (!center.projection) {
                    if (defaults.view.projection !== 'pixel') {
                        center.projection = defaults.center.projection;
                    } else {
                        center.projection = 'pixel';
                    }
                }

                if (!isNumber(center.zoom)) {
                    center.zoom = 1;
                }

                setCenter(view, defaults.view.projection, center, map);
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
                        var urlCenter = extractCenterFromUrl();
                        if (urlCenter && !isSameCenterOnMap(urlCenter, map)) {
                            safeApply(olScope, function(scope) {
                                scope.center.lat = urlCenter.lat;
                                scope.center.lon = urlCenter.lon;
                                scope.center.zoom = urlCenter.zoom;
                            });
                        }
                    });
                }

                var geolocation;
                olScope.$watchCollection('center', function(center) {

                    if (!center) {
                        return;
                    }

                    if (!center.projection) {
                        center.projection = defaults.center.projection;
                    }

                    if (center.autodiscover) {
                        if (!geolocation) {
                            geolocation = new ol.Geolocation({
                                projection: ol.proj.get(center.projection)
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
                        var actualCenter = ol.proj.transform(viewCenter, defaults.view.projection, center.projection);
                        if (!(actualCenter[1] === center.lat && actualCenter[0] === center.lon)) {
                            setCenter(view, defaults.view.projection, center, map);
                        }
                    }

                    if (view.getZoom() !== center.zoom) {
                        setZoom(view, center.zoom, map);
                    }
                });

                map.on('moveend', function() {
                    safeApply(olScope, function(scope) {

                        if (!isDefined(scope.center)) {
                            return;
                        }

                        var center = map.getView().getCenter();
                        scope.center.zoom = view.getZoom();

                        if (defaults.view.projection === 'pixel') {
                            scope.center.coord = center;
                            return;
                        }

                        if (scope.center) {
                            var proj = ol.proj.transform(center, defaults.view.projection, scope.center.projection);
                            scope.center.lat = proj[1];
                            scope.center.lon = proj[0];

                            // Notify the controller about a change in the center position
                            olHelpers.notifyCenterUrlHashChanged(olScope, scope.center, $location.search());

                            // Calculate the bounds if needed
                            if (isArray(scope.center.bounds)) {
                                var extent = view.calculateExtent(map.getSize());
                                var centerProjection = scope.center.projection;
                                var viewProjection = defaults.view.projection;
                                scope.center.bounds = ol.proj.transformExtent(extent, viewProjection, centerProjection);
                            }
                        }
                    });
                });

            });
        }
    };
});
