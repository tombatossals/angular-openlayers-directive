(function() {

    var app = angular.module('webapp');

    app.controller('FrontPageController', function($scope, $http, olData, olHelpers) {
        var continentProperties = {
            '009': {
                name: 'Oceania',
                colors: ['#CC0066', '#993366', '#990066', '#CC3399', '#CC6699']
            },
            '019': {
                name: 'America',
                colors: ['#006699', '#336666', '#003366', '#3399CC', '#6699CC']
            },
            '150': {
                name: 'Europe',
                colors: ['#FF0000', '#CC3333', '#990000', '#FF3333', '#FF6666']
            },
            '002': {
                name: 'Africa',
                colors: ['#00CC00', '#339933', '#009900', '#33FF33', '#66FF66']
            },
            '142': {
                name: 'Asia',
                colors: ['#FFCC00', '#CC9933', '#999900', '#FFCC33', '#FFCC66']
            }
        };

        // Get a country paint color from the continents array of colors
        var getColor = function(country) {
            if (!country || !country['region-code']) {
                return '#FFF';
            }

            var colors = continentProperties[country['region-code']].colors;
            var index = country['alpha-3'].charCodeAt(0) % colors.length ;
            return colors[index];
        };

        var getStyle = function(feature) {
            var style = olHelpers.createStyle({
                fill: {
                    color: getColor($scope.countries[feature.getId()]),
                    opacity: 0.4
                },
                stroke: {
                    color: 'white',
                    width: 3
                }
            });
            return [style];
        };

        angular.extend($scope, {
            center: {
                lat: 30,
                lon: 0,
                zoom: 2
            },
            geojson: {
                name: 'geojson',
                source: {
                    type: 'GeoJSON',
                    url: 'examples/json/countries.geo.json'
                },
                style: getStyle
            },
            defaults: {
                events: {
                    layers: ['mousemove']
                }
            }
        });

        // Get the countries data from a JSON
        $http.get('examples/json/all.json').success(function(data) {
            // Put the countries on an associative array
            $scope.countries = {};
            for (var i = 0; i < data.length; i++) {
                var country = data[i];
                $scope.countries[country['alpha-3']] = country;
            }
        });

        olData.getMap().then(function(map) {
            var previousFeature;
            var overlay = new ol.Overlay({
                element: document.getElementById('countrybox'),
                positioning: 'center-center',
                offset: [-25, 59],
                position: [0, 0]
            });
            map.addOverlay(overlay);

            // Mouse over function, called from the Leaflet Map Events
            $scope.$on('openlayers.layers.geojson.mousemove', function(event, feature, olEvent) {
                console.log(feature.getId());
                if (!feature) {
                    return;
                }

                $scope.$apply(function(scope) {
                    scope.selectedCountry = feature ? $scope.countries[feature.getId()] : '';
                });

                overlay.setPosition(map.getEventCoordinate(olEvent));
                if (feature) {
                    feature.setStyle(olHelpers.createStyle({
                        fill: {
                            color: '#FFF'
                        }
                    }));

                    if (previousFeature && feature !== previousFeature) {
                        previousFeature.setStyle(getStyle(previousFeature));
                    }
                    previousFeature = feature;
                }
            });
        });
    });

})();
