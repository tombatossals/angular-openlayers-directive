angular.module("openlayers-directive", []).directive('openlayers', function ($log, $q, olHelpers, olMapDefaults, olData) {
    var _olMap;
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults'
        },
        template: '<div class="angular-openlayers-map"></div>',
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

            // Create the Openlayers Map Object with the options
            var map = new OpenLayers.Map();
            _olMap.resolve(map);

            // If no layers nor tiles defined, set the default tileLayer
            if (!isDefined(attrs.tiles) && (!isDefined(attrs.layers))) {
                var layer = getLayerObject(defaults.tileLayer);
                map.addLayer(layer);
            }

            if (isDefined(defaults.controls.navigation.zoomWheelEnabled) && defaults.controls.navigation.zoomWheelEnabled === true) {
                var controls = map.getControlsByClass('OpenLayers.Control.Navigation');
                for (var i=0; i<controls.length; i++) {
                    controls[i].disableZoomWheel();
                }
            }

            map.render(element[0]);
            if (!isDefined(attrs.center)) {
                map.zoomToMaxExtent();
            }

            // Resolve the map object to the promises
            olData.setMap(map, attrs.id);
        }
    };
});
