(function() {

"use strict";

angular.module('openlayers-directive', ['ngSanitize'])
    .directive('openlayers', ["$log", "$q", "$compile", "olHelpers", "olMapDefaults", "olData", function($log, $q, $compile, olHelpers,
        olMapDefaults, olData) {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                center: '=olCenter',
                defaults: '=olDefaults',
                view: '=olView',
                events: '=olEvents'
            },
            template: '<div class="angular-openlayers-map" ng-transclude></div>',
            controller: ["$scope", function($scope) {
                var _map = $q.defer();
                $scope.getMap = function() {
                    return _map.promise;
                };

                $scope.setMap = function(map) {
                    _map.resolve(map);
                };

                this.getOpenlayersScope = function() {
                    return $scope;
                };
            }],
            link: function(scope, element, attrs) {
                var isDefined = olHelpers.isDefined;
                var createLayer = olHelpers.createLayer;
                var setMapEvents = olHelpers.setMapEvents;
                var createView = olHelpers.createView;
                var defaults = olMapDefaults.setDefaults(scope);

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

                if (isDefined(attrs.lat)) {
                    defaults.center.lat = parseFloat(attrs.lat);
                }

                if (isDefined(attrs.lon)) {
                    defaults.center.lon = parseFloat(attrs.lon);
                }

                if (isDefined(attrs.zoom)) {
                    defaults.center.zoom = parseFloat(attrs.zoom);
                }

                var controls = ol.control.defaults(defaults.controls);
                var interactions = ol.interaction.defaults(defaults.interactions);
                var view = createView(defaults.view);

                // Create the Openlayers Map Object with the options
                var map = new ol.Map({
                    target: element[0],
                    controls: controls,
                    interactions: interactions,
                    renderer: defaults.renderer,
                    view: view
                });

                // If no layer is defined, set the default tileLayer
                if (!attrs.customLayers) {
                    var l = {
                        type: 'Tile',
                        source: {
                            type: 'OSM'
                        }
                    };
                    var layer = createLayer(l, view.getProjection(), 'default');
                    map.addLayer(layer);
                    map.set('default', true);
                }

                if (!isDefined(attrs.olCenter)) {
                    var c = ol.proj.transform([defaults.center.lon,
                            defaults.center.lat
                        ],
                        defaults.center.projection, view.getProjection()
                    );
                    view.setCenter(c);
                    view.setZoom(defaults.center.zoom);
                }

                // Set the Default events for the map
                setMapEvents(defaults.events, map, scope);

                // Resolve the map object to the promises
                scope.setMap(map);
                olData.setMap(map, attrs.id);

            }
        };
    }]);

angular.module('openlayers-directive').directive('olCenter', ["$log", "$location", "olMapDefaults", "olHelpers", function($log, $location, olMapDefaults, olHelpers) {
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
}]);

angular.module('openlayers-directive').directive('olLayer', ["$log", "$q", "olMapDefaults", "olHelpers", function($log, $q, olMapDefaults, olHelpers) {

    return {
        restrict: 'E',
        scope: {
            properties: '=olLayerProperties'
        },
        replace: false,
        require: '^openlayers',
        link: function(scope, element, attrs, controller) {
            var isDefined   = olHelpers.isDefined;
            var equals      = olHelpers.equals;
            var olScope     = controller.getOpenlayersScope();
            var createLayer = olHelpers.createLayer;
            var setVectorLayerEvents = olHelpers.setVectorLayerEvents;
            var detectLayerType = olHelpers.detectLayerType;
            var createStyle = olHelpers.createStyle;
            var isBoolean   = olHelpers.isBoolean;
            var addLayerBeforeMarkers = olHelpers.addLayerBeforeMarkers;
            var isNumber    = olHelpers.isNumber;
            var insertLayer = olHelpers.insertLayer;
            var removeLayer = olHelpers.removeLayer;

            olScope.getMap().then(function(map) {
                var projection = map.getView().getProjection();
                var defaults = olMapDefaults.setDefaults(olScope);
                var layerCollection = map.getLayers();
                var olLayer;

                scope.$on('$destroy', function() {
                    removeLayer(layerCollection, olLayer.index);
                    map.removeLayer(olLayer);
                });

                if (!isDefined(scope.properties)) {
                    if (isDefined(attrs.sourceType) && isDefined(attrs.sourceUrl)) {
                        var l = {
                            source: {
                                url: attrs.sourceUrl,
                                type: attrs.sourceType
                            }
                        };

                        olLayer = createLayer(l, projection, attrs.layerName);
                        if (detectLayerType(l) === 'Vector') {
                            setVectorLayerEvents(defaults.events, map, scope, attrs.name);
                        }
                        addLayerBeforeMarkers(layerCollection, olLayer);
                    }
                    return;
                }

                scope.$watch('properties', function(properties, oldProperties) {
                    if (!isDefined(properties.source) || !isDefined(properties.source.type)) {
                        return;
                    }

                    if (!isDefined(properties.visible)) {
                        properties.visible = true;
                        return;
                    }

                    if (!isDefined(properties.opacity)) {
                        properties.opacity = 1;
                        return;
                    }

                    var style;
                    if (!isDefined(olLayer)) {
                        olLayer = createLayer(properties, projection);
                        if (isDefined(properties.index)) {
                            insertLayer(layerCollection, properties.index, olLayer);
                        } else {
                            addLayerBeforeMarkers(layerCollection, olLayer);
                        }

                        if (detectLayerType(properties) === 'Vector') {
                            setVectorLayerEvents(defaults.events, map, scope, properties.name);
                        }

                        if (isBoolean(properties.visible)) {
                            olLayer.setVisible(properties.visible);
                        }

                        if (properties.opacity) {
                            olLayer.setOpacity(properties.opacity);
                        }

                        if (angular.isArray(properties.extent)) {
                            olLayer.setExtent(properties.extent);
                        }

                        if (properties.style) {
                            if (!angular.isFunction(properties.style)) {
                                style = createStyle(properties.style);
                            } else {
                                style = properties.style;
                            }
                            olLayer.setStyle(style);
                        }

                    } else {

                        if (isDefined(oldProperties) &&
                           !(equals(properties, oldProperties) && equals(properties.style, oldProperties.style))) {

                            if (!equals(properties.source, oldProperties.source)) {
                                var idx = olLayer.index;
                                layerCollection.removeAt(idx);
                                olLayer = createLayer(properties, projection);
                                if (isDefined(olLayer)) {
                                    insertLayer(layerCollection, idx, olLayer);

                                    if (detectLayerType(properties) === 'Vector') {
                                        setVectorLayerEvents(defaults.events, map, scope, properties.name);
                                    }
                                }
                            }

                            if (isDefined(properties.index) && properties.index !== olLayer.index) {
                                removeLayer(layerCollection, olLayer.index);
                                insertLayer(layerCollection, properties.index, olLayer);
                            }

                            if (isBoolean(properties.visible) && properties.visible !== oldProperties.visible) {
                                olLayer.setVisible(properties.visible);
                            }

                            if (properties.opacity !== oldProperties.opacity) {
                                if (isNumber(properties.opacity) || isNumber(parseFloat(properties.opacity))) {
                                    olLayer.setOpacity(properties.opacity);
                                }
                            }

                            if (isDefined(properties.style) && !equals(properties.style, oldProperties.style)) {
                                if (!angular.isFunction(properties.style)) {
                                    style = createStyle(properties.style);
                                } else {
                                    style = properties.style;
                                }
                                olLayer.setStyle(style);
                            }
                        }
                    }
                }, true);
            });
        }
    };
}]);

angular.module('openlayers-directive')
    .directive('olPath', ["$log", "$q", "olMapDefaults", "olHelpers", function($log, $q, olMapDefaults, olHelpers) {

        return {
            restrict: 'E',
            scope: {
                properties: '=olGeomProperties'
            },
            require: '^openlayers',
            replace: true,
            template: '<div class="popup-label path" ng-bind-html="message"></div>',

            link: function(scope, element, attrs, controller) {
                var isDefined = olHelpers.isDefined;
                var createFeature = olHelpers.createFeature;
                var createOverlay = olHelpers.createOverlay;
                var createVectorLayer = olHelpers.createVectorLayer;
                var olScope = controller.getOpenlayersScope();

                olScope.getMap().then(function(map) {
                    var mapDefaults = olMapDefaults.getDefaults(olScope);
                    var viewProjection = mapDefaults.view.projection;

                    var layer = createVectorLayer();
                    map.addLayer(layer);
                    if (isDefined(attrs.coords)) {
                        var proj = attrs.proj || 'EPSG:4326';
                        var coords = JSON.parse(attrs.coords);
                        var data = {
                            type: 'Polygon',
                            coords: coords,
                            projection: proj,
                            style: mapDefaults.styles.path
                        };
                        var feature = createFeature(data, viewProjection);
                        layer.getSource().addFeature(feature);

                        if (attrs.message) {
                            scope.message = attrs.message;
                            var extent = feature.getGeometry().getExtent();
                            var label = createOverlay(element, extent);
                            map.addOverlay(label);
                        }
                        return;
                    }
                });
            }
        };
    }]);

angular.module('openlayers-directive')
       .directive('olView', ["$log", "$q", "olData", "olMapDefaults", "olHelpers", function($log, $q, olData, olMapDefaults, olHelpers) {
    return {
        restrict: 'A',
        scope: false,
        replace: false,
        require: 'openlayers',
        link: function(scope, element, attrs, controller) {
            var olScope = controller.getOpenlayersScope();
            var isNumber = olHelpers.isNumber;
            var safeApply = olHelpers.safeApply;
            var createView = olHelpers.createView;

            olScope.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(olScope);
                var view = olScope.view;

                if (!view.projection) {
                    view.projection = defaults.view.projection;
                }

                if (!view.maxZoom) {
                    view.maxZoom = defaults.view.maxZoom;
                }

                if (!view.minZoom) {
                    view.minZoom = defaults.view.minZoom;
                }

                if (!view.rotation) {
                    view.rotation = defaults.view.rotation;
                }

                var mapView = createView(view);
                map.setView(mapView);

                olScope.$watchCollection('view', function(view) {
                    if (isNumber(view.rotation)) {
                        mapView.setRotation(view.rotation);
                    }
                });

                mapView.on('change:rotation', function() {
                    safeApply(olScope, function(scope) {
                        scope.view.rotation = map.getView().getRotation();
                    });
                });

            });
        }
    };
}]);

angular.module('openlayers-directive')
    .directive('olControl', ["$log", "$q", "olData", "olMapDefaults", "olHelpers", function($log, $q, olData, olMapDefaults, olHelpers) {

        return {
            restrict: 'E',
            scope: {
                properties: '=olControlProperties'
            },
            replace: false,
            require: '^openlayers',
            link: function(scope, element, attrs, controller) {
                var isDefined   = olHelpers.isDefined;
                var olScope   = controller.getOpenlayersScope();
                var olControl;

                olScope.getMap().then(function(map) {
                    var getControlClasses = olHelpers.getControlClasses;
                    var controlClasses = getControlClasses();

                    if (!isDefined(scope.properties)) {
                        if (attrs.name) {
                            olControl = new controlClasses[attrs.name]();
                            map.addControl(olControl);
                        }
                        return;
                    }

                    if (isDefined(scope.properties.control)) {
                        olControl = scope.properties.control;
                        map.addControl(olControl);
                    }

                    scope.$on('$destroy', function() {
                        map.removeControl(olControl);
                    });
                });
            }
        };
    }]);

angular.module('openlayers-directive')
    .directive('olMarker', ["$log", "$q", "olMapDefaults", "olHelpers", function($log, $q, olMapDefaults, olHelpers) {

        var getMarkerDefaults = function() {
            return {
                projection: 'EPSG:4326',
                lat: 0,
                lon: 0,
                coord: [],
                show: true,
                showOnMouseOver: false,
                showOnMouseClick: false
            };
        };

        var markerLayerManager = (function() {
            var mapDict = [];

            function getMapIndex(map) {
                return mapDict.map(function(record) {
                    return record.map;
                }).indexOf(map);
            }

            return {
                getInst: function getMarkerLayerInst(scope, map) {
                    var mapIndex = getMapIndex(map);

                    if (mapIndex === -1) {
                        var markerLayer = olHelpers.createVectorLayer();
                        markerLayer.set('markers', true);
                        map.addLayer(markerLayer);
                        mapDict.push({
                            map: map,
                            markerLayer: markerLayer,
                            instScopes: []
                        });
                        mapIndex = mapDict.length - 1;
                    }

                    mapDict[mapIndex].instScopes.push(scope);

                    return mapDict[mapIndex].markerLayer;
                },
                deregisterScope: function deregisterScope(scope, map) {
                    var mapIndex = getMapIndex(map);
                    if (mapIndex === -1) {
                        throw Error('This map has no markers');
                    }

                    var scopes = mapDict[mapIndex].instScopes;
                    var scopeIndex = scopes.indexOf(scope);
                    if (scopeIndex === -1) {
                        throw Error('Scope wan\'t registered');
                    }

                    scopes.splice(scopeIndex, 1);

                    if (!scopes.length) {
                        map.removeLayer(mapDict[mapIndex].markerLayer);
                        delete mapDict[mapIndex];
                    }
                }
            };
        })();
        return {
            restrict: 'E',
            scope: {
                lat: '=lat',
                lon: '=lon',
                label: '=label',
                properties: '=olMarkerProperties'
            },
            transclude: true,
            require: '^openlayers',
            replace: true,
            template:
            '<div class="popup-label marker">' +
                '<div ng-bind-html="message"></div>' +
                '<ng-transclude></ng-transclude>' +
            '</div>',

            link: function(scope, element, attrs, controller) {
                var isDefined = olHelpers.isDefined;
                var olScope = controller.getOpenlayersScope();
                var createFeature = olHelpers.createFeature;
                var createOverlay = olHelpers.createOverlay;

                var hasTranscluded = element.find('ng-transclude').children().length > 0;

                olScope.getMap().then(function(map) {
                    var markerLayer = markerLayerManager.getInst(scope, map);
                    var data = getMarkerDefaults();

                    var mapDefaults = olMapDefaults.getDefaults(olScope);
                    var viewProjection = mapDefaults.view.projection;
                    var label;
                    var pos;
                    var marker;

                    scope.$on('$destroy', function() {
                        markerLayerManager.deregisterScope(scope, map);
                    });

                    if (!isDefined(scope.properties)) {
                        data.lat = scope.lat ? scope.lat : data.lat;
                        data.lon = scope.lon ? scope.lon : data.lon;
                        data.message = attrs.message;
                        data.style = mapDefaults.styles.marker;

                        marker = createFeature(data, viewProjection);
                        if (!isDefined(marker)) {
                            $log.error('[AngularJS - Openlayers] Received invalid data on ' +
                                'the marker.');
                        }
                        markerLayer.getSource().addFeature(marker);

                        if (data.message || hasTranscluded) {
                            scope.message = attrs.message;
                            pos = ol.proj.transform([data.lon, data.lat], data.projection,
                                viewProjection);
                            label = createOverlay(element, pos);
                            map.addOverlay(label);
                        }
                        return;
                    }

                    scope.$watch('properties', function(properties) {
                        function showLabelOnEvent(evt) {
                            if (properties.label.show) {
                                return;
                            }
                            var found = false;
                            var pixel = map.getEventPixel(evt);
                            var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                                return feature;
                            });

                            var actionTaken = false;
                            if (feature === marker) {
                                actionTaken = true;
                                found = true;
                                if (!isDefined(label)) {
                                    if (data.projection === 'pixel') {
                                        pos = data.coord;
                                    } else {
                                        pos = ol.proj.transform([data.lon, data.lat],
                                            data.projection, viewProjection);
                                    }
                                    label = createOverlay(element, pos);
                                    map.addOverlay(label);
                                }
                                map.getTarget().style.cursor = 'pointer';
                            }

                            if (!found && label) {
                                actionTaken = true;
                                map.removeOverlay(label);
                                label = undefined;
                                map.getTarget().style.cursor = '';
                            }

                            if (actionTaken) {
                                evt.preventDefault();
                            }
                        }

                        if (!isDefined(marker)) {
                            data.projection = properties.projection ? properties.projection :
                                data.projection;
                            data.coord = properties.coord ? properties.coord : data.coord;
                            data.lat = properties.lat ? properties.lat : data.lat;
                            data.lon = properties.lon ? properties.lon : data.lon;

                            if (isDefined(properties.style)) {
                                data.style = properties.style;
                            } else {
                                data.style = mapDefaults.styles.marker;
                            }

                            marker = createFeature(data, viewProjection);
                            if (!isDefined(marker)) {
                                $log.error('[AngularJS - Openlayers] Received invalid data on ' +
                                    'the marker.');
                            }
                            markerLayer.getSource().addFeature(marker);
                        }

                        if (isDefined(label)) {
                            map.removeOverlay(label);
                        }

                        if (!isDefined(properties.label)) {
                            return;
                        }

                        scope.message = properties.label.message;
                        if (!hasTranscluded && (!isDefined(scope.message) || scope.message.length === 0)) {
                            return;
                        }

                        if (properties.label && properties.label.show === true) {
                            if (data.projection === 'pixel') {
                                pos = data.coord;
                            } else {
                                pos = ol.proj.transform([data.lon, data.lat], data.projection,
                                    viewProjection);
                            }
                            label = createOverlay(element, pos);
                            map.addOverlay(label);
                        }

                        if (label && properties.label && properties.label.show === false) {
                            map.removeOverlay(label);
                            label = undefined;
                        }

                        if (properties.label && properties.label.show === false &&
                            properties.label.showOnMouseOver) {
                            map.getViewport().addEventListener('mousemove', showLabelOnEvent);
                        }

                        if (properties.label && properties.label.show === false &&
                            properties.label.showOnMouseClick) {
                            map.getViewport().addEventListener('click', showLabelOnEvent);
                            map.getViewport().querySelector('canvas.ol-unselectable').addEventListener(
                                'touchend', showLabelOnEvent);
                        }
                    }, true);
                });
            }
        };
    }]);

angular.module('openlayers-directive').service('olData', ["$log", "$q", "olHelpers", function($log, $q, olHelpers) {
    var obtainEffectiveMapId = olHelpers.obtainEffectiveMapId;

    var maps = {};

    var setResolvedDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId);
        d[id].resolvedDefer = true;
    };

    var getUnresolvedDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId);
        var defer;

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
        var id = obtainEffectiveMapId(d, mapId);
        var defer;

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

}]);

angular.module('openlayers-directive').factory('olHelpers', ["$q", "$log", "$http", function($q, $log, $http) {
    var isDefined = function(value) {
        return angular.isDefined(value);
    };

    var setEvent = function(map, eventType, scope) {
        if (eventType === 'pointermove') {
            map.on('pointermove', function(e) {
                var coord = e.coordinate;
                var proj = map.getView().getProjection().getCode();
                if (proj === 'pixel') {
                    coord = coord.map(function(v) {
                        return parseInt(v, 10);
                    });
                    scope.$emit('openlayers.map.' + eventType, {
                        coord: coord,
                        projection: proj
                    });
                } else {
                    scope.$emit('openlayers.map.' + eventType, {
                        lat: coord[1],
                        lon: coord[0],
                        projection: proj
                    });
                }
            });
        } else if (eventType === 'singleclick') {
            map.on('singleclick', function(e) {
                var coord = e.coordinate;
                var proj = map.getView().getProjection().getCode();
                if (proj === 'pixel') {
                    coord = coord.map(function(v) {
                        return parseInt(v, 10);
                    });
                    scope.$emit('openlayers.map.' + eventType, {
                        coord: coord,
                        projection: proj
                    });
                } else {
                    scope.$emit('openlayers.map.' + eventType, {
                        lat: coord[1],
                        lon: coord[0],
                        projection: proj
                    });
                }
            });
        }
    };

    var bingImagerySets = [
      'Road',
      'Aerial',
      'AerialWithLabels',
      'collinsBart',
      'ordnanceSurvey'
    ];

    var getControlClasses = function() {
        return {
            attribution: ol.control.Attribution,
            fullscreen: ol.control.FullScreen,
            mouseposition: ol.control.MousePosition,
            rotate: ol.control.Rotate,
            scaleline: ol.control.ScaleLine,
            zoom: ol.control.Zoom,
            zoomslider: ol.control.ZoomSlider,
            zoomtoextent: ol.control.ZoomToExtent
        };
    };

    var mapQuestLayers = ['osm', 'sat', 'hyb'];

    var styleMap = {
        'style': ol.style.Style,
        'fill': ol.style.Fill,
        'stroke': ol.style.Stroke,
        'circle': ol.style.Circle,
        'icon': ol.style.Icon,
        'image': ol.style.Image,
        'regularshape': ol.style.RegularShape,
        'text': ol.style.Text
    };

    var optionalFactory = function(style, Constructor) {
        if (Constructor && style instanceof Constructor) {
            return style;
        } else if (Constructor) {
            return new Constructor(style);
        } else {
            return style;
        }
    };

    //Parse the style tree calling the appropriate constructors.
    //The keys in styleMap can be used and the OpenLayers constructors can be
    //used directly.
    var createStyle = function recursiveStyle(data, styleName) {
        var style;
        if (!styleName) {
            styleName = 'style';
            style = data;
        } else {
            style = data[styleName];
        }
        //Instead of defining one style for the layer, we've been given a style function
        //to apply to each feature.
        if (styleName === 'style' && data instanceof Function) {
            return data;
        }

        if (!(style instanceof Object)) {
            return style;
        }

        var styleObject = {};
        var styleConstructor = styleMap[styleName];
        if (styleConstructor && style instanceof styleConstructor) {
            return style;
        }
        Object.getOwnPropertyNames(style).forEach(function(val, idx, array) {
            //Consider the case
            //image: {
            //  circle: {
            //     fill: {
            //       color: 'red'
            //     }
            //   }
            //
            //An ol.style.Circle is an instance of ol.style.Image, so we do not want to construct
            //an Image and then construct a Circle.  We assume that if we have an instanceof
            //relationship, that the JSON parent has exactly one child.
            //We check to see if an inheritance relationship exists.
            //If it does, then for the parent we create an instance of the child.
            var valConstructor = styleMap[val];
            if (styleConstructor && valConstructor &&
               valConstructor.prototype instanceof styleMap[styleName]) {
                console.assert(array.length === 1, 'Extra parameters for ' + styleName);
                styleObject = recursiveStyle(style, val);
                return optionalFactory(styleObject, valConstructor);
            } else {
                styleObject[val] = recursiveStyle(style, val);
                styleObject[val] = optionalFactory(styleObject[val], styleMap[val]);
            }
        });
        return optionalFactory(styleObject, styleMap[styleName]);
    };

    var detectLayerType = function(layer) {
        if (layer.type) {
            return layer.type;
        } else {
            switch (layer.source.type) {
                case 'ImageWMS':
                    return 'Image';
                case 'ImageStatic':
                    return 'Image';
                case 'GeoJSON':
                    return 'Vector';
                case 'JSONP':
                    return 'Vector';
                case 'TopoJSON':
                    return 'Vector';
                case 'KML':
                    return 'Vector';
                default:
                    return 'Tile';
            }
        }
    };

    var createProjection = function(view) {
        var oProjection;

        switch (view.projection) {
            case 'pixel':
                if (!isDefined(view.extent)) {
                    $log.error('[AngularJS - Openlayers] - You must provide the extent of the image ' +
                               'if using pixel projection');
                    return;
                }
                oProjection = new ol.proj.Projection({
                    code: 'pixel',
                    units: 'pixels',
                    extent: view.extent
                });
                break;
            default:
                oProjection = new ol.proj.get(view.projection);
                break;
        }

        return oProjection;
    };

    var isValidStamenLayer = function(layer) {
        return ['watercolor', 'terrain', 'toner'].indexOf(layer) !== -1;
    };

    var createSource = function(source, projection) {
        var oSource;

        switch (source.type) {
            case 'MapBox':
                if (!source.mapId || !source.accessToken) {
                    $log.error('[AngularJS - Openlayers] - MapBox layer requires the map id and the access token');
                    return;
                }
                var url = 'http://api.tiles.mapbox.com/v4/' + source.mapId + '/{z}/{x}/{y}.png?access_token=' +
                    source.accessToken;

                var pixelRatio = window.devicePixelRatio;

                if (pixelRatio > 1) {
                    url = url.replace('.png', '@2x.png');
                }

                oSource = new ol.source.XYZ({
                    url: url,
                    tilePixelRatio: pixelRatio > 1 ? 2 : 1
                });
                break;
            case 'ImageWMS':
                if (!source.url || !source.params) {
                    $log.error('[AngularJS - Openlayers] - ImageWMS Layer needs ' +
                               'valid server url and params properties');
                }
                oSource = new ol.source.ImageWMS({
                  url: source.url,
                  crossOrigin: source.crossOrigin ? source.crossOrigin : 'anonymous',
                  params: source.params
                });
                break;

            case 'TileWMS':
                if ((!source.url && !source.urls) || !source.params) {
                    $log.error('[AngularJS - Openlayers] - TileWMS Layer needs ' +
                               'valid url (or urls) and params properties');
                }

                var wmsConfiguration = {
                  crossOrigin: source.crossOrigin ? source.crossOrigin : 'anonymous',
                  params: source.params
                };

                if (wmsConfiguration.url) {
                    wmsConfiguration.url = source.url;
                }

                if (source.urls) {
                    wmsConfiguration.urls = source.urls;
                }

                oSource = new ol.source.TileWMS(wmsConfiguration);
                break;
            case 'OSM':
                if (source.attribution) {
                    var attributions = [];
                    if (isDefined(source.attribution)) {
                        attributions.unshift(new ol.Attribution({ html: source.attribution }));
                    }
                    oSource = new ol.source.OSM({
                        attributions: attributions
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
                    $log.error('[AngularJS - Openlayers] - You need an API key to show the Bing Maps.');
                    return;
                }

                oSource = new ol.source.BingMaps({
                    key: source.key,
                    imagerySet: source.imagerySet ? source.imagerySet : bingImagerySets[0]
                });

                break;

            case 'MapQuest':
                if (!source.layer || mapQuestLayers.indexOf(source.layer) === -1) {
                    $log.error('[AngularJS - Openlayers] - MapQuest layers needs a valid \'layer\' property.');
                    return;
                }

                oSource = new ol.source.MapQuest({
                    layer: source.layer
                });

                break;

            case 'GeoJSON':
                if (!(source.geojson || source.url)) {
                    $log.error('[AngularJS - Openlayers] - You need a geojson ' +
                               'property to add a GeoJSON layer.');
                    return;
                }

                if (isDefined(source.url)) {
                    oSource = new ol.source.GeoJSON({
                        projection: projection,
                        url: source.url
                    });
                } else {
                    if (!isDefined(source.geojson.projection)) {
                        source.geojson.projection = projection;
                    }
                    oSource = new ol.source.GeoJSON(source.geojson);
                }

                break;
            case 'JSONP':
                if (!(source.url)) {
                    $log.error('[AngularJS - Openlayers] - You need an url properly configured to add a JSONP layer.');
                    return;
                }

                if (isDefined(source.url)) {
                    oSource = new ol.source.ServerVector({
                        format: new ol.format.GeoJSON(),
                        loader: function(/*extent, resolution, projection*/) {
                            var url = source.url +
                                      '&outputFormat=text/javascript&format_options=callback:JSON_CALLBACK';
                            $http.jsonp(url, { cache: source.cache})
                                .success(function(response) {
                                    oSource.addFeatures(oSource.readFeatures(response));
                                })
                                .error(function(response) {
                                    $log(response);
                                });
                        },
                        projection: projection
                    });
                }
                break;
            case 'TopoJSON':
                if (!(source.topojson || source.url)) {
                    $log.error('[AngularJS - Openlayers] - You need a topojson ' +
                               'property to add a TopoJSON layer.');
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

            case 'TileTMS':
                if (!source.url || !source.tileGrid) {
                    $log.error('[AngularJS - Openlayers] - TileTMS Layer needs valid url and tileGrid properties');
                }
                oSource = new ol.source.TileImage({
                    url: source.url,
                    maxExtent: source.maxExtent,
                    tileGrid: new ol.tilegrid.TileGrid({
                        origin: source.tileGrid.origin,
                        resolutions: source.tileGrid.resolutions
                    }),
                    tileUrlFunction: function(tileCoord) {

                        var z = tileCoord[0];
                        var x = tileCoord[1];
                        var y = tileCoord[2]; //(1 << z) - tileCoord[2] - 1;

                        if (x < 0 || y < 0) {
                            return '';
                        }

                        var url = source.url + z + '/' + x + '/' + y + '.png';

                        return url;
                    }
                });
                break;
            case 'TileImage':
                oSource = new ol.source.TileImage({
                    url: source.url,
                    tileGrid: new ol.tilegrid.TileGrid({
                        origin: source.tileGrid.origin, // top left corner of the pixel projection's extent
                        resolutions: source.tileGrid.resolutions
                    }),
                  tileUrlFunction: function(tileCoord/*, pixelRatio, projection*/) {
                        var z = tileCoord[0];
                        var x = tileCoord[1];
                        var y = -tileCoord[2] - 1;
                        var url = source.url
                            .replace('{z}', z.toString())
                            .replace('{x}', x.toString())
                            .replace('{y}', y.toString());
                        return url;
                    }
                });
                break;
            case 'KML':
                var extractStyles = source.extractStyles || false;
                oSource = new ol.source.KML({
                    url: source.url,
                    projection: source.projection,
                    radius: source.radius,
                    extractStyles: extractStyles
                });
                break;
            case 'Stamen':
                if (!source.layer || !isValidStamenLayer(source.layer)) {
                    $log.error('[AngularJS - Openlayers] - You need a valid Stamen layer.');
                    return;
                }
                oSource = new ol.source.Stamen({
                    layer: source.layer
                });
                break;
            case 'ImageStatic':
                if (!source.url || !angular.isArray(source.imageSize) || source.imageSize.length !== 2) {
                    $log.error('[AngularJS - Openlayers] - You need a image URL to create a ImageStatic layer.');
                    return;
                }

                oSource = new ol.source.ImageStatic({
                    url: source.url,
                    imageSize: source.imageSize,
                    projection: projection,
                    imageExtent: projection.getExtent()
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

        createView: function(view) {
            var projection = createProjection(view);

            return new ol.View({
                projection: projection,
                maxZoom: view.maxZoom,
                minZoom: view.minZoom
            });
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
                   (typeof center.autodiscover === 'boolean' ||
                    angular.isNumber(center.lat) && angular.isNumber(center.lon) ||
                   (angular.isArray(center.coord) && center.coord.length === 2 &&
                    angular.isNumber(center.coord[0]) && angular.isNumber(center.coord[1])) ||
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
            var urlProj = center.projection || 'EPSG:4326';
            var urlCenter = [center.lon, center.lat];
            var mapProj = map.getView().getProjection();
            var mapCenter = ol.proj.transform(map.getView().getCenter(), mapProj, urlProj);
            var zoom = map.getView().getZoom();
            if (mapCenter[1].toFixed(4) === urlCenter[1].toFixed(4) &&
                mapCenter[0].toFixed(4) === urlCenter[0].toFixed(4) &&
                zoom === center.zoom) {
                return true;
            }
            return false;
        },

        setCenter: function(view, projection, newCenter, map) {

            if (map && view.getCenter()) {
                var pan = ol.animation.pan({
                    duration: 150,
                    source: (view.getCenter())
                });
                map.beforeRender(pan);
            }

            if (newCenter.projection === projection) {
                view.setCenter([newCenter.lon, newCenter.lat]);
            } else {
                var coord = [newCenter.lon, newCenter.lat];
                view.setCenter(ol.proj.transform(coord, newCenter.projection, projection));
            }
        },

        setZoom: function(view, zoom, map) {
            var z = ol.animation.zoom({
                duration: 150,
                resolution: map.getView().getResolution()
            });
            map.beforeRender(z);
            view.setZoom(zoom);
        },

        isBoolean: function(value) {
            return typeof value === 'boolean';
        },

        obtainEffectiveMapId: function(d, mapId) {
            var id;
            var i;
            if (!angular.isDefined(mapId)) {
                if (Object.keys(d).length === 1) {
                    for (i in d) {
                        if (d.hasOwnProperty(i)) {
                            id = i;
                        }
                    }
                } else if (Object.keys(d).length === 0) {
                    id = 'main';
                } else {
                    $log.error('[AngularJS - Openlayers] - You have more than 1 map on the DOM, ' +
                               'you must provide the map ID to the olData.getXXX call');
                }
            } else {
                id = mapId;
            }
            return id;
        },

        createStyle: createStyle,

        setMapEvents: function(events, map, scope) {
            if (isDefined(events) && angular.isArray(events.map)) {
                for (var i in events.map) {
                    var event = events.map[i];
                    setEvent(map, event, scope);
                }
            }
        },

        setVectorLayerEvents: function(events, map, scope, layerName) {
            console.log(events, map, scope, layerName);
            if (isDefined(events) && angular.isArray(events.layers)) {
                console.log('hola');
                angular.forEach(events.layers, function(eventType) {
                    angular.element(map.getViewport()).on(eventType, function(evt) {
                        var pixel = map.getEventPixel(evt);
                        var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                            return feature;
                        });
                        if (isDefined(feature)) {
                            scope.$emit('openlayers.layers.' + layerName + '.' + eventType, feature, evt);
                        }
                    });
                });
            }
        },

        detectLayerType: detectLayerType,

        createLayer: function(layer, projection) {
            var oLayer;
            var type = detectLayerType(layer);
            var oSource = createSource(layer.source, projection);
            if (!oSource) {
                return;
            }

            switch (type) {
                case 'Image':
                    oLayer = new ol.layer.Image({ source: oSource });
                    break;
                case 'Tile':
                    oLayer = new ol.layer.Tile({ source: oSource });
                    break;
                case 'Heatmap':
                    oLayer = new ol.layer.Heatmap({ source: oSource });
                    break;
                case 'Vector':
                    oLayer = new ol.layer.Vector({ source: oSource });
                    break;
            }

            return oLayer;
        },

        createVectorLayer: function() {
            return new ol.layer.Vector({
                source: new ol.source.Vector()
            });
        },

        notifyCenterUrlHashChanged: function(scope, center, search) {
            if (center.centerUrlHash) {
                var centerUrlHash = center.lat.toFixed(4) + ':' + center.lon.toFixed(4) + ':' + center.zoom;
                if (!isDefined(search.c) || search.c !== centerUrlHash) {
                    scope.$emit('centerUrlHash', centerUrlHash);
                }
            }
        },

        getControlClasses: getControlClasses,

        detectControls: function(controls) {
            var actualControls = {};
            var controlClasses = getControlClasses();

            controls.forEach(function(control) {
                for (var i in controlClasses) {
                    if (control instanceof controlClasses[i]) {
                        actualControls[i] = control;
                    }
                }
            });

            return actualControls;
        },

        createFeature: function(data, viewProjection) {
            var geometry;

            switch (data.type) {
                case 'Polygon':
                    geometry = new ol.geom.Polygon(data.coords);
                    break;
                default:
                    if (isDefined(data.coord) && data.projection === 'pixel') {
                        geometry = new ol.geom.Point(data.coord);
                    } else {
                        geometry = new ol.geom.Point([data.lon, data.lat]);
                    }
                    break;
            }

            if (isDefined(data.projection) && data.projection !== 'pixel') {
                geometry = geometry.transform(data.projection, viewProjection);
            }

            var feature = new ol.Feature({
                geometry: geometry
            });

            if (isDefined(data.style)) {
                var style = createStyle(data.style);
                feature.setStyle(style);
            }
            return feature;
        },
        addLayerBeforeMarkers: function(layers, layer) {
            var markersIndex;
            for (var i = 0; i < layers.getLength(); i++) {
                var l = layers.item(i);

                if (l.get('markers')) {
                    markersIndex = i;
                    break;
                }
            }

            if (isDefined(markersIndex)) {
                var markers = layers.item(markersIndex);
                layer.index = markersIndex;
                layers.setAt(markersIndex, layer);
                markers.index = layers.getLength();
                layers.push(markers);
            } else {
                layer.index = layers.getLength();
                layers.push(layer);
            }

        },

        removeLayer: function(layers, index) {
            layers.removeAt(index);
            for (var i = index; i < layers.getLength(); i++) {
                var l = layers.item(i);
                if (l === null) {
                    layers.insertAt(i, null);
                    break;
                } else {
                    l.index = i;
                }
            }
        },

        insertLayer: function(layers, index, layer) {
            if (layers.getLength() < index) {
                while (layers.getLength() < index) {
                    layers.push(null);
                }
                layer.index = index;
                layers.push(layer);
            } else {
                layer.index = index;
                layers.insertAt(layer.index, layer);
                for (var i = index + 1; i < layers.getLength(); i++) {
                    var l = layers.item(i);
                    if (l === null) {
                        layers.removeAt(i);
                        break;
                    } else {
                        l.index = i;
                    }
                }
            }
        },

        createOverlay: function(element, pos) {
            element.css('display', 'block');
            var ov = new ol.Overlay({
                position: pos,
                element: element,
                positioning: 'center-left'
            });

            return ov;
        }
    };
}]);

angular.module('openlayers-directive').factory('olMapDefaults', ["$q", "olHelpers", function($q, olHelpers) {
    var base64icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAGmklEQVRYw' +
                    '7VXeUyTZxjvNnfELFuyIzOabermMZEeQC/OclkO49CpOHXOLJl/CAURuYbQi3KLgEhbrhZ1aDwmaoGq' +
                    'KII6odATmH/scDFbdC7LvFqOCc+e95s2VG50X/LLm/f4/Z7neY/ne18aANCmAr5E/xZf1uDOkTcGcWR' +
                    '6hl9247tT5U7Y6SNvWsKT63P58qbfeLJG8M5qcgTknrvvrdDbsT7Ml+tv82X6vVxJE33aRmgSyYtcWV' +
                    'MqX97Yv2JvW39UhRE2HuyBL+t+gK1116ly06EeWFNlAmHxlQE0OMiV6mQCScusKRlhS3QLeVJdl1+23' +
                    'h5dY4FNB3thrbYboqptEFlphTC1hSpJnbRvxP4NWgsE5Jyz86QNNi/5qSUTGuFk1gu54tN9wuK2wc3o' +
                    '+Wc13RCmsoBwEqzGcZsxsvCSy/9wJKf7UWf1mEY8JWfewc67UUoDbDjQC+FqK4QqLVMGGR9d2wurKzq' +
                    'Bk3nqIT/9zLxRRjgZ9bqQgub+DdoeCC03Q8j+0QhFhBHR/eP3U/zCln7Uu+hihJ1+bBNffLIvmkyP0g' +
                    'pBZWYXhKussK6mBz5HT6M1Nqpcp+mBCPXosYQfrekGvrjewd59/GvKCE7TbK/04/ZV5QZYVWmDwH1mF' +
                    '3xa2Q3ra3DBC5vBT1oP7PTj4C0+CcL8c7C2CtejqhuCnuIQHaKHzvcRfZpnylFfXsYJx3pNLwhKzRAw' +
                    'AhEqG0SpusBHfAKkxw3w4627MPhoCH798z7s0ZnBJ/MEJbZSbXPhER2ih7p2ok/zSj2cEJDd4CAe+5W' +
                    'YnBCgR2uruyEw6zRoW6/DWJ/OeAP8pd/BGtzOZKpG8oke0SX6GMmRk6GFlyAc59K32OTEinILRJRcha' +
                    'h8HQwND8N435Z9Z0FY1EqtxUg+0SO6RJ/mmXz4VuS+DpxXC3gXmZwIL7dBSH4zKE50wESf8qwVgrP1E' +
                    'IlTO5JP9Igu0aexdh28F1lmAEGJGfh7jE6ElyM5Rw/FDcYJjWhbeiBYoYNIpc2FT/SILivp0F1ipDWk' +
                    '4BIEo2VuodEJUifhbiltnNBIXPUFCMpthtAyqws/BPlEF/VbaIxErdxPphsU7rcCp8DohC+GvBIPJS/' +
                    'tW2jtvTmmAeuNO8BNOYQeG8G/2OzCJ3q+soYB5i6NhMaKr17FSal7GIHheuV3uSCY8qYVuEm1cOzqdW' +
                    'r7ku/R0BDoTT+DT+ohCM6/CCvKLKO4RI+dXPeAuaMqksaKrZ7L3FE5FIFbkIceeOZ2OcHO6wIhTkNo0' +
                    'ffgjRGxEqogXHYUPHfWAC/lADpwGcLRY3aeK4/oRGCKYcZXPVoeX/kelVYY8dUGf8V5EBRbgJXT5QIP' +
                    'hP9ePJi428JKOiEYhYXFBqou2Guh+p/mEB1/RfMw6rY7cxcjTrneI1FrDyuzUSRm9miwEJx8E/gUmql' +
                    'yvHGkneiwErR21F3tNOK5Tf0yXaT+O7DgCvALTUBXdM4YhC/IawPU+2PduqMvuaR6eoxSwUk75ggqsY' +
                    'J7VicsnwGIkZBSXKOUww73WGXyqP+J2/b9c+gi1YAg/xpwck3gJuucNrh5JvDPvQr0WFXf0piyt8f8/' +
                    'WI0hV4pRxxkQZdJDfDJNOAmM0Ag8jyT6hz0WGXWuP94Yh2jcfjmXAGvHCMslRimDHYuHuDsy2QtHuIa' +
                    'vznhbYURq5R57KpzBBRZKPJi8eQg48h4j8SDdowifdIrEVdU+gbO6QNvRRt4ZBthUaZhUnjlYObNagV' +
                    '3keoeru3rU7rcuceqU1mJBxy+BWZYlNEBH+0eH4vRiB+OYybU2hnblYlTvkHinM4m54YnxSyaZYSF6R' +
                    '3jwgP7udKLGIX6r/lbNa9N6y5MFynjWDtrHd75ZvTYAPO/6RgF0k76mQla3FGq7dO+cH8sKn0Vo7nDl' +
                    'lwAhqwLPkxrHwWmHJOo+AKJ4rab5OgrM7rVu8eWb2Pu0Dh4eDgXoOfvp7Y7QeqknRmvcTBEyq9m/HQQ' +
                    'SCSz6LHq3z0yzsNySRfMS253wl2KyRDbcZPcfJKjZmSEOjcxyi+Y8dUOtsIEH6R2wNykdqrkYJ0RV92' +
                    'H0W58pkfQk7cKevsLK10Py8SdMGfXNXATY+pPbyJR/ET6n9nIfztNtZYRV9XniQu9IA2vOVgy4ir7GC' +
                    'LVmmd+zjkH0eAF9Po6K61pmCXHxU5rHMYd1ftc3owjwRSVRzLjKvqZEty6cRUD7jGqiOdu5HG6MdHjN' +
                    'cNYGqfDm5YRzLBBCCDl/2bk8a8gdbqcfwECu62Fg/HrggAAAABJRU5ErkJggg==';

    var _getDefaults = function() {
        return {
            view: {
                projection: 'EPSG:3857',
                minZoom: undefined,
                maxZoom: undefined,
                rotation: 0,
                extent: undefined
            },
            center: {
                lat: 0,
                lon: 0,
                zoom: 1,
                autodiscover: false,
                bounds: [],
                centerUrlHash: false,
                projection: 'EPSG:4326'
            },
            styles: {
                path: {
                    stroke: {
                        color: 'blue',
                        width: 8
                    }
                },
                marker: {
                    image: new ol.style.Icon({
                        anchor: [0.5, 1],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'fraction',
                        opacity: 0.90,
                        src: base64icon
                    })
                }
            },
            events: {
                map: [],
                markers: [],
                layers: []
            },
            controls: {
                attribution: true,
                rotate: false,
                zoom: true
            },
            interactions: {
                mouseWheelZoom: false
            },
            renderer: 'canvas'
        };
    };

    var isDefined = olHelpers.isDefined;
    var defaults = {};

    // Get the _defaults dictionary, and override the properties defined by the user
    return {
        getDefaults: function(scope) {
            if (!isDefined(scope)) {
                for (var i in defaults) {
                    return defaults[i];
                }
            }
            return defaults[scope.$id];
        },

        setDefaults: function(scope) {
            var userDefaults = scope.defaults;
            var scopeId = scope.$id;
            var newDefaults = _getDefaults();

            if (isDefined(userDefaults)) {

                if (isDefined(userDefaults.layers)) {
                    newDefaults.layers = angular.copy(userDefaults.layers);
                }

                if (isDefined(userDefaults.controls)) {
                    newDefaults.controls = angular.copy(userDefaults.controls);
                }

                if (isDefined(userDefaults.events)) {
                    newDefaults.events = angular.copy(userDefaults.events);
                }

                if (isDefined(userDefaults.interactions)) {
                    newDefaults.interactions = angular.copy(userDefaults.interactions);
                }

                if (isDefined(userDefaults.renderer)) {
                    newDefaults.renderer = userDefaults.renderer;
                }

                if (isDefined(userDefaults.view)) {
                    newDefaults.view.maxZoom = userDefaults.view.maxZoom || newDefaults.view.maxZoom;
                    newDefaults.view.minZoom = userDefaults.view.minZoom || newDefaults.view.minZoom;
                    newDefaults.view.projection = userDefaults.view.projection || newDefaults.view.projection;
                    newDefaults.view.extent = userDefaults.view.extent || newDefaults.view.extent;
                }

                if (isDefined(userDefaults.styles)) {
                    newDefaults.styles = angular.extend(newDefaults.styles, userDefaults.styles);
                }

            }

            defaults[scopeId] = newDefaults;
            return newDefaults;
        }
    };
}]);

}());