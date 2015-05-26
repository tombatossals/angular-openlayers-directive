angular.module('openlayers-directive').directive('olMarker', function($log, $q, olMapDefaults, olHelpers) {

    var getMarkerDefaults = function() {
        return {
            projection: 'EPSG:4326',
            lat: 0,
            lon: 0,
            coord: [],
            show: true,
            showOnMouseOver: false,
            showOnMouseClick: false,
            keepOneOverlayVisible: false
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
            properties: '=olMarkerProperties',
            style: '=olStyle'
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
                    markerLayer.getSource().removeFeature(marker);
                    markerLayerManager.deregisterScope(scope, map);
                });

                if (!isDefined(scope.properties)) {
                    data.lat = scope.lat ? scope.lat : data.lat;
                    data.lon = scope.lon ? scope.lon : data.lon;
                    data.message = attrs.message;
                    data.style = scope.style ? scope.style : mapDefaults.styles.marker;

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

                    // Made to filter out click/tap events if both are being triggered on this platform
                    var handleTapInteraction = (function() {
                        var cooldownActive = false;
                        var prevTimeout;

                        // Sets the cooldown flag to filter out any subsequent events within 500 ms
                        function activateCooldown() {
                            cooldownActive = true;
                            if (prevTimeout) {
                                clearTimeout(prevTimeout);
                            }
                            prevTimeout = setTimeout(function() {
                                cooldownActive = false;
                                prevTimeout = null;
                            }, 500);
                        }

                        // Preventing from 'touchend' to be considered a tap, if fired immediately after 'touchmove'
                        map.getViewport().querySelector('canvas.ol-unselectable').addEventListener(
                            'touchmove', activateCooldown);

                        return function() {
                            if (!cooldownActive) {
                                handleInteraction.apply(null, arguments);
                                activateCooldown();
                            }
                        };
                    })();

                    function handleInteraction(evt) {
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

                            if (properties.onClick && (evt.type === 'click' || evt.type === 'touchend')) {
                                scope.$apply(function() {
                                    properties.onClick.call(marker, evt, properties);
                                });
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

                    function showAtLeastOneOverlay(evt) {
                        if (properties.label.show) {
                            return;
                        }
                        var found = false;
                        var pixel = map.getEventPixel(evt);
                        var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
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
                                angular.forEach(map.getOverlays(), function (value, key) {
                                    map.removeOverlay(value);
                                });
                                map.addOverlay(label);
                            }
                            map.getTarget().style.cursor = 'pointer';
                        }

                        if (!found && label) {
                            actionTaken = true;
                            label = undefined;
                            map.getTarget().style.cursor = '';
                        }

                        if (actionTaken) {
                            evt.preventDefault();
                        }
                    }
                    
                    function removeAllOverlays(evt) {
                        angular.forEach(map.getOverlays(), function (value, key) {
                            map.removeOverlay(value);
                        });
                        evt.preventDefault();
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
                    } else {
                        var requestedPosition = ol.proj.transform([properties.lon, properties.lat], data.projection,
                                                     map.getView().getProjection());

                        if (!angular.equals(marker.getGeometry().getCoordinates(), requestedPosition)) {
                            var geometry = new ol.geom.Point(requestedPosition);
                            marker.setGeometry(geometry);
                        }
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
                            pos = ol.proj.transform([properties.lon, properties.lat], data.projection,
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
                        map.getViewport().addEventListener('mousemove', handleInteraction);
                    }

                    if ((properties.label && properties.label.show === false &&
                        properties.label.showOnMouseClick) ||
                        properties.onClick) {
                        map.getViewport().addEventListener('click', handleTapInteraction);
                        map.getViewport().querySelector('canvas.ol-unselectable').addEventListener(
                            'touchend', handleTapInteraction);
                    }
                    
                    if ((properties.label && properties.label.show === false &&
                        properties.label.keepOneOverlayVisible)) {
                        map.getViewport().addEventListener('mousemove', showAtLeastOneOverlay);
                        map.getViewport().addEventListener('click', removeAllOverlays);
                    }
                }, true);
            });
        }
    };
});
