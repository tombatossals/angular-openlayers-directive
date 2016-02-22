'use strict';
/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Directive: openlayers layers', function() {
    var $compile = null;
    var $rootScope;
    var $timeout;
    var olData = null;
    var olMapDefaults = null;
    var scope;

    beforeEach(module('openlayers-directive'));
    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _olData_, _olMapDefaults_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        olData = _olData_;
        olMapDefaults = _olMapDefaults_;

        scope = $rootScope.$new();
    }));

    afterEach(inject(function($rootScope) {
        $rootScope.$apply();
    }));

    it('should have two layers if no custom-layers is used', function() {
        scope.mapbox = {
            source: {
                type: 'TileJSON',
                url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
            }
        };

        var element = angular.element('<openlayers>' +
                                       '<ol-layer ol-layer-properties="mapbox"></ol-layer>' +
                                       '</openlayers>');
        element = $compile(element)(scope);

        var layers;
        olData.getMap().then(function(olMap) {
            layers = olMap.getLayers();
        });

        scope.$digest();
        expect(layers.item(0).getSource() instanceof ol.source.OSM).toBe(true);
        expect(layers.getLength()).toBe(2);
        expect(layers.item(1).getSource() instanceof ol.source.TileJSON).toBe(true);
    });

    it('should properly render a GeoJSON layer containing the GeoJSON object', function() {
        scope.geoJsonLayer = {
            source: {
                type: 'GeoJSON',
                geojson: {
                    object: {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [
                                11.32436509382857,
                                46.50874575613664
                            ]
                        }
                    }
                }
            }
        };

        var element = angular.element('<openlayers>' +
                                       '<ol-layer ol-layer-properties="geoJsonLayer"></ol-layer>' +
                                       '</openlayers>');
        element = $compile(element)(scope);

        var layers;
        olData.getMap().then(function(olMap) {
            layers = olMap.getLayers();
        });

        scope.$digest();
        expect(layers.item(0).getSource() instanceof ol.source.OSM).toBe(true);
        expect(layers.getLength()).toBe(2);

        var geoJsonLayer = layers.item(1);
        expect(geoJsonLayer.getSource() instanceof ol.source.Vector).toBe(true);
        expect(geoJsonLayer.getSource().getFeatures().length).not.toBe(0);
    });

    it('should properly render a GeoJSON layer containing the GeoJSON object with different projections', function() {
        scope.geoJsonLayer = {
            source: {
                type: 'GeoJSON',
                geojson: {
                    object: {
                        type: 'Feature',
                        geometry: {
                            type: 'Point',
                            coordinates: [434179, 122450] // Southampton (UK) in EPSG:27700
                        }
                    },
                    projection: 'EPSG:27700'
                }
            }
        };

        var element = angular.element('<openlayers>' +
                                       '<ol-layer ol-layer-properties="geoJsonLayer"></ol-layer>' +
                                       '</openlayers>');
        element = $compile(element)(scope);

        var layers;
        olData.getMap().then(function(olMap) {
            layers = olMap.getLayers();
        });

        scope.$digest();
        expect(layers.item(0).getSource() instanceof ol.source.OSM).toBe(true);
        expect(layers.getLength()).toBe(2);

        var geoJsonLayer = layers.item(1);
        expect(geoJsonLayer.getSource() instanceof ol.source.Vector).toBe(true);
        expect(geoJsonLayer.getSource().getFeatures().length).not.toBe(0);
    });

    it('should have one layer if custom-layers is used', function() {
        scope.mapbox = {
            source: {
                type: 'TileJSON',
                url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
            }
        };

        var element = angular.element('<openlayers custom-layers="true">' +
                                      '<ol-layer ol-layer-properties="mapbox"></ol-layer>' +
                                      '</openlayers>');
        element = $compile(element)(scope);

        var layers;
        olData.getMap().then(function(olMap) {
            layers = olMap.getLayers();
        });

        scope.$digest();
        expect(layers.getLength()).toBe(1);
        expect(layers.item(0).getSource() instanceof ol.source.TileJSON).toBe(true);
    });

    it('should add no layers if no ol-layer is defined', function() {
        var layers = {
            mapbox: {
                active: true,
                name: 'mapbox',
                source: {
                    type: 'TileJSON',
                    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
                }
            }
        };
        angular.extend(scope, { layers: layers });
        var element = angular.element('<openlayers ol-layers="layers" custom-layers="true">' +
                                      '</openlayers>');
        $compile(element)(scope);

        var olLayers;
        olData.getMap().then(function(olMap) {
            olLayers = olMap.getLayers();
        });

        scope.$digest();
        expect(olLayers.getLength()).toBe(0);
    });

    it('should update the visibility of a layer', function() {
        var layers = [
            {
                name: 'mapbox',
                source: {
                    type: 'TileJSON',
                    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
                },
                visible: true
            }
        ];
        angular.extend(scope, { layers: layers });
        var element = angular.element('<openlayers custom-layers="true">' +
                                        '<ol-layer name="{{ layer.name }}" ol-layer-properties="layer" ' +
                                                'ng-repeat="layer in layers">',
                                      '</openlayers>');
        $compile(element)(scope);
        scope.$digest();

        // act
        layers[0].visible = false;

        // assert
        var mapboxLayer;
        olData.getMap().then(function(olMap) {
            var olLayers = olMap.getLayers();
            olLayers.forEach(function(layer) {
                if (layer.get('name') === 'mapbox') {
                    mapboxLayer = layer;
                }
            });
        });

        scope.$digest();
        expect(mapboxLayer).toBeDefined();
        expect(mapboxLayer.getVisible()).toBeFalsy();
    });

    it('should keep the style changes across layer updates', function() {
        var layers = [
            {
                name: 'mapbox',
                source: {
                    type: 'GeoJSON',
                    url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.json'
                },
                style: {
                    fill: {
                        color: 'rgba(255, 0, 255, 0.6)'
                    },
                    stroke: {
                        color: 'white',
                        width: 3
                    }
                }
            }
        ];
        angular.extend(scope, { layers: layers });
        var element = angular
                        .element('<openlayers custom-layers="true">' +
                                    '<ol-layer name="{{ layer.name }}" ol-layer-properties="layer" ' +
                                        'ng-repeat="layer in layers">',
                                  '</openlayers>');
        $compile(element)(scope);
        scope.$digest();

        var style;
        olData.getMap().then(function(olMap) {
            var olLayers = olMap.getLayers();
            olLayers.forEach(function(layer) {
                if (layer.get('name') === 'mapbox') {
                    style = layer.getStyle();
                }
            });
        });

        scope.$digest();
        expect(style).toBeDefined();

        // act
        layers[0].source.url = 'http://api.tiles.mapbox.com/v3/mapbox.satellite-class.json';
        scope.$digest();

        // assert
        var styleAfter;
        olData.getMap().then(function(olMap) {
            var olLayers = olMap.getLayers();
            olLayers.forEach(function(layer) {
                if (layer.get('name') === 'mapbox') {
                    styleAfter = layer.getStyle();
                }
            });
        });

        scope.$digest();
        expect(styleAfter).toBeDefined();
        expect(style).toEqual(styleAfter);
    });

    it('should create a group layer', function() {
        var layers = [
            {
                name: 'Italy',
                group: 'GeoJSON',
                source: {
                    type: 'GeoJSON',
                    url: 'json/ITA.geo.json'
                }
            },
            {
                name: 'France',
                group: 'GeoJSON',
                source: {
                    type: 'GeoJSON',
                    url: 'json/FRA.geo.json'
                }
            },
            {
                name: 'Spain',
                group: 'GeoJSON',
                source: {
                    type: 'GeoJSON',
                    url: 'json/ESP.geo.json'
                }
            },
            {
                name: 'Lisbon',
                group: 'GeoJSON',
                source: {
                    type: 'GeoJSON',
                    url: 'json/LIS.geo.json'
                }
            },
            {
                //No Group so should be top level
                name: 'OSM',
                source: {
                    type: 'OSM'
                }
            }
        ];
        angular.extend(scope, { layers: layers });
        var element = angular.element('<openlayers custom-layers="true">' +
            '<ol-layer ol-layer-properties="layer" ng-repeat="layer in layers">' +
            '</openlayers>');
        $compile(element)(scope);
        scope.$digest();

        // assert
        var olLayers;
        var groupLayer;
        olData.getMap().then(function(olMap) {
            olLayers = olMap.getLayers();
            olLayers.forEach(function(layer) {
                if (layer.get('name') === 'GeoJSON') {
                    groupLayer = layer;
                }
            });
        });

        scope.$digest();
        expect(olLayers.get('length')).toEqual(2);

        //Check the GeoJSON layer
        expect(groupLayer).toBeDefined();
        expect(groupLayer).toEqual(jasmine.any(ol.layer.Group));
        expect(groupLayer.getVisible()).toBeTruthy();
        expect(groupLayer.getLayers().get('length')).toEqual(4);

        // changing group properties should rearrange layers
        scope.layers[0].group = 'Other';
        scope.$digest();
        var otherLayer;
        olData.getMap().then(function(olMap) {
            olLayers = olMap.getLayers();
            olLayers.forEach(function(layer) {
                if (layer.get('name') === 'GeoJSON') {
                    groupLayer = layer;
                }

                if (layer.get('name') === 'Other') {
                    otherLayer = layer;
                }
            });
        });
        scope.$digest();
        expect(olLayers.get('length')).toEqual(3);

        //Check the GeoJSON layer
        expect(groupLayer).toBeDefined();
        expect(groupLayer).toEqual(jasmine.any(ol.layer.Group));
        expect(groupLayer.getLayers().get('length')).toEqual(3);
        expect(groupLayer.getLayers().getArray()[0].get('group')).toEqual('GeoJSON');

        //Check the other layer
        expect(otherLayer).toBeDefined();
        expect(otherLayer).toEqual(jasmine.any(ol.layer.Group));
        expect(otherLayer.getLayers().get('length')).toEqual(1);
        expect(otherLayer.getLayers().getArray()[0].get('group')).toEqual('Other');

    });
});
