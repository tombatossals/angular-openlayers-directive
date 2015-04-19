angular.module('openlayers-directive').factory('olHelpers', function($q, $log, $http) {
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

        var styleObject;
        if (Object.prototype.toString.call(style) === '[object Object]') {
            styleObject = {};
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
        } else {
            styleObject = style;
        }
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
                    imageExtent: projection.getExtent(),
                    imageLoadFunction: source.imageLoadFunction
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
                minZoom: view.minZoom,
                extent: view.extent
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
            if (isDefined(events) && angular.isArray(events.layers)) {
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
});
