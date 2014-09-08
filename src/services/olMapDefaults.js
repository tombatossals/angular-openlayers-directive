angular.module("openlayers-directive").factory('olMapDefaults', function ($q, olHelpers) {
    function _getDefaults() {
        return {
            tileLayer: {
                type: 'OSM'
            },
            center: {
                coord: [ 0, 0],
                zoom: 1
            },
            controls: {
                zoom: {
                    position: 'topright',
                    mouseWheelEnabled: true
                }
            }
        };
    }
    var isDefined = olHelpers.isDefined,
        obtainEffectiveMapId = olHelpers.obtainEffectiveMapId,
        defaults = {};

    // Get the _defaults dictionary, and override the properties defined by the user
    return {
        getDefaults: function (scopeId) {
            var mapId = obtainEffectiveMapId(defaults, scopeId);
            return defaults[mapId];
        },

        setDefaults: function(userDefaults, scopeId) {
            var newDefaults = _getDefaults();

            if (isDefined(userDefaults)) {
                newDefaults.tileLayer = isDefined(userDefaults.tileLayer) ? userDefaults.tileLayer : newDefaults.tileLayer;

                if (isDefined(userDefaults.controls)) {
                    if (isDefined(userDefaults.controls.zoom)) {
                        newDefaults.controls.zoom.mouseWheelEnabled = isDefined(userDefaults.controls.zoom.mouseWheelEnabled) ? userDefaults.controls.zoom.mouseWheelEnabled : newDefaults.controls.zoom.mouseWheelEnabled;
                    }
                }
            }

            var mapId = obtainEffectiveMapId(defaults, scopeId);
            defaults[mapId] = newDefaults;
            return newDefaults;
        }
    };
});
