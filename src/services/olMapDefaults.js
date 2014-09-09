angular.module("openlayers-directive").factory('olMapDefaults', function ($q, olHelpers) {
    var _getDefaults = function() {
        return {
            interactions: {
                dragRotate: true,
                doubleClickZoom: true,
                dragPan: true,
                pinchRotate: true,
                pinchZoom: true,
                keyboardPan: true,
                keyboardZoom: true,
                mouseWheelZoom: true,
                dragZoom: true
            },
            tileLayer: {
                type: 'OSM'
            },
            center: {
                lat: 0,
                lon: 0,
                zoom: 1,
                autodiscover: false,
                bounds: [],
                centerUrlHash: false
            },
            controls: {
                attribution: true,
                rotate: false,
                zoom: true
            }
        };
    };

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
                    newDefaults.controls = angular.copy(userDefaults.controls);
                }

                if (isDefined(userDefaults.interactions)) {
                    newDefaults.interactions = angular.copy(userDefaults.interactions);
                }
            }

            var mapId = obtainEffectiveMapId(defaults, scopeId);
            defaults[mapId] = newDefaults;
            return newDefaults;
        }
    };
});
