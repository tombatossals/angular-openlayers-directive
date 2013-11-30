angular.module("openlayers-directive", []).directive('openlayers', function ($log, $q, openlayersHelpers, openlayersMapDefaults, openlayersData) {
    var _openlayersMap;
    return {
        restrict: "EA",
        replace: true,
        scope: {
            center: '=center',
            defaults: '=defaults'
        },
        template: '<div class="angular-openlayers-map"></div>',
        controller: function ($scope) {
            _openlayersMap = $q.defer();
            this.getMap = function () {
                return _openlayersMap.promise;
            };

            this.getOpenlayersScope = function() {
                return $scope;
            };
        },

        link: function(scope, element, attrs) {
            var isDefined = openlayersHelpers.isDefined;

            openlayersMapDefaults.setDefaults(scope.defaults, attrs.id);

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
            _openlayersMap.resolve(map);

            // If no layers nor tiles defined, set the default tileLayer
            if (!isDefined(attrs.tiles) && (!isDefined(attrs.layers))) {
                var layer = new OpenLayers.Layer.OSM();
                map.addLayer(layer);
                openlayersData.setTiles(layer);
            }

            map.render(element[0]);
            if (!isDefined(attrs.center)) {
                map.zoomToMaxExtent();
            }

            // Resolve the map object to the promises
            openlayersData.setMap(map, attrs.id);
        }
    };
});
