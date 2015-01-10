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
        olData.getLayers().then(function(olLayers) {
            layers = olLayers;
        });

        scope.$digest();
        expect(layers.osm.getSource() instanceof ol.source.OSM).toBe(true);
        expect(Object.keys(layers).length).toBe(2);
        expect(layers.mapbox.getSource() instanceof ol.source.TileJSON).toBe(true);
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
        olData.getLayers().then(function(olLayers) {
            layers = olLayers;
        });

        scope.$digest();
        expect(Object.keys(layers).length).toBe(1);
        expect(layers.mapbox.getSource() instanceof ol.source.TileJSON).toBe(true);
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

        var map;
        olData.getMap().then(function(olMap) {
            map = olMap;
        });

        var olLayers;
        olData.getLayers().then(function(l) {
            olLayers = l;
        });
        scope.$digest();

        expect(Object.keys(olLayers).length).toBe(0);
    });
});
