angular.module('openlayers-directive')
       .directive('olMarker', function($log, $q, olMapDefaults, olHelpers) {

    var getMarkerDefaults = function() {
        return {
            projection: 'EPSG:4326',
            lat: 0,
            lon: 0,
            coord: [],
            show: true,
            showOnMouseOver: false
        };
    };

    return {
        restrict: 'E',
        scope: {
            lat: '=lat',
            lon: '=lon',
            label: '=label',
            properties: '=olMarkerProperties'
        },
        require: '^openlayers',
        replace: true,
        template: '<div class="popup-label marker" ng-bind-html="message"></div>',

        link: function(scope, element, attrs, controller) {
            var isDefined = olHelpers.isDefined;
            var olScope = controller.getOpenlayersScope();
            var createVectorLayer = olHelpers.createVectorLayer;
            var createFeature = olHelpers.createFeature;
            var createOverlay = olHelpers.createOverlay;

            olScope.getMap().then(function(map) {
                var markerLayer = createVectorLayer();
                markerLayer.set('markers', true);
                map.addLayer(markerLayer);
                var data = getMarkerDefaults();

                var mapDefaults = olMapDefaults.getDefaults(olScope);
                var viewProjection = mapDefaults.view.projection;
                var label;
                var pos;
                var marker;

                scope.$on('$destroy', function() {
                    map.removeLayer(markerLayer);
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

                    if (data.message) {
                        scope.message = attrs.message;
                        pos = ol.proj.transform([data.lon, data.lat], data.projection, viewProjection);
                        label = createOverlay(element, pos);
                        map.addOverlay(label);
                    }
                    return;
                }

                scope.$watch('properties', function(properties) {
                    if (!isDefined(marker)) {
                        data.projection = properties.projection ? properties.projection : data.projection;
                        data.coord = properties.coord ? properties.coord : data.coord;
                        data.lat = properties.lat ? properties.lat : data.lat;
                        data.lon = properties.lon ? properties.lon : data.lon;
                        data.style = mapDefaults.styles.marker;

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
                    if (!isDefined(scope.message) || scope.message.length === 0) {
                        return;
                    }

                    if (properties.label && properties.label.show === true) {
                        if (data.projection === 'pixel') {
                            pos = data.coord;
                        } else {
                            pos = ol.proj.transform([data.lon, data.lat], data.projection, viewProjection);
                        }
                        label = createOverlay(element, pos);
                        map.addOverlay(label);
                    }

                    if (label && properties.label && properties.label.show === false) {
                        map.removeOverlay(label);
                        label = undefined;
                    }

                    if (properties.label && properties.label.show === false && properties.label.showOnMouseOver) {
                        map.getViewport().addEventListener('mousemove', function(evt) {
                            if (properties.label.show) {
                                return;
                            }
                            var found = false;
                            var pixel = map.getEventPixel(evt);
                            var feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                                return feature;
                            });

                            if (feature === marker) {
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
                                map.removeOverlay(label);
                                label = undefined;
                                map.getTarget().style.cursor = '';
                            }
                        });
                    }
                }, true);
            });
        }
    };
});
