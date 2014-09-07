angular.module("openlayers-directive").directive('tiles', function ($log, olData, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var isDefined = olHelpers.isDefined,
                olScope  = controller.getOpenlayersScope(),
                getLayerObject = olHelpers.getLayerObject;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id),
                    tileLayerObj = [];

                olScope.$watch("tiles", function(tiles) {
                    if (!isDefined(tiles) || !isDefined(tiles.type)) {
                        $log.warn("[AngularJS - OpenLayers] The 'tiles' definition doesn't have the 'type' property.");
                        tiles = defaults.tileLayer;
                    }

                    if (isDefined(tileLayerObj) && tileLayerObj.length === 1) {
                        map.removeLayer(tileLayerObj[0]);
                        tileLayerObj.pop();
                    }

                    var l = getLayerObject(tiles);
                    map.addLayer(l);
                    tileLayerObj.push(l);

                    olData.setTiles(tileLayerObj, attrs.id);
                }, true);
            });
        }
    };
});
