(function() {

"use strict";

angular.module("openlayers-directive", []).directive('openlayers', ["$log", "$q", "olHelpers", "olMapDefaults", "olData", function ($log, $q, olHelpers, olMapDefaults, olData) {
    var _olMap = $q.defer();
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults',
            tiles: '=tiles'
        },
        transclude: true,
        template: '<div class="angular-openlayers-map"><div ng-transclude></div></div>',
        controller: ["$scope", function ($scope) {

            this.getMap = function () {
                return _olMap.promise;
            };

            this.getOpenlayersScope = function() {
                return $scope;
            };
        }],

        link: function(scope, element, attrs) {
            var isDefined = olHelpers.isDefined,
                getLayerObject = olHelpers.getLayerObject,
                disableMouseWheelZoom = olHelpers.disableMouseWheelZoom,
                defaults = olMapDefaults.setDefaults(scope.defaults, attrs.id);

            // Set width and height if they are defined
            if (isDefined(attrs.width)) {
                if (isNaN(attrs.width)) {
                    element.css('width', attrs.width);
                } else {
                    element.css('width', attrs.width + 'px');
                }
            }

            if (isDefined(attrs.height)) {
                if (isNaN(attrs.height)) {
                    element.css('height', attrs.height);
                } else {
                    element.css('height', attrs.height + 'px');
                }
            }

            // Create the Openlayers Map Object with the options
            var map = new ol.Map({
                target: element[0]
            });

            // If no layer is defined, set the default tileLayer
            if (!isDefined(attrs.layers)) {
                var layer = getLayerObject(defaults.tileLayer);
                map.addLayer(layer);
            }

            if (isDefined(defaults.controls.zoom.mouseWheelEnabled) &&
                defaults.controls.zoom.mouseWheelEnabled === false) {
                    disableMouseWheelZoom(map);
            }

            if (!isDefined(attrs.center)) {
                map.setView(new ol.View({
                    center: [ defaults.center.coord.lon, defaults.center.coord.lat ],
                    zoom: defaults.center.zoom
                }));
            }

            // Resolve the map object to the promises
            olData.setMap(map, attrs.id);
            _olMap.resolve(map);
        }
    };
}]);

angular.module("openlayers-directive").directive('center', ["$log", "$location", "olMapDefaults", "olHelpers", function ($log, $location, olMapDefaults, olHelpers) {
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

                if (!isValidCenter(center)) {
                    $log.warn("[AngularJS - Openlayers] invalid 'center'");
                    center = defaults.center;
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
}]);

angular.module("openlayers-directive").directive('tiles', ["$log", "olData", "olMapDefaults", "olHelpers", function ($log, olData, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var isDefined = olHelpers.isDefined,
                olScope  = controller.getOpenlayersScope(),
                getLayerObject = olHelpers.getLayerObject;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id),
                    tileLayerObj = [];

                olScope.$watch("tiles", function(tiles) {
                    if (!isDefined(tiles) || !isDefined(tiles.type)) {
                        $log.warn("[AngularJS - OpenLayers] The 'tiles' definition doesn't have the 'type' property.");
                        tiles = defaults.tileLayer;
                    }

                    if (isDefined(tileLayerObj) && tileLayerObj.length === 1) {
                        map.removeLayer(tileLayerObj[0]);
                        tileLayerObj.pop();
                    }

                    var l = getLayerObject(tiles);
                    map.addLayer(l);
                    tileLayerObj.push(l);

                    olData.setTiles(tileLayerObj, attrs.id);
                }, true);
            });
        }
    };
}]);

angular.module("openlayers-directive").service('olData', ["$log", "$q", "olHelpers", function ($log, $q, olHelpers) {
    var obtainEffectiveMapId = olHelpers.obtainEffectiveMapId;

    var maps = {},
        tiles = {};

    var setResolvedDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId);
        d[id].resolvedDefer = true;
    };

    var getUnresolvedDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId),
            defer;

        if (!angular.isDefined(d[id]) || d[id].resolvedDefer === true) {
            defer = $q.defer();
            d[id] = {
                defer: defer,
                resolvedDefer: false
            };
        } else {
            defer = d[id].defer;
        }
        return defer;
    };

    var getDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId),
            defer;
        if (!angular.isDefined(d[id]) || d[id].resolvedDefer === false) {
            defer = getUnresolvedDefer(d, mapId);
        } else {
            defer = d[id].defer;
        }
        return defer;
    };

    this.setMap = function(olMap, scopeId) {
        var defer = getUnresolvedDefer(maps, scopeId);
        defer.resolve(olMap);
        setResolvedDefer(maps, scopeId);
    };

    this.getMap = function(scopeId) {
        var defer = getDefer(maps, scopeId);
        return defer.promise;
    };

    this.setTiles = function(olTiles, scopeId) {
        var defer = getUnresolvedDefer(tiles, scopeId);
        defer.resolve(olTiles);
        setResolvedDefer(tiles, scopeId);
    };

    this.getTiles = function(scopeId) {
        var defer = getDefer(tiles, scopeId);
        return defer.promise;
    };

}]);

angular.module("openlayers-directive").factory('olHelpers', ["$q", "$log", function ($q, $log) {
    var isDefined = function(value) {
        return angular.isDefined(value);
    };

    return {
        // Determine if a reference is defined
        isDefined: isDefined,

        // Determine if a reference is a number
        isNumber: function(value) {
            return angular.isNumber(value);
        },

        // Determine if a reference is defined and not null
        isDefinedAndNotNull: function(value) {
            return angular.isDefined(value) && value !== null;
        },

        // Determine if a reference is a string
        isString: function(value) {
            return angular.isString(value);
        },

        // Determine if a reference is an array
        isArray: function(value) {
            return angular.isArray(value);
        },

        // Determine if a reference is an object
        isObject: function(value) {
            return angular.isObject(value);
        },

        // Determine if two objects have the same properties
        equals: function(o1, o2) {
            return angular.equals(o1, o2);
        },

        isValidCenter: function(center) {
            return angular.isDefined(center) &&
                   (angular.isDefined(center.coord) && angular.isNumber(center.coord.lat) &&
                   angular.isNumber(center.coord.lon) ||
                   (typeof center.autodiscover === "boolean") ||
                   (angular.isArray(center.bounds) && center.bounds.length === 4 &&
                   angular.isNumber(center.bounds[0]) && angular.isNumber(center.bounds[1]) &&
                   angular.isNumber(center.bounds[1]) && angular.isNumber(center.bounds[2])));
        },

        safeApply: function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                $scope.$eval(fn);
            } else {
                $scope.$apply(fn);
            }
        },

        isSameCenterOnMap: function(center, map) {
            var mapCenter = map.getView().getCenter();
            var zoom = map.getView().getZoom();
            if (mapCenter[1].toFixed(4) === center.coord.lat.toFixed(4) &&
                mapCenter[1].toFixed(4) === center.coord.lng.toFixed(4) &&
                zoom === center.zoom) {
                  return true;
            }
            return false;
        },

        obtainEffectiveMapId: function(d, mapId) {
            var id, i;
            if (!angular.isDefined(mapId)) {
                if (Object.keys(d).length === 1) {
                    for (i in d) {
                        if (d.hasOwnProperty(i)) {
                            id = i;
                        }
                    }
                } else if (Object.keys(d).length === 0) {
                    id = "main";
                } else {
                    $log.error("[AngularJS - Openlayers] - You have more than 1 map on the DOM, you must provide the map ID to the olData.getXXX call");
                }
            } else {
                id = mapId;
            }
            return id;
        },

        generateUniqueUID: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        },

        disableMouseWheelZoom: function(map) {
            var interactions = map.getInteractions();

            interactions.forEach(function(interaction) {
                if (interaction instanceof ol.interaction.MouseWheelZoom) {
                    map.removeInteraction(interaction);
                }
            });
        },

        getLayerObject: function(layer) {
            var oLayer, source;

            switch(layer.type) {
                case 'OSM':
                    if (layer.attribution) {
                        source = new ol.source.OSM({
                            attributions: [
                              new ol.Attribution({ html: layer.attribution }),
                              ol.source.OSM.DATA_ATTRIBUTION
                            ]
                        });
                    } else {
                        source = new ol.source.OSM();
                    }

                    oLayer = new ol.layer.Tile({ source: source });

                    if (layer.url) {
                        source.setUrl(layer.url);
                    }

                    break;
                case 'TileJSON':
                    source = new ol.source.TileJSON({
                        url: layer.url,
                        crossOrigin: 'anonymous'
                    });

                    oLayer = new ol.layer.Tile({ source: source });
                    break;
            }

            return oLayer;
        }
    };
}]);

angular.module("openlayers-directive").factory('olMapDefaults', ["$q", "olHelpers", function ($q, olHelpers) {
    function _getDefaults() {
        return {
            tileLayer: {
                type: 'OSM'
            },
            center: {
                coord: {
                  lat: 0,
                  lon: 0
                },
                zoom: 1,
                autoDiscover: false,
                bounds: [],
                centerUrlHash: false
            },
            controls: {
                zoom: {
                    position: 'topright',
                    mouseWheelEnabled: true
                }
            }
        };
    }
    var isDefined = olHelpers.isDefined,
        obtainEffectiveMapId = olHelpers.obtainEffectiveMapId,
        defaults = {};

    // Get the _defaults dictionary, and override the properties defined by the user
    return {
        getDefaults: function (scopeId) {
            var mapId = obtainEffectiveMapId(defaults, scopeId);
            return defaults[mapId];
        },

        setDefaults: function(userDefaults, scopeId) {
            var newDefaults = _getDefaults();

            if (isDefined(userDefaults)) {
                newDefaults.tileLayer = isDefined(userDefaults.tileLayer) ? userDefaults.tileLayer : newDefaults.tileLayer;

                if (isDefined(userDefaults.controls)) {
                    if (isDefined(userDefaults.controls.zoom)) {
                        newDefaults.controls.zoom.mouseWheelEnabled = isDefined(userDefaults.controls.zoom.mouseWheelEnabled) ? userDefaults.controls.zoom.mouseWheelEnabled : newDefaults.controls.zoom.mouseWheelEnabled;
                    }
                }
            }

            var mapId = obtainEffectiveMapId(defaults, scopeId);
            defaults[mapId] = newDefaults;
            return newDefaults;
        }
    };
}]);

}());