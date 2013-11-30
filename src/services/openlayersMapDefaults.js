angular.module("openlayers-directive").factory('openlayersMapDefaults', function ($q, openlayersHelpers) {
    function _getDefaults() {
        return {
            keyboard: true,
            dragging: true,
            doubleClickZoom: true,
            scrollWheelZoom: true,
            zoomControl: true,
            attributionControl: true,
            zoomsliderControl: false,
            zoomControlPosition: 'topleft',
            controlLayersPosition: 'topright',
            tileLayer: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            tileLayerOptions: {
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            icon: {
                url: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon.png',
                retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-icon-2x.png',
                size: [25, 41],
                anchor: [12, 40],
                labelAnchor: [10, -20],
                popup: [0, -40],
                shadow: {
                    url: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
                    retinaUrl: 'http://cdn.leafletjs.com/leaflet-0.6.4/images/marker-shadow.png',
                    size: [41, 41],
                    anchor: [12, 40]
                }
            },
            path: {
                weight: 10,
                opacity: 1,
                color: '#0000ff'
            }
        };
    }
    var isDefined = openlayersHelpers.isDefined,
        getDefer = openlayersHelpers.getDefer,
        getUnresolvedDefer = openlayersHelpers.getUnresolvedDefer,
        defaults = {};

    // Get the _defaults dictionary, and override the properties defined by the user
    return {
        getDefaults: function (scopeId) {
            var defer = getDefer(defaults, scopeId);
            return defer.promise;
        },

        setDefaults: function(userDefaults, scopeId) {
            var newDefaults = _getDefaults();

            if (isDefined(userDefaults)) {
                newDefaults.doubleClickZoom = isDefined(userDefaults.doubleClickZoom) ?  userDefaults.doubleClickZoom : newDefaults.doubleClickZoom;
                newDefaults.scrollWheelZoom = isDefined(userDefaults.scrollWheelZoom) ?  userDefaults.scrollWheelZoom : newDefaults.doubleClickZoom;
                newDefaults.zoomControl = isDefined(userDefaults.zoomControl) ?  userDefaults.zoomControl : newDefaults.zoomControl;
                newDefaults.attributionControl = isDefined(userDefaults.attributionControl) ?  userDefaults.attributionControl : newDefaults.attributionControl;
                newDefaults.tileLayer = isDefined(userDefaults.tileLayer) ? userDefaults.tileLayer : newDefaults.tileLayer;
                newDefaults.zoomControlPosition = isDefined(userDefaults.zoomControlPosition) ? userDefaults.zoomControlPosition : newDefaults.zoomControlPosition;
                newDefaults.keyboard = isDefined(userDefaults.keyboard) ? userDefaults.keyboard : newDefaults.keyboard;
                newDefaults.dragging = isDefined(userDefaults.dragging) ? userDefaults.dragging : newDefaults.dragging;
                newDefaults.controlLayersPosition = isDefined(userDefaults.controlLayersPosition) ? userDefaults.controlLayersPosition : newDefaults.controlLayersPosition;

                if (isDefined(userDefaults.tileLayerOptions)) {
                    angular.copy(userDefaults.tileLayerOptions, newDefaults.tileLayerOptions);
                }

                if (isDefined(userDefaults.maxZoom)) {
                    newDefaults.maxZoom = userDefaults.maxZoom;
                }

                if (isDefined(userDefaults.minZoom)) {
                    newDefaults.minZoom = userDefaults.minZoom;
                }
            }

            var openlayersDefaults = getUnresolvedDefer(defaults, scopeId);
            openlayersDefaults.resolve(newDefaults);

            return newDefaults;
        }
    };
});

