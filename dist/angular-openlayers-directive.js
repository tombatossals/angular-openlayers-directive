(function() {

"use strict";

angular.module("openlayers-directive", []).directive('openlayers', function ($log, $q, openlayersHelpers, openlayersMapDefaults, openlayersData) {
    var _openlayersMap;
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults'
        },
        template: '<div class="angular-openlayers-map"></div>',
        controller: function ($scope) {
            _openlayersMap = $q.defer();
            this.getMap = function () {
                return _openlayersMap.promise;
            };

            this.getOpenlayersScope = function() {
                return $scope;
            };
        },

        link: function(scope, element, attrs) {
            var isDefined = openlayersHelpers.isDefined;

            openlayersMapDefaults.setDefaults(scope.defaults, attrs.id);

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
            _openlayersMap.resolve(map);

            // If no layers nor tiles defined, set the default tileLayer
            if (!isDefined(attrs.tiles) && (!isDefined(attrs.layers))) {
                var layer = new OpenLayers.Layer.OSM();
                map.addLayer(layer);
                openlayersData.setTiles(layer);
            }

            map.render(element[0]);
            if (!isDefined(attrs.center)) {
                map.zoomToMaxExtent();
            }

            // Resolve the map object to the promises
            openlayersData.setMap(map, attrs.id);
        }
    };
});

angular.module("openlayers-directive").service('openlayersData', function ($log, $q, openlayersHelpers) {
    var getDefer = openlayersHelpers.getDefer,
        getUnresolvedDefer = openlayersHelpers.getUnresolvedDefer,
        setResolvedDefer = openlayersHelpers.setResolvedDefer;

    var maps = {};
    var tiles = {};
    var layers = {};
    var paths = {};
    var markers = {};
    var geoJSON = {};

    this.setMap = function(openlayersMap, scopeId) {
        var defer = getUnresolvedDefer(maps, scopeId);
        defer.resolve(openlayersMap);
        setResolvedDefer(maps, scopeId);
    };

    this.getMap = function(scopeId) {
        var defer = getDefer(maps, scopeId);
        return defer.promise;
    };

    this.getPaths = function(scopeId) {
        var defer = getDefer(paths, scopeId);
        return defer.promise;
    };

    this.setPaths = function(openlayersPaths, scopeId) {
        var defer = getUnresolvedDefer(paths, scopeId);
        defer.resolve(openlayersPaths);
        setResolvedDefer(paths, scopeId);
    };

    this.getMarkers = function(scopeId) {
        var defer = getDefer(markers, scopeId);
        return defer.promise;
    };

    this.setMarkers = function(openlayersMarkers, scopeId) {
        var defer = getUnresolvedDefer(markers, scopeId);
        defer.resolve(openlayersMarkers);
        setResolvedDefer(markers, scopeId);
    };

    this.getLayers = function(scopeId) {
        var defer = getDefer(layers, scopeId);
        return defer.promise;
    };

    this.setLayers = function(openlayersLayers, scopeId) {
        var defer = getUnresolvedDefer(layers, scopeId);
        defer.resolve(openlayersLayers);
        setResolvedDefer(layers, scopeId);
    };

    this.setTiles = function(openlayersTiles, scopeId) {
        var defer = getUnresolvedDefer(tiles, scopeId);
        defer.resolve(openlayersTiles);
        setResolvedDefer(tiles, scopeId);
    };

    this.getTiles = function(scopeId) {
        var defer = getDefer(tiles, scopeId);
        return defer.promise;
    };

    this.setGeoJSON = function(openlayersGeoJSON, scopeId) {
        var defer = getUnresolvedDefer(geoJSON, scopeId);
        defer.resolve(openlayersGeoJSON);
        setResolvedDefer(geoJSON, scopeId);
    };

    this.getGeoJSON = function(scopeId) {
        var defer = getDefer(geoJSON, scopeId);
        return defer.promise;
    };
});

angular.module("openlayers-directive").factory('openlayersMapDefaults', function ($q, openlayersHelpers) {
    function _getDefaults() {
        return {
            keyboard: true,
            dragging: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            zoomControl: true,
            attributionControl: true,
            zoomsliderControl: false,
            zoomControlPosition: 'topleft',
            controlLayersPosition: 'topright',
            tileLayer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            tileLayerOptions: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            icon: {
                url: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon.png',
                retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon-2x.png',
                size: [25, 41],
                anchor: [12, 40],
                labelAnchor: [10, -20],
                popup: [0, -40],
                shadow: {
                    url: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
                    retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
                    size: [41, 41],
                    anchor: [12, 40]
                }
            },
            path: {
                weight: 10,
                opacity: 1,
                color: '#0000ff'
            }
        };
    }
    var isDefined = openlayersHelpers.isDefined,
        getDefer = openlayersHelpers.getDefer,
        getUnresolvedDefer = openlayersHelpers.getUnresolvedDefer,
        defaults = {};

    // Get the _defaults dictionary, and override the properties defined by the user
    return {
        getDefaults: function (scopeId) {
            var defer = getDefer(defaults, scopeId);
            return defer.promise;
        },

        setDefaults: function(userDefaults, scopeId) {
            var newDefaults = _getDefaults();

            if (isDefined(userDefaults)) {
                newDefaults.doubleClickZoom = isDefined(userDefaults.doubleClickZoom) ?  userDefaults.doubleClickZoom : newDefaults.doubleClickZoom;
                newDefaults.scrollWheelZoom = isDefined(userDefaults.scrollWheelZoom) ?  userDefaults.scrollWheelZoom : newDefaults.doubleClickZoom;
                newDefaults.zoomControl = isDefined(userDefaults.zoomControl) ?  userDefaults.zoomControl : newDefaults.zoomControl;
                newDefaults.attributionControl = isDefined(userDefaults.attributionControl) ?  userDefaults.attributionControl : newDefaults.attributionControl;
                newDefaults.tileLayer = isDefined(userDefaults.tileLayer) ? userDefaults.tileLayer : newDefaults.tileLayer;
                newDefaults.zoomControlPosition = isDefined(userDefaults.zoomControlPosition) ? userDefaults.zoomControlPosition : newDefaults.zoomControlPosition;
                newDefaults.keyboard = isDefined(userDefaults.keyboard) ? userDefaults.keyboard : newDefaults.keyboard;
                newDefaults.dragging = isDefined(userDefaults.dragging) ? userDefaults.dragging : newDefaults.dragging;
                newDefaults.controlLayersPosition = isDefined(userDefaults.controlLayersPosition) ? userDefaults.controlLayersPosition : newDefaults.controlLayersPosition;

                if (isDefined(userDefaults.tileLayerOptions)) {
                    angular.copy(userDefaults.tileLayerOptions, newDefaults.tileLayerOptions);
                }

                if (isDefined(userDefaults.maxZoom)) {
                    newDefaults.maxZoom = userDefaults.maxZoom;
                }

                if (isDefined(userDefaults.minZoom)) {
                    newDefaults.minZoom = userDefaults.minZoom;
                }
            }

            var openlayersDefaults = getUnresolvedDefer(defaults, scopeId);
            openlayersDefaults.resolve(newDefaults);

            return newDefaults;
        }
    };
});


angular.module("openlayers-directive").factory('openlayersHelpers', function ($q, $log) {

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
                $log.error("[AngularJS - Openlayers] - You have more than 1 map on the DOM, you must provide the map ID to the openlayersData.getXXX call");
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
        isDefined: function(value) {
            return angular.isDefined(value);
        },

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
                   angular.isNumber(center.lng) && angular.isNumber(center.zoom);
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
        }
    };
});

}());