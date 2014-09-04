angular.module("openlayers-directive").directive('center', function ($log, $parse, olMapDefaults, olHelpers) {
    return {
        restrict: "A",
        scope: false,
        replace: false,
        require: 'openlayers',

        link: function(scope, element, attrs, controller) {
            var safeApply     = olHelpers.safeApply,
                isValidCenter = olHelpers.isValidCenter,
                olScope       = controller.getOpenlayersScope(),
                center        = olScope.center;

            controller.getMap().then(function(map) {
                var defaults = olMapDefaults.getDefaults(attrs.id);
                if (!isValidCenter(center)) {
                    map.setCenter([defaults.center.lon, defaults.center.lat], defaults.center.zoom);
                    return;
                }

                var movingMap = false;
                var centerModel = {
                    lat:  $parse("center.lat"),
                    lon:  $parse("center.lon"),
                    zoom: $parse("center.zoom")
                };

                olScope.$watch("center", function(center) {
                    var point, proj;
                    if (!isValidCenter(center)) {
                        $log.warn("[AngularJS - Openlayers] invalid 'center'");
                        point = new OpenLayers.LonLat(defaults.center.lon, defaults.center.lat);
                        proj = new OpenLayers.Projection("EPSG:4326");
                        point.transform(proj, map.getProjectionObject());
                        map.setCenter(point, defaults.center.zoom);
                        return;
                    }
                    if (movingMap) {
                        // Can't update. The map is moving.
                        return;
                    }
                    point = new OpenLayers.LonLat(center.lon, center.lat);
                    proj = new OpenLayers.Projection("EPSG:4326");
                    point.transform(proj, map.getProjectionObject());
                    map.setCenter(point, center.zoom);
                }, true);

                map.events.register("movestart", map, function() {
                    movingMap = true;
                });

                map.events.register("moveend", map, function() {
                    movingMap = false;
                    safeApply(olScope, function(scope) {
                        centerModel.lat.assign(scope, map.getCenter().lat);
                        centerModel.lon.assign(scope, map.getCenter().lon);
                        centerModel.zoom.assign(scope, map.getZoom());
                    });
                });
            });
        }
    };
});
