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

                // This function handles dragging a marker
                var pickOffset = null;
                var pickProperties = null;
                function handleDrag(evt) {
                    var coord = evt.coordinate;
                    var proj = map.getView().getProjection().getCode();
                    if (proj === 'pixel') {
                        coord = coord.map(function(v) {
                            return parseInt(v, 10);
                        });
                    } else {
                        coord = ol.proj.transform(coord, proj, 'EPSG:4326');
                    }

                    if (evt.type === 'pointerdown') {
                        // Get feature under mouse if any
                        var feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                            return feature;
                        });
                        // Get associated marker properties
                        pickProperties = (feature ? feature.get('marker') : null);
                        if (!pickProperties || !pickProperties.draggable) {
                            pickProperties = null;
                            return;
                        }
                        map.getTarget().style.cursor = 'pointer';
                        if (proj === 'pixel') {
                            pickOffset = [coord[0] - pickProperties.coord[0], coord[1] - pickProperties.coord[1]];
                        } else {
                            pickOffset = [coord[0] - pickProperties.lon, coord[1] - pickProperties.lat];
                        }
                        evt.preventDefault();
                    } else if (pickOffset && pickProperties) {
                        if (evt.type === 'pointerup') {
                            map.getTarget().style.cursor = '';
                            pickOffset = null;
                            pickProperties = null;
                            evt.preventDefault();
                        } else if (evt.type === 'pointerdrag') {
                            evt.preventDefault();
                            scope.$apply(function() {
                                // Add current delta to marker initial position
                                if (proj === 'pixel') {
                                    pickProperties.coord[0] = coord[0] - pickOffset[0];
                                    pickProperties.coord[1] = coord[1] - pickOffset[1];
                                } else {
                                    pickProperties.lon = coord[0] - pickOffset[0];
                                    pickProperties.lat = coord[1] - pickOffset[1];
                                }
                            });
                        }
                    }
                }

                // Setup generic handlers for marker drag
                map.on('pointerdown', handleDrag);
                map.on('pointerup', handleDrag);
                map.on('pointerdrag', handleDrag);

                scope.$on('$destroy', function() {
                    markerLayer.getSource().removeFeature(marker);
                    if (isDefined(label)) {
                        map.removeOverlay(label);
                    }
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
                    // Add a link between the feature and the marker properties
                    marker.set('marker', scope);
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

                    // Remove previous listeners if any
                    map.getViewport().removeEventListener('mousemove', properties.handleInteraction);
                    map.getViewport().removeEventListener('click', properties.handleTapInteraction);
                    map.getViewport().querySelector('canvas.ol-unselectable').removeEventListener(
                        'touchend', properties.handleTapInteraction);
                    map.getViewport().removeEventListener('mousemove', properties.showAtLeastOneOverlay);
                    map.getViewport().removeEventListener('click', properties.removeAllOverlays);

                    // This function handles popup on mouse over/click
                    properties.handleInteraction = function(evt) {
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
                                    pos = properties.coord;
                                } else {
                                    pos = ol.proj.transform([properties.lon, properties.lat],
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
                    };

                    // Made to filter out click/tap events if both are being triggered on this platform
                    properties.handleTapInteraction = (function() {
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
                                properties.handleInteraction.apply(null, arguments);
                                activateCooldown();
                            }
                        };
                    })();

                    properties.showAtLeastOneOverlay = function(evt) {
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
                                angular.forEach(map.getOverlays(), function(value) {
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
                    };

                    properties.removeAllOverlays = function(evt) {
                        angular.forEach(map.getOverlays(), function(value) {
                            map.removeOverlay(value);
                        });
                        evt.preventDefault();
                    };

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
                        // Add a link between the feature and the marker properties
                        marker.set('marker', properties);
                        markerLayer.getSource().addFeature(marker);
                    } else {
                        var requestedPosition;
                        if (properties.projection === 'pixel') {
                            requestedPosition = properties.coord;
                        } else {
                            requestedPosition = ol.proj.transform([properties.lon, properties.lat], data.projection,
                                map.getView().getProjection());
                        }

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

                    // Then setup new ones according to properties
                    if (properties.label && properties.label.show === false &&
                        properties.label.showOnMouseOver) {
                        map.getViewport().addEventListener('mousemove', properties.handleInteraction);
                    }

                    if ((properties.label && properties.label.show === false &&
                        properties.label.showOnMouseClick) ||
                        properties.onClick) {
                        map.getViewport().addEventListener('click', properties.handleTapInteraction);
                        map.getViewport().querySelector('canvas.ol-unselectable').addEventListener(
                            'touchend', properties.handleTapInteraction);
                    }

                    if ((properties.label && properties.label.show === false &&
                        properties.label.keepOneOverlayVisible)) {
                        map.getViewport().addEventListener('mousemove', properties.showAtLeastOneOverlay);
                        map.getViewport().addEventListener('click', properties.removeAllOverlays);
                    }
                }, true);
            });
        }
    };
});
