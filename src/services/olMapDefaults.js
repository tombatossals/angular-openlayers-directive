angular.module("openlayers-directive").factory('olMapDefaults', function ($q, olHelpers) {
    function _getDefaults() {
        return {
            tileLayer: {
                name: 'OpenStreetMap',
                type: 'OSM',
                sphericalMercator: true,
                projection: 'EPSG:4236'
            },
            center: {
                lat: 0,
                lon: 0,
                zoom: 1
            },
            controls: {
                navigation: {
                    zoomWheelEnabled: true
                },
                zoom: {
                    position: 'topright'
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
            }

            var mapId = obtainEffectiveMapId(defaults, scopeId);
            defaults[mapId] = newDefaults;
            return newDefaults;
        }
    };
});

