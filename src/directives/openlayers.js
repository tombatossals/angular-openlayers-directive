angular.module("openlayers-directive", []).directive('openlayers', function ($log, $q, olHelpers, olMapDefaults, olData) {
    var _olMap = $q.defer();
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults',
            tiles: '=tiles'
        },
        transclude: true,
        template: '<div class="angular-openlayers-map"><div ng-transclude></div></div>',
        controller: function ($scope) {

            this.getMap = function () {
                return _olMap.promise;
            };

            this.getOpenlayersScope = function() {
                return $scope;
            };
        },

        link: function(scope, element, attrs) {
            var isDefined = olHelpers.isDefined,
                getLayerObject = olHelpers.getLayerObject,
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

            var controls = ol.control.defaults(defaults.control);
            var interactions = ol.interaction.defaults(defaults.interactions);

            // Create the Openlayers Map Object with the options
            var map = new ol.Map({
                target: element[0],
                controls: controls,
                interactions: interactions
            });

            // If no layer is defined, set the default tileLayer
            if (!isDefined(attrs.layers)) {
                var layer = getLayerObject(defaults.tileLayer);
                map.addLayer(layer);
            }

            if (!isDefined(attrs.center)) {
                map.setView(new ol.View({
                    center: [ defaults.center.lon, defaults.center.lat ],
                    zoom: defaults.center.zoom
                }));
            }

            // Resolve the map object to the promises
            olData.setMap(map, attrs.id);
            _olMap.resolve(map);
        }
    };
});
