angular.module('openlayers-directive')
        .directive('olPath', function($log, $q, olMapDefaults, olHelpers) {

    return {
        restrict: 'E',
        scope: {
            properties: '=olGeomProperties'
        },
        require: ['^openlayers', '?^olLayers'],
        replace: true,
        template: '<div class="popup-label path" ng-bind-html="message"></div>',

        link: function(scope, element, attrs, controllers) {
            var isDefined = olHelpers.isDefined;
            var olMapController = controllers[0];
            var createFeature = olHelpers.createFeature;
            var createOverlay = olHelpers.createOverlay;
            var createVectorLayer = olHelpers.createVectorLayer;
            var olScope = olMapController.getOpenlayersScope();

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
                var mapDefaults = olMapDefaults.getDefaults(olScope);
                var viewProjection = mapDefaults.view.projection;

                getLayers().then(function() {
                    var layer = createVectorLayer();
                    map.addLayer(layer);
                    if (isDefined(attrs.coord)) {
                        var proj = attrs.proj || 'EPSG:4326';
                        var coord = JSON.parse(attrs.coord);
                        var data = {
                            type: 'Polygon',
                            coord: coord,
                            projection: proj
                        };
                        console.log(data);
                        var feature = createFeature(data, viewProjection);
                        layer.getSource().addFeature(feature);

                        if (attrs.message) {
                            scope.message = attrs.message;
                            var pos = ol.proj.transform(coord, proj, viewProjection);
                            var label = createOverlay(element, pos);
                            map.addOverlay(label);
                        }
                        return;
                    }
                });
            });
        }
    };
});
