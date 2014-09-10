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
                        center: ol.proj.transform([ defaults.center.lon, defaults.center.lat ], 'EPSG:4326', 'EPSG:3857')
                    }));

                    return;
                }

                if (!isValidCenter(center)) {
                    $log.warn("[AngularJS - Openlayers] invalid 'center'");
                    center = angular.copy(defaults.center);
                }

                var view = new ol.View({
                    center: ol.proj.transform([ center.lon, center.lat ], 'EPSG:4326', 'EPSG:3857'),
                    zoom: center.zoom,
                    maxZoom: center.maxZoom,
                    minZoom: center.minZoom
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

                    if (center.autodiscover) {
                        if (!geolocation) {
                            geolocation = new ol.Geolocation({
                                projection: ol.proj.get('EPSG:4326')
                            });

                            geolocation.on('change', function() {
                                console.log('change');
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
                        console.log("settracking");
                        geolocation.setTracking(true);
                        return;
                    }

                    if (!isValidCenter(center)) {
                        $log.warn("[AngularJS - Openlayers] invalid 'center'");
                        center = defaults.center;
                    }

                    if (view.getCenter()) {
                        var actualCenter = ol.proj.transform(view.getCenter(),
                                                'EPSG:3857',
                                                'EPSG:4326');

                        if (!equals({ lat: actualCenter[1], lon: actualCenter[1] }, { lat: center.lat, lon: center.lon })) {
                            var proj = ol.proj.transform([ center.lon, center.lat ], 'EPSG:4326', 'EPSG:3857');
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
                            scope.center.lat = proj[1];
                            scope.center.lon = proj[0];
                        }
                    });
                });

            });
        }
    };
});
