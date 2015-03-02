angular.module('openlayers-directive', ['ngSanitize'])
       .directive('openlayers', function($log, $q, $compile, olHelpers, olMapDefaults, olData) {
    return {
        restrict: 'EA',
        transclude: true,
        replace: true,
        scope: {
            center: '=olCenter',
            defaults: '=olDefaults',
            view: '=olView',
            events: '=olEvents',
            height: '=',
            width: '='
        },
        template: '<div class="angular-openlayers-map" ng-transclude></div>',
        controller: function($scope) {
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
        },
        link: function(scope, element, attrs) {
            var isDefined = olHelpers.isDefined;
            var createLayer = olHelpers.createLayer;
            var setMapEvents = olHelpers.setMapEvents;
            var createView = olHelpers.createView;
            var defaults = olMapDefaults.setDefaults(scope);

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
                var layer = createLayer(l, view.getProjection());
                map.addLayer(layer);
                map.set('default', true);
            }

            if (!isDefined(attrs.olCenter)) {
                var c = ol.proj.transform([defaults.center.lon, defaults.center.lat],
                                                defaults.center.projection, view.getProjection());
                view.setCenter(c);
                view.setZoom(defaults.center.zoom);
            }

            // Set the Default events for the map
            setMapEvents(defaults.events, map, scope);

            // Resolve the map object to the promises
            scope.setMap(map);
            olData.setMap(map, attrs.id);
            
            // Set width and height if they are defined dynamically
            scope.$watch("height", function (newVal, oldVal) {
            	if (isDefined(newVal)) {
                    if (isNaN(newVal)) {
                        element.css('height', newVal);
                    } else {
                        element.css('height', newVal + 'px');
                    }
                    map.updateSize();
                }
            });
            
            scope.$watch("width", function (newVal, oldVal) {
            	if (isDefined(newVal)) {
                    if (isNaN(newVal)) {
                        element.css('width', newVal);
                    } else {
                        element.css('width', newVal + 'px');
                    }
                    map.updateSize();
                }
            });
        }
    };
});
