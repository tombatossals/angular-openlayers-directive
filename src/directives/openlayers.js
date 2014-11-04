angular.module('openlayers-directive', [])
       .directive('openlayers', function($log, $q, olHelpers, olMapDefaults, olData) {
    var _olMap;
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults',
            layers: '=layers',
            markers: '=markers',
            view: '=view',
            controls: '=controls',
            events: '=events'
        },
        transclude: true,
        template: '<div class="angular-openlayers-map"><div ng-transclude></div></div>',
        controller: function($scope) {
            _olMap = $q.defer();
            this.getMap = function() {
                return _olMap.promise;
            };

            this.getOpenlayersScope = function() {
                return $scope;
            };
        },

        link: function(scope, element, attrs) {
            var isDefined = olHelpers.isDefined;
            var createLayer = olHelpers.createLayer;
            var createView = olHelpers.createView;
            var setEvents = olHelpers.setEvents;
            var defaults = olMapDefaults.setDefaults(scope.defaults, attrs.id);

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
            var view = createView(defaults.view);

            // Create the Openlayers Map Object with the options
            var map = new ol.Map({
                target: element[0],
                controls: controls,
                interactions: interactions,
                renderer: defaults.renderer,
                view: view
            });

            // If we don't have to sync controls, set the controls in olData
            if (!isDefined(attrs.controls)) {
                olData.setControls(map.getControls());
            }

            // If no layer is defined, set the default tileLayer
            if (!isDefined(attrs.layers)) {
                var layer = createLayer(defaults.layers.main);
                map.addLayer(layer);
                var olLayers = map.getLayers();
                olData.setLayers(olLayers, attrs.id);
            }

            // If no events ared defined, set the default events
            if (!isDefined(attrs.events)) {
                setEvents(defaults.events, map, scope);
            }

            if (!isDefined(attrs.center)) {
                view.setCenter([defaults.center.lon, defaults.center.lat]);
                view.setZoom(defaults.center.zoom);
            }

            // Resolve the map object to the promises
            olData.setMap(map, attrs.id);
            _olMap.resolve(map);
        }
    };
});
