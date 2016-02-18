angular.module('openlayers-directive').factory('olHelpers', function($q, $log, $http) {

    var isDefined = function(value) {
        return angular.isDefined(value);
    };

    var isDefinedAndNotNull = function(value) {
        return angular.isDefined(value) && value !== null;
    };

    var setEvent = function(map, eventType, scope) {
        map.on(eventType, function(event) {
            var coord = event.coordinate;
            var proj = map.getView().getProjection().getCode();
            if (proj === 'pixel') {
                coord = coord.map(function(v) {
                    return parseInt(v, 10);
                });
            }
            scope.$emit('openlayers.map.' + eventType, {
                'coord': coord,
                'projection': proj,
                'event': event
            });
        });
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
            overviewmap: ol.control.OverviewMap,
            rotate: ol.control.Rotate,
            scaleline: ol.control.ScaleLine,
            zoom: ol.control.Zoom,
            zoomslider: ol.control.ZoomSlider,
            zoomtoextent: ol.control.ZoomToExtent
        };
    };

    var mapQuestLayers = ['osm', 'sat', 'hyb'];

    var esriBaseLayers = ['World_Imagery', 'World_Street_Map', 'World_Topo_Map',
                          'World_Physical_Map', 'World_Terrain_Base',
                          'Ocean_Basemap', 'NatGeo_World_Map'];

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

                    // if the value is 'text' and it contains a String, then it should be interpreted
                    // as such, 'cause the text style might effectively contain a text to display
                    if (val !== 'text' && typeof styleObject[val] !== 'string') {
                        styleObject[val] = optionalFactory(styleObject[val], styleMap[val]);
                    }
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
                case 'JSONP':
                case 'TopoJSON':
                case 'KML':
                case 'TileVector':
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
        var geojsonFormat = new ol.format.GeoJSON(); // used in various switch stmnts below

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
                    attributions: createAttribution(source),
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
                    attributions: createAttribution(source),
                    crossOrigin: (typeof source.crossOrigin === 'undefined') ? 'anonymous' : source.crossOrigin,
                    params: source.params,
                    ratio: source.ratio
                });
                break;

            case 'TileWMS':
                if ((!source.url && !source.urls) || !source.params) {
                    $log.error('[AngularJS - Openlayers] - TileWMS Layer needs ' +
                               'valid url (or urls) and params properties');
                }

                var wmsConfiguration = {
                    crossOrigin: (typeof source.crossOrigin === 'undefined') ? 'anonymous' : source.crossOrigin,
                    params: source.params,
                    attributions: createAttribution(source)
                };

                if (source.serverType) {
                    wmsConfiguration.serverType = source.serverType;
                }

                if (source.url) {
                    wmsConfiguration.url = source.url;
                }

                if (source.urls) {
                    wmsConfiguration.urls = source.urls;
                }

                oSource = new ol.source.TileWMS(wmsConfiguration);
                break;

            case 'WMTS':
                if ((!source.url && !source.urls) || !source.tileGrid) {
                    $log.error('[AngularJS - Openlayers] - WMTS Layer needs valid url ' +
                               '(or urls) and tileGrid properties');
                }

                var wmtsConfiguration = {
                    projection: projection,
                    layer: source.layer,
                    attributions: createAttribution(source),
                    matrixSet: (source.matrixSet === 'undefined') ? projection : source.matrixSet,
                    format: (source.format === 'undefined') ? 'image/jpeg' : source.format,
                    requestEncoding: (source.requestEncoding === 'undefined') ?
                        'KVP' : source.requestEncoding,
                    tileGrid: new ol.tilegrid.WMTS({
                        origin: source.tileGrid.origin,
                        resolutions: source.tileGrid.resolutions,
                        matrixIds: source.tileGrid.matrixIds
                    })
                };

                if (isDefined(source.url)) {
                    wmtsConfiguration.url = source.url;
                }

                if (isDefined(source.urls)) {
                    wmtsConfiguration.urls = source.urls;
                }

                oSource = new ol.source.WMTS(wmtsConfiguration);
                break;

            case 'OSM':
                oSource = new ol.source.OSM({
                    attributions: createAttribution(source)
                });

                if (source.url) {
                    oSource.setUrl(source.url);
                }

                break;
            case 'BingMaps':
                if (!source.key) {
                    $log.error('[AngularJS - Openlayers] - You need an API key to show the Bing Maps.');
                    return;
                }

                var bingConfiguration = {
                    key: source.key,
                    attributions: createAttribution(source),
                    imagerySet: source.imagerySet ? source.imagerySet : bingImagerySets[0],
                    culture: source.culture
                };

                if (source.maxZoom) {
                    bingConfiguration.maxZoom = source.maxZoom;
                }

                oSource = new ol.source.BingMaps(bingConfiguration);
                break;

            case 'MapQuest':
                if (!source.layer || mapQuestLayers.indexOf(source.layer) === -1) {
                    $log.error('[AngularJS - Openlayers] - MapQuest layers needs a valid \'layer\' property.');
                    return;
                }

                oSource = new ol.source.MapQuest({
                    attributions: createAttribution(source),
                    layer: source.layer
                });

                break;

            case 'EsriBaseMaps':
                if (!source.layer || esriBaseLayers.indexOf(source.layer) === -1) {
                    $log.error('[AngularJS - Openlayers] - ESRI layers needs a valid \'layer\' property.');
                    return;
                }

                var _urlBase = 'http://services.arcgisonline.com/ArcGIS/rest/services/';
                var _url = _urlBase + source.layer + '/MapServer/tile/{z}/{y}/{x}';

                oSource = new ol.source.XYZ({
                    attributions: createAttribution(source),
                    url: _url
                });

                break;

            case 'GeoJSON':
                if (!(source.geojson || source.url)) {
                    $log.error('[AngularJS - Openlayers] - You need a geojson ' +
                               'property to add a GeoJSON layer.');
                    return;
                }

                if (isDefined(source.url)) {
                    oSource = new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: source.url
                    });
                } else {
                    oSource = new ol.source.Vector();

                    var projectionToUse = projection;
                    if (isDefined(source.geojson.projection)) {
                        projectionToUse = source.geojson.projection;
                    }

                    var features = geojsonFormat.readFeatures(
                        source.geojson.object, {
                            featureProjection: projectionToUse,
                            dataProjection: projectionToUse
                        });

                    oSource.addFeatures(features);
                }

                break;
            case 'JSONP':
                if (!(source.url)) {
                    $log.error('[AngularJS - Openlayers] - You need an url properly configured to add a JSONP layer.');
                    return;
                }

                if (isDefined(source.url)) {
                    oSource = new ol.source.ServerVector({
                        format: geojsonFormat,
                        loader: function(/*extent, resolution, projection*/) {
                            var url = source.url +
                                      '&outputFormat=text/javascript&format_options=callback:JSON_CALLBACK';
                            $http.jsonp(url, { cache: source.cache})
                                .success(function(response) {
                                    oSource.addFeatures(geojsonFormat.readFeatures(response));
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
                    oSource = new ol.source.Vector({
                        format: new ol.format.TopoJSON(),
                        url: source.url
                    });
                } else {
                    oSource = new ol.source.Vector(angular.extend(source.topojson, {
                        format: new ol.format.TopoJSON()
                    }));
                }
                break;
            case 'TileJSON':
                oSource = new ol.source.TileJSON({
                    url: source.url,
                    attributions: createAttribution(source),
                    crossOrigin: 'anonymous'
                });
                break;

            case 'TileVector':
                if (!source.url || !source.format) {
                    $log.error('[AngularJS - Openlayers] - TileVector Layer needs valid url and format properties');
                }
                oSource = new ol.source.TileVector({
                    url: source.url,
                    projection: projection,
                    attributions: createAttribution(source),
                    format: source.format,
                    tileGrid: new ol.tilegrid.createXYZ({
                        maxZoom: source.maxZoom || 19
                    })
                });
                break;

            case 'TileTMS':
                if (!source.url || !source.tileGrid) {
                    $log.error('[AngularJS - Openlayers] - TileTMS Layer needs valid url and tileGrid properties');
                }
                oSource = new ol.source.TileImage({
                    url: source.url,
                    maxExtent: source.maxExtent,
                    attributions: createAttribution(source),
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
                    attributions: createAttribution(source),
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
                oSource = new ol.source.Vector({
                    url: source.url,
                    format: new ol.format.KML(),
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
                    attributions: createAttribution(source),
                    imageSize: source.imageSize,
                    projection: projection,
                    imageExtent: projection.getExtent(),
                    imageLoadFunction: source.imageLoadFunction
                });
                break;
            case 'XYZ':
                if (!source.url && !source.tileUrlFunction) {
                    $log.error('[AngularJS - Openlayers] - XYZ Layer needs valid url or tileUrlFunction properties');
                }
                oSource = new ol.source.XYZ({
                    url: source.url,
                    attributions: createAttribution(source),
                    minZoom: source.minZoom,
                    maxZoom: source.maxZoom,
                    projection: source.projection,
                    tileUrlFunction: source.tileUrlFunction
                });
                break;
            case 'Zoomify':
                if (!source.url || !angular.isArray(source.imageSize) || source.imageSize.length !== 2) {
                    $log.error('[AngularJS - Openlayers] - Zoomify Layer needs valid url and imageSize properties');
                }
                oSource = new ol.source.Zoomify({
                    url: source.url,
                    size: source.imageSize
                });
                break;
        }

        // log a warning when no source could be created for the given type
        if (!oSource) {
            $log.warn('[AngularJS - Openlayers] - No source could be found for type "' + source.type + '"');
        }

        return oSource;
    };

    var createAttribution = function(source) {
        var attributions = [];
        if (isDefined(source.attribution)) {
            attributions.unshift(new ol.Attribution({html: source.attribution}));
        }
        return attributions;
    };

    var createGroup = function(name) {
        var olGroup = new ol.layer.Group();
        olGroup.set('name', name);

        return olGroup;
    };

    var getGroup = function(layers, name) {
        var layer;

        angular.forEach(layers, function(l) {
            if (l instanceof ol.layer.Group && l.get('name') === name) {
                layer = l;
                return;
            }
        });

        return layer;
    };

    var addLayerBeforeMarkers = function(layers, layer) {
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

    };

    var removeLayer = function(layers, index) {
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

            var viewConfig = {
                projection: projection,
                maxZoom: view.maxZoom,
                minZoom: view.minZoom
            };

            if (view.center) {
                viewConfig.center = view.center;
            }
            if (view.extent) {
                viewConfig.extent = view.extent;
            }
            if (view.zoom) {
                viewConfig.zoom = view.zoom;
            }
            if (view.resolutions) {
                viewConfig.resolutions = view.resolutions;
            }

            return new ol.View(viewConfig);
        },

        // Determine if a reference is defined and not null
        isDefinedAndNotNull: isDefinedAndNotNull,

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
                        var feature = map.forEachFeatureAtPixel(pixel, function(feature, olLayer) {
                            // only return the feature if it is in this layer (based on the name)
                            return (isDefinedAndNotNull(olLayer) && olLayer.get('name') === layerName) ? feature : null;
                        });
                        if (isDefinedAndNotNull(feature)) {
                            scope.$emit('openlayers.layers.' + layerName + '.' + eventType, feature, evt);
                        }
                    });
                });
            }
        },

        setViewEvents: function(events, map, scope) {
            if (isDefined(events) && angular.isArray(events.view)) {
                var view = map.getView();
                angular.forEach(events.view, function(eventType) {
                    view.on(eventType, function(event) {
                        scope.$emit('openlayers.view.' + eventType, view, event);
                    });
                });
            }
        },

        detectLayerType: detectLayerType,

        createLayer: function(layer, projection, name) {
            var oLayer;
            var type = detectLayerType(layer);
            var oSource = createSource(layer.source, projection);
            if (!oSource) {
                return;
            }

            // Manage clustering
            if ((type === 'Vector') && layer.clustering) {
                oSource = new ol.source.Cluster({
                    source: oSource,
                    distance: layer.clusteringDistance
                });
            }

            var layerConfig = { source: oSource };

            // ol.layer.Layer configuration options
            if (isDefinedAndNotNull(layer.opacity)) {
                layerConfig.opacity = layer.opacity;
            }
            if (isDefinedAndNotNull(layer.visible)) {
                layerConfig.visible = layer.visible;
            }
            if (isDefinedAndNotNull(layer.extent)) {
                layerConfig.extent = layer.extent;
            }
            if (isDefinedAndNotNull(layer.zIndex)) {
                layerConfig.zIndex = layer.zIndex;
            }
            if (isDefinedAndNotNull(layer.minResolution)) {
                layerConfig.minResolution = layer.minResolution;
            }
            if (isDefinedAndNotNull(layer.maxResolution)) {
                layerConfig.maxResolution = layer.maxResolution;
            }

            switch (type) {
                case 'Image':
                    oLayer = new ol.layer.Image(layerConfig);
                    break;
                case 'Tile':
                    oLayer = new ol.layer.Tile(layerConfig);
                    break;
                case 'Heatmap':
                    oLayer = new ol.layer.Heatmap(layerConfig);
                    break;
                case 'Vector':
                    oLayer = new ol.layer.Vector(layerConfig);
                    break;
            }

            // set a layer name if given
            if (isDefined(name)) {
                oLayer.set('name', name);
            } else if (isDefined(layer.name)) {
                oLayer.set('name', layer.name);
            }

            // set custom layer properties if given
            if (isDefined(layer.customAttributes)) {
                for (var key in layer.customAttributes) {
                    oLayer.set(key, layer.customAttributes[key]);
                }
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

        addLayerBeforeMarkers: addLayerBeforeMarkers,

        getGroup: getGroup,

        addLayerToGroup: function(layers, layer, name) {
            var groupLayer = getGroup(layers, name);

            if (!isDefined(groupLayer)) {
                groupLayer = createGroup(name);
                addLayerBeforeMarkers(layers, groupLayer);
            }

            layer.set('group', name);
            addLayerBeforeMarkers(groupLayer.getLayers(), layer);
        },

        removeLayerFromGroup: function(layers, layer, name) {
            var groupLayer = getGroup(layers, name);
            layer.set('group');
            removeLayer(groupLayer.getLayers(), layer.index);
        },

        removeLayer: removeLayer,

        insertLayer: function(layers, index, layer) {
            if (layers.getLength() < index) {
                // fill up with "null layers" till we get to the desired index
                while (layers.getLength() < index) {
                    var nullLayer = new ol.layer.Image();
                    nullLayer.index = layers.getLength(); // add index which will be equal to the length in this case
                    layers.push(nullLayer);
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
