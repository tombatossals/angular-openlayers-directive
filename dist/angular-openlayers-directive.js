(function() {

"use strict";

angular.module("openlayers-directive", []).directive('openlayers', function ($log, $q, olHelpers, olMapDefaults, olData) {
    var _olMap;
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults'
        },
        template: '<div class="angular-openlayers-map"></div>',
        controller: function ($scope) {
            _olMap = $q.defer();
            this.getMap = function () {
                return _olMap.promise;
            };

            this.getOpenlayersScope = function() {
                return $scope;
            };
        },

        link: function(scope, element, attrs) {
            var isDefined = olHelpers.isDefined,
                getLayerObject = olHelpers.getLayerObject,
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
            var map = new OpenLayers.Map();
            _olMap.resolve(map);

            // If no layers nor tiles defined, set the default tileLayer
            if (!isDefined(attrs.tiles) && (!isDefined(attrs.layers))) {
                var layer = getLayerObject(defaults.tileLayer);
                map.addLayer(layer);
            }

            if (isDefined(defaults.controls.navigation.zoomWheelEnabled) && defaults.controls.navigation.zoomWheelEnabled === true) {
                var controls = map.getControlsByClass('OpenLayers.Control.Navigation');
                for (var i=0; i<controls.length; i++) {
                    controls[i].disableZoomWheel();
                }
            }

            map.render(element[0]);
            console.log(map.getProjection());
            if (!isDefined(attrs.center)) {
                map.zoomToMaxExtent();
            }

            // Resolve the map object to the promises
            olData.setMap(map, attrs.id);
        }
    };
});

angular.module("openlayers-directive").directive('center', function ($log, $parse, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var safeApply     = olHelpers.safeApply,
                isValidCenter = olHelpers.isValidCenter,
                olScope       = controller.getOpenlayersScope(),
                center        = olScope.center;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                if (!isValidCenter(center)) {
                    map.setCenter([defaults.center.lon, defaults.center.lat], defaults.center.zoom);
                    return;
                }

                var movingMap = false;
                var centerModel = {
                    lat:  $parse("center.lat"),
                    lon:  $parse("center.lon"),
                    zoom: $parse("center.zoom")
                };

                olScope.$watch("center", function(center) {
                    if (!isValidCenter(center)) {
                        $log.warn("[AngularJS - Openlayers] invalid 'center'");
                        map.setCenter([defaults.center.lon, defaults.center.lat], defaults.center.zoom);
                        return;
                    }
                    if (movingMap) {
                        // Can't update. The map is moving.
                        return;
                    }
                    map.setCenter([center.lon, center.lat], center.zoom);
                }, true);

                map.events.register("movestart", map, function() {
                    movingMap = true;
                });

                map.events.register("moveend", map, function() {
                    movingMap = false;
                    safeApply(olScope, function(scope) {
                        centerModel.lat.assign(scope, map.getCenter().lat);
                        centerModel.lon.assign(scope, map.getCenter().lon);
                        centerModel.zoom.assign(scope, map.getZoom());
                    });
                });
            });
        }
    };
});

angular.module("openlayers-directive").service('olData', function ($log, $q, olHelpers) {
    var getDefer = olHelpers.getDefer,
        getUnresolvedDefer = olHelpers.getUnresolvedDefer,
        setResolvedDefer = olHelpers.setResolvedDefer;

    var maps = {};

    this.setMap = function(olMap, scopeId) {
        var defer = getUnresolvedDefer(maps, scopeId);
        defer.resolve(olMap);
        setResolvedDefer(maps, scopeId);
    };

    this.getMap = function(scopeId) {
        var defer = getDefer(maps, scopeId);
        return defer.promise;
    };
});

angular.module("openlayers-directive").factory('olHelpers', function ($q, $log) {
    var isDefined = function(value) {
        return angular.isDefined(value);
    };

    function _obtainEffectiveMapId(d, mapId) {
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
    }

    function _getUnresolvedDefer(d, mapId) {
        var id = _obtainEffectiveMapId(d, mapId),
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
    }

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
            return angular.isDefined(center) && angular.isNumber(center.lat) &&
                   angular.isNumber(center.lon) && angular.isNumber(center.zoom);
        },

        safeApply: function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                $scope.$eval(fn);
            } else {
                $scope.$apply(fn);
            }
        },

        generateUniqueUID: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        },

        obtainEffectiveMapId: _obtainEffectiveMapId,

        getDefer: function(d, mapId) {
            var id = _obtainEffectiveMapId(d, mapId),
                defer;
            if (!angular.isDefined(d[id]) || d[id].resolvedDefer === false) {
                defer = _getUnresolvedDefer(d, mapId);
            } else {
                defer = d[id].defer;
            }
            return defer;
        },

        getUnresolvedDefer: _getUnresolvedDefer,

        setResolvedDefer: function(d, mapId) {
            var id = _obtainEffectiveMapId(d, mapId);
            d[id].resolvedDefer = true;
        },

        getLayerObject: function(layer) {
            var oLayer;

            switch(layer.type) {
                case 'OSM':
                    var name, url, options;
                    if (layer.name) {
                        name = layer.name;
                    }
                    if (layer.url) {
                        url = layer.url;
                        if (!isDefined(name)) {
                            name = "OSM Layer";
                        }
                    }
                    if (layer.projection) {
                        options = {
                            projection: new OpenLayers.Projection(layer.projection)
                        };
                    }
                    oLayer = new OpenLayers.Layer.OSM(name, url, options);
                    break;
            }

            return oLayer;
        }
    };
});

angular.module("openlayers-directive").factory('olMapDefaults', function ($q, olHelpers) {
    function _getDefaults() {
        return {
            tileLayer: {
                name: 'OpenStreetMap',
                type: 'OSM',
                projection: 'EPSG:4236'
            },
            center: {
                lat: 0,
                lon: 0,
                zoom: 1
            },
            controls: {
                navigation: {
                    zoomWheelEnabled: true
                },
                zoom: {
                    position: 'topright'
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
            }

            var mapId = obtainEffectiveMapId(defaults, scopeId);
            defaults[mapId] = newDefaults;
            return newDefaults;
        }
    };
});


}());