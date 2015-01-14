angular.module('openlayers-directive')
        .directive('olPath', function($log, $q, olMapDefaults, olHelpers) {

    return {
        restrict: 'E',
        scope: {
            properties: '=olGeomProperties'
        },
        require: '^openlayers',
        replace: true,
        template: '<div class="popup-label path" ng-bind-html="message"></div>',

        link: function(scope, element, attrs, controller) {
            var isDefined = olHelpers.isDefined;
            var createFeature = olHelpers.createFeature;
            var createOverlay = olHelpers.createOverlay;
            var createVectorLayer = olHelpers.createVectorLayer;
            var olScope = controller.getOpenlayersScope();

            olScope.getMap().then(function(map) {
                var mapDefaults = olMapDefaults.getDefaults(olScope);
                var viewProjection = mapDefaults.view.projection;

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
        }
    };
});
