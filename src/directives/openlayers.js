angular.module('openlayers-directive', ['ngSanitize']).directive('openlayers', function($log, $q, $compile, olHelpers,
        olMapDefaults, olData) {
        return {
            restrict: 'EA',
            transclude: true,
            replace: true,
            scope: {
                center: '=olCenter',
                defaults: '=olDefaults',
                view: '=olView',
                events: '=olEvents',
                api: '=?api'
            },
            template: '<div class="angular-openlayers-map" ng-transclude></div>',
            controller: function($scope) {
                var _map = $q.defer();
                var _mapObject = null;
                $scope.getMap = function() {
                    return _map.promise;
                };

                $scope.setMap = function(map) {
                    _map.resolve(map);
                    _mapObject = map;
                };

                this.getOpenlayersScope = function() {
                    return $scope;
                };
                
                $scope.api = {
                    getMap: function() {
                        return _mapObject;
                    },
                    getMarkersLayer: function() {
                        var result = null;
                        
                        _mapObject.getLayers().forEach(function (lyr) {
                            if(lyr.get('markers') === true) {
                                result = lyr;
                                return;   
                            }
                        });
                        
                        return result;
                    },
                    centerOnExtent: function() {
                        var extent = ol.extent.createEmpty();
                        _mapObject.getLayers().forEach(function (layer) {
                            var source = layer.getSource();

                            if (source.getExtent) {
                                ol.extent.extend(extent, source.getExtent());
                            }
                        });
                        _mapObject.getView().fit(extent, _mapObject.getSize());
                    }
                };
            },
            link: function(scope, element, attrs) {
                var isDefined = olHelpers.isDefined;
                var createLayer = olHelpers.createLayer;
                var setMapEvents = olHelpers.setMapEvents;
                var setViewEvents = olHelpers.setViewEvents;
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

                scope.$on('$destroy', function() {
                    olData.resetMap(attrs.id);
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

                //Set the Default events for the map view
                setViewEvents(defaults.events, map, scope);

                // Resolve the map object to the promises
                scope.setMap(map);
                olData.setMap(map, attrs.id);
            }
        };
    });
