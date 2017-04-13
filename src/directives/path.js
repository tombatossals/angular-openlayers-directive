angular.module('openlayers-directive').directive('olPath', function($log, $q, olMapDefaults, olHelpers) {

    return {
        restrict: 'E',
        scope: {
            properties: '=olGeomProperties',
            style: '=olStyle'
        },
        require: '^openlayers',
        replace: true,
        template: '<div class="popup-label path" ng-bind-html="message"></div>',

        link: function(scope, element, attrs, controller) {
            var isDefined = olHelpers.isDefined;
            var createFeature = olHelpers.createFeature;
            var createOverlay = olHelpers.createOverlay;
            var createVectorLayer = olHelpers.createVectorLayer;
            var insertLayer = olHelpers.insertLayer;
            var removeLayer = olHelpers.removeLayer;
            var olScope = controller.getOpenlayersScope();

            olScope.getMap().then(function(map) {
                var mapDefaults = olMapDefaults.getDefaults(olScope);
                var viewProjection = mapDefaults.view.projection;

                var layer = createVectorLayer();
                var layerCollection = map.getLayers();

                insertLayer(layerCollection, layerCollection.getLength(), layer);
                var label;

                scope.$on('$destroy', function() {
                    if (label) {
                        map.removeOverlay(label);
                    }
                    map.removeLayer(layer);
                    removeLayer(layerCollection, layer.index);

                });

                if (isDefined(attrs.coords)) {
                    var proj = attrs.proj || 'EPSG:4326';
                    var coords = JSON.parse(attrs.coords);
                    var data = {
                        type: 'Polygon',
                        coords: coords,
                        projection: proj,
                        style:  scope.style ? scope.style : mapDefaults.styles.path
                    };
                    var feature = createFeature(data, viewProjection);
                    layer.getSource().addFeature(feature);

                    if (attrs.message) {
                        scope.message = attrs.message;
                        var extent = feature.getGeometry().getExtent();
                        label = createOverlay(element, extent);
                        map.addOverlay(label);
                    }
                    return;
                }
            });
        }
    };
});
