angular.module('openlayers-directive')
       .directive('olMarker', function($log, $q, olMapDefaults, olHelpers) {

    var getMarkerDefaults = function() {
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
        return {
            projection: 'EPSG:4326',
            lat: 0,
            lon: 0,
            coord: [],
            show: true,
            showOnMouseOver: false,
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 0.90,
                    src: base64icon
                })
            })
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
        require: ['^openlayers', '?^olLayers'],
        replace: true,
        template: '<div class="popup-label" ng-bind-html="message"></div>',

        link: function(scope, element, attrs, controllers) {
            var isDefined = olHelpers.isDefined;
            var olMapController = controllers[0];
            var olScope = olMapController.getOpenlayersScope();
            var createMarkerLayer = olHelpers.createMarkerLayer;
            var createMarker = olHelpers.createMarker;
            var createOverlay = olHelpers.createOverlay;

            var getLayers;
            // If the layers attribute is used, we must wait until the layers are created
            if (isDefined(controllers[1]) && controllers[1] !== null) {
                getLayers = controllers[1].getLayers;
            } else {
                getLayers = function() {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                };
            }

            olScope.getMap().then(function(map) {
                getLayers().then(function() {
                    // Create the markers layer and add it to the map
                    var markerLayer = createMarkerLayer();
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

                        marker = createMarker(data, viewProjection);
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

                            marker = createMarker(data, viewProjection);
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
            });
        }
    };
});
