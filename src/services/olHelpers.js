angular.module("openlayers-directive").factory('olHelpers', function ($q, $log) {
    var isDefined = function(value) {
        return angular.isDefined(value);
    };

    return {
        // Determine if a reference is defined
        isDefined: isDefined,

        // Determine if a reference is a number
        isNumber: function(value) {
            return angular.isNumber(value);
        },

        // Determine if a reference is defined and not null
        isDefinedAndNotNull: function(value) {
            return angular.isDefined(value) && value !== null;
        },

        // Determine if a reference is a string
        isString: function(value) {
            return angular.isString(value);
        },

        // Determine if a reference is an array
        isArray: function(value) {
            return angular.isArray(value);
        },

        // Determine if a reference is an object
        isObject: function(value) {
            return angular.isObject(value);
        },

        // Determine if two objects have the same properties
        equals: function(o1, o2) {
            return angular.equals(o1, o2);
        },

        isValidCenter: function(center) {
            return angular.isDefined(center) && angular.isNumber(center.lat) &&
                   angular.isNumber(center.lon) && angular.isNumber(center.zoom);
        },

        safeApply: function($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                $scope.$eval(fn);
            } else {
                $scope.$apply(fn);
            }
        },

        obtainEffectiveMapId: function(d, mapId) {
            var id, i;
            if (!angular.isDefined(mapId)) {
                if (Object.keys(d).length === 1) {
                    for (i in d) {
                        if (d.hasOwnProperty(i)) {
                            id = i;
                        }
                    }
                } else if (Object.keys(d).length === 0) {
                    id = "main";
                } else {
                    $log.error("[AngularJS - Openlayers] - You have more than 1 map on the DOM, you must provide the map ID to the olData.getXXX call");
                }
            } else {
                id = mapId;
            }
            return id;
        },

        generateUniqueUID: function() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        },

        disableMouseWheelZoom: function(map) {
            var interactions = map.getInteractions();

            interactions.forEach(function(interaction) {
                if (interaction instanceof ol.interaction.MouseWheelZoom) {
                    map.removeInteraction(interaction);
                }
            });
        },

        getLayerObject: function(layer) {
            var oLayer, source;

            switch(layer.type) {
                case 'OSM':
                    if (layer.attribution) {
                        source = new ol.source.OSM({
                            attributions: [
                              new ol.Attribution({ html: layer.attribution }),
                              ol.source.OSM.DATA_ATTRIBUTION
                            ]
                        });
                    } else {
                        source = new ol.source.OSM();
                    }

                    oLayer = new ol.layer.Tile({ source: source });

                    if (layer.url) {
                        source.setUrl(layer.url);
                    }

                    break;
                case 'TileJSON':
                    source = new ol.source.TileJSON({
                        url: layer.url,
                        crossOrigin: 'anonymous'
                    });

                    oLayer = new ol.layer.Tile({ source: source });
                    break;
            }

            return oLayer;
        }
    };
});
