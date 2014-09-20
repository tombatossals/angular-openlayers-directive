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
            layers: '=layers',
            events: '=events'
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
                createLayer = olHelpers.createLayer,
                setEvents = olHelpers.setEvents,
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

            var controls = ol.control.defaults(defaults.controls);
            var interactions = ol.interaction.defaults(defaults.interactions);

            // Create the Openlayers Map Object with the options
            var map = new ol.Map({
                target: element[0],
                controls: controls,
                interactions: interactions
            });

            // If no layer is defined, set the default tileLayer
            if (!isDefined(attrs.layers)) {
                var layer = createLayer(defaults.layers.main);
                map.addLayer(layer);
            }

            // If no events ared defined, set the default events
            if (!isDefined(attrs.events)) {
                setEvents(defaults.events, map, scope);
            }

            if (!isDefined(attrs.center)) {
                map.setView(new ol.View({
                    center: [ defaults.center.lon, defaults.center.lat ],
                    zoom: defaults.center.zoom,
                    maxZoom: defaults.center.maxZoom,
                    minZoom: defaults.center.minZoom
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

                if (!isNumber(center.zoom)) {
                    center.zoom = 1;
                }

                var view = new ol.View({
                    center: ol.proj.transform([ center.lon, center.lat ], 'EPSG:4326', 'EPSG:3857'),
                    zoom: center.zoom,
                    maxZoom: defaults.maxZoom,
                    minZoom: defaults.minZoom
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
                        scope.center.zoom = view.getZoom();

                        // Calculate the bounds if needed
                        if (isArray(scope.center.bounds)) {
                            var extent = view.calculateExtent(map.getSize());
                            scope.center.bounds = ol.proj.transform(extent, 'EPSG:3857', 'EPSG:4326');
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

                            // Calculate the bounds if needed
                            if (isArray(scope.center.bounds)) {
                                var extent = view.calculateExtent(map.getSize());
                                scope.center.bounds = ol.proj.transform(extent, 'EPSG:3857', 'EPSG:4326');
                            }
                        }
                    });
                });

            });
        }
    };
}]);

angular.module("openlayers-directive").directive('layers', ["$log", "$q", "olData", "olMapDefaults", "olHelpers", function ($log, $q, olData, olMapDefaults, olHelpers) {
    var _olLayers;

    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',
        controller: function () {
            _olLayers = $q.defer();
            this.getLayers = function() {
                return _olLayers.promise;
            };
        },
        link: function(scope, element, attrs, controller) {
            var isDefined   = olHelpers.isDefined,
                equals      = olHelpers.equals,
                olLayers    = {},
                olScope     = controller.getOpenlayersScope(),
                createLayer = olHelpers.createLayer;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                olScope.$watch("layers", function(layers, oldLayers) {
                    var name, layer = layers[Object.keys(layers)[0]];
                    if (!isDefined(layer) || !isDefined(layer.source) || !isDefined(layer.source.type)) {
                        $log.warn("[AngularJS - OpenLayers] At least one layer has to be defined.");
                        layers = angular.copy(defaults.layers);
                    }

                    // Delete non existent layers from the map
                    for (name in olLayers) {
                        layer = olLayers[name];
                        if (!layers.hasOwnProperty(name)) {
                            // Remove from the map if it's on it
                            var activeLayers = map.getLayers();
                            for (var i in activeLayers) {
                                if (activeLayers[i] === layer) {
                                    map.removeLayer(layers);
                                }
                            }
                            delete olLayers[name];
                        }
                    }

                    // add new layers
                    for (name in layers) {
                        layer = layers[name];
                        var olLayer;
                        if (!olLayers.hasOwnProperty(name)) {
                            olLayer = createLayer(layers[name]);
                            if (isDefined(olLayer)) {
                                olLayers[name] = olLayer;
                                map.addLayer(olLayer);
                            }
                        } else {
                            layer = layers[name];
                            var oldLayer = oldLayers[name];
                            olLayer = olLayers[name];
                            if (isDefined(oldLayer) && !equals(layer, oldLayer)) {
                                if (!equals(layer.source, oldLayer.source)) {
                                    map.removeLayer(olLayer);
                                    delete olLayers[name];
                                    var l = createLayer(layer);
                                    map.addLayer(l);
                                    olLayers[name] = l;
                                }

                                if (layer.opacity && layer.opacity !== oldLayer.opacity) {
                                    olLayer.setOpacity(layer.opacity);
                                }
                            }
                        }
                    }
                }, true);
                // We can resolve the layer promises
                _olLayers.resolve(olLayers);
                olData.setLayers(olLayers, attrs.id);

            });
        }
    };
}]);

angular.module("openlayers-directive").directive('events', ["$log", "$q", "olData", "olMapDefaults", "olHelpers", function ($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: [ 'openlayers', 'layers' ],
        link: function(scope, element, attrs, controller) {
            var setEvents = olHelpers.setEvents,
                isDefined = olHelpers.isDefined,
                mapController = controller[0],
                olScope     = mapController.getOpenlayersScope();

            mapController.getMap().then(function(map) {

                var getLayers;
                if (isDefined(controller[1])) {
                    getLayers = controller[1].getLayers;
                } else {
                    getLayers = function() {
                        var deferred = $q.defer();
                        deferred.resolve();
                        return deferred.promise;
                    };
                }

                getLayers().then(function(layers) {
                    olScope.$watch("events", function(events) {
                        setEvents(events, map, olScope, layers);
                    });
                });
            });
        }
    };
}]);

angular.module("openlayers-directive").service('olData', ["$log", "$q", "olHelpers", function ($log, $q, olHelpers) {
    var obtainEffectiveMapId = olHelpers.obtainEffectiveMapId;

    var maps = {},
        layers = {};

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

    this.getLayers = function(scopeId) {
        var defer = getDefer(layers, scopeId);
        return defer.promise;
    };

    this.setLayers = function(olLayers, scopeId) {
        var defer = getUnresolvedDefer(layers, scopeId);
        defer.resolve(olLayers);
        setResolvedDefer(layers, scopeId);
    };

}]);

angular.module("openlayers-directive").factory('olHelpers', ["$q", "$log", function ($q, $log) {
    var isDefined = function(value) {
        return angular.isDefined(value);
    };

    var bingImagerySets = [
      'Road',
      'Aerial',
      'AerialWithLabels',
      'collinsBart',
      'ordnanceSurvey'
    ];

    var mapQuestLayers = [ 'osm', 'sat', 'hyb' ];

    var detectLayerType = function(layer) {
        if (layer.type) {
            return layer.type;
        } else {
            switch(layer.source.type) {
                case 'GeoJSON':
                    return 'Vector';
                case 'TopoJSON':
                    return 'Vector';
                default:
                  return 'Tile';
            }
        }
    };


    var createSource = function(source) {
        var oSource, projection;

        switch(source.type) {
            case 'OSM':
                if (source.attribution) {
                    oSource = new ol.source.OSM({
                        attributions: [
                          new ol.Attribution({ html: source.attribution }),
                          ol.source.OSM.DATA_ATTRIBUTION
                        ]
                    });
                } else {
                    oSource = new ol.source.OSM();
                }

                if (source.url) {
                    oSource.setUrl(source.url);
                }

                break;
            case 'BingMaps':
                if (!source.key) {
                    $log.error("[AngularJS - Openlayers] - You need an API key to show the Bing Maps.");
                    return;
                }

                oSource = new ol.source.BingMaps({
                    key: source.key,
                    imagerySet: source.imagerySet?source.imagerySet:bingImagerySets[0]
                });

                break;

            case 'MapQuest':
                if (!source.layer || mapQuestLayers.indexOf(source.layer) === -1) {
                    $log.error("[AngularJS - Openlayers] - MapQuest layers needs a valid 'layer' property.");
                    return;
                }

                oSource = new ol.source.MapQuest({
                    layer: source.layer
                });

                break;

            case 'GeoJSON':
                projection = source.projection?source.projection:'EPSG:3857';

                if (!(source.features || source.url)) {
                    $log.error("[AngularJS - Openlayers] - You need a GeoJSON features property to add a GeoJSON layer.");
                    return;
                }

                if (source.url) {
                    oSource = new ol.source.GeoJSON({
                        projection: projection,
                        url: source.url
                    });
                } else {
                    oSource = new ol.source.GeoJSON(source.geojson);
                }

                break;
            case 'TopoJSON':
                projection = source.projection?source.projection:'EPSG:3857';

                if (!(source.features || source.url)) {
                    $log.error("[AngularJS - Openlayers] - You need a TopoJSON features property to add a GeoJSON layer.");
                    return;
                }

                if (source.url) {
                    oSource = new ol.source.TopoJSON({
                        projection: projection,
                        url: source.url
                    });
                } else {
                    oSource = new ol.source.TopoJSON(source.topojson);
                }

                break;
            case 'TileJSON':
                oSource = new ol.source.TileJSON({
                    url: source.url,
                    crossOrigin: 'anonymous'
                });

                break;
        }

        return oSource;
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
                   (angular.isNumber(center.lat) && angular.isNumber(center.lon) ||
                   typeof center.autodiscover === "boolean" && center.autodiscover === true ||
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
            if (mapCenter[1].toFixed(4) === center.lat.toFixed(4) &&
                mapCenter[1].toFixed(4) === center.lon.toFixed(4) &&
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

        setEvents: function(events, map, scope, layers) {
            if (isDefined(events)) {
                if (isDefined(layers)) {
                    if (isDefined(events.layers) && angular.isArray(events.layers.vector)) {
                        angular.forEach(events.layers.vector, function(eventType) {
                            angular.element(map.getViewport()).on(eventType, function(evt) {
                                var pixel = map.getEventPixel(evt);
                                var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                                    return feature;
                                });
                                scope.$emit('openlayers.geojson.' + eventType, feature);
                            });
                        });
                    }
                }
            }
        },

        createLayer: function(layer) {
            var oLayer,
                type = detectLayerType(layer),
                oSource = createSource(layer.source);

            switch(type) {
                case 'Tile':
                    oLayer = new ol.layer.Tile({ source: oSource });
                    break;
                case 'Vector':
                    if (layer.style) {
                        var style = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: layer.style.fill.color
                            }),
                            stroke: new ol.style.Stroke({
                                color: layer.style.stroke.color,
                                width: layer.style.stroke.width
                            })
                        });
                        oLayer = new ol.layer.Vector({ source: oSource, style: style });
                    } else {
                        oLayer = new ol.layer.Vector({ source: oSource });
                    }
                    break;
            }

            if (angular.isNumber(layer.opacity)) {
                oLayer.setOpacity(layer.opacity);
            }
            return oLayer;
        }
    };
}]);

angular.module("openlayers-directive").factory('olMapDefaults', ["$q", "olHelpers", function ($q, olHelpers) {
    var _getDefaults = function() {
        return {
            interactions: {
                dragRotate: true,
                doubleClickZoom: true,
                dragPan: true,
                pinchRotate: true,
                pinchZoom: true,
                keyboardPan: true,
                keyboardZoom: true,
                mouseWheelZoom: true,
                dragZoom: true
            },
            layers: {
                main: {
                    type: 'Tile',
                    source: {
                        type: 'OSM'
                    }
                }
            },
            minZoom: undefined,
            maxZoom: undefined,
            center: {
                lat: 0,
                lon: 0,
                zoom: 1,
                autodiscover: false,
                bounds: [],
                centerUrlHash: false
            },
            controls: {
                attribution: true,
                rotate: false,
                zoom: true
            },
            events: {
                map: [ 'click' ]
            }
        };
    };

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

                if (isDefined(userDefaults.layers)) {
                    newDefaults.layers = angular.copy(userDefaults.layers);
                }

                if (isDefined(userDefaults.controls)) {
                    newDefaults.controls = angular.copy(userDefaults.controls);
                }

                if (isDefined(userDefaults.interactions)) {
                    newDefaults.interactions = angular.copy(userDefaults.interactions);
                }

                if (isDefined(userDefaults.minZoom)) {
                    newDefaults.minZoom = userDefaults.minZoom;
                }

                if (isDefined(userDefaults.maxZoom)) {
                    newDefaults.maxZoom = userDefaults.maxZoom;
                }

            }

            var mapId = obtainEffectiveMapId(defaults, scopeId);
            defaults[mapId] = newDefaults;
            return newDefaults;
        }
    };
}]);

}());