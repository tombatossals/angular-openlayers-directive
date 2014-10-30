angular.module("openlayers-directive", []).directive('openlayers', function ($log, $q, olHelpers, olMapDefaults, olData) {
    var _olMap;
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults',
            layers: '=layers',
            markers: '=markers',
            events: '=events'
        },
        transclude: true,
        template: '<div class="angular-openlayers-map"><div ng-transclude></div></div>',
        controller: function ($scope) {
            _olMap = $q.defer();
            this.getMap = function () {
                return _olMap.promise;
            };

            this.getOpenlayersScope = function() {
                return $scope;
            };
        },

        link: function(scope, element, attrs) {
            var isDefined = olHelpers.isDefined,
                createLayer = olHelpers.createLayer,
                createProjection = olHelpers.createProjection,
                setEvents = olHelpers.setEvents,
                defaults = olMapDefaults.setDefaults(scope.defaults, attrs.id);

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
            var projection = createProjection(defaults.view.projection);

            // Create the Openlayers Map Object with the options
            var map = new ol.Map({
                target: element[0],
                controls: controls,
                interactions: interactions,
                renderer: defaults.renderer,
                view: new ol.View({
                    projection: projection,
                    maxZoom: defaults.view.maxZoom,
                    minZoom: defaults.view.minZoom,
                })
            });

            // If no layer is defined, set the default tileLayer
            if (!isDefined(attrs.layers)) {
                var layer = createLayer(defaults.layers.main);
                map.addLayer(layer);
            }

            // If no events ared defined, set the default events
            if (!isDefined(attrs.events)) {
                setEvents(defaults.events, map, scope);
            }

            if (!isDefined(attrs.center)) {
                var view = map.getView();
                view.setCenter([ defaults.center.lon, defaults.center.lat ]);
                view.setZoom(defaults.center.zoom);
            }

            // Resolve the map object to the promises
            olData.setMap(map, attrs.id);
            _olMap.resolve(map);
        }
    };
});
