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

    it('should set main layer with default tiles if bad layers structure is provided', function() {
        angular.extend(scope, { layers: {} });
        var element = angular.element('<openlayers layers="layers"></openlayers>');
        element = $compile(element)(scope);
        var layers;
        olData.getLayers().then(function(olLayers) {
            layers = olLayers;
        });
        scope.$digest();
        expect(layers.main.getSource() instanceof ol.source.OSM).toBe(true);
    });

    it('should update the main layer if the main layer source changes', function() {
        angular.extend(scope, {
            layers: {
                main: {
                    source: {
                        type: 'OSM'
                    }
                }
            }
        });

        var element = angular.element('<openlayers layers="layers"></openlayers>');
        element = $compile(element)(scope);

        var layers;
        olData.getLayers().then(function(olLayers) {
            layers = olLayers;
        });

        scope.$digest();
        expect(layers.main.getSource() instanceof ol.source.OSM).toBe(true);

        scope.layers.main.source = {
            type: 'TileJSON',
            url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
        };
        scope.$digest();

        olData.getLayers().then(function(olLayers) {
            layers = olLayers;
        });

        scope.$digest();
        expect(layers.main.getSource() instanceof ol.source.TileJSON).toBe(true);
    });

    it('should remove the map layer and add the default mpty value', function() {
        var initLayers = {
            main: {
              source: {
                type: 'TileJSON',
                url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
              }
            }
        };
        angular.extend(scope, { layers: initLayers });
        var element = angular.element('<openlayers layers="layers"></openlayers>');
        element = $compile(element)(scope);

        var map;
        olData.getMap().then(function(olMap) {
            map = olMap;
        });

        var layers;
        olData.getLayers().then(function(olLayers) {
            layers = olLayers;
        });
        scope.$digest();

        expect(layers.main.getSource() instanceof ol.source.TileJSON).toBe(true);
        scope.layers = {};
        scope.$digest();
        olData.getLayers().then(function(olLayers) {
            layers = olLayers;
        });
        scope.$digest();
        expect(layers.main.getSource() instanceof ol.source.OSM).toBe(true);
    });
});
