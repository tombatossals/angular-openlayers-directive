'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Directive: openlayers layers', function() {
    var $compile = null, $rootScope = null, $timeout, olData = null, olMapDefaults = null, scope;

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
        expect(layers[0].getSource() instanceof ol.source.OSM).toBe(true);
    });

    xit('should update the map tiles if the scope tiles properties changes', function() {
        angular.extend(scope, { tiles: { source: { type: 'OSM' } } });
        var element = angular.element('<openlayers tiles="tiles"></openlayers>');
        element = $compile(element)(scope);

        var tiles;
        olData.getTiles().then(function(olTiles) {
            tiles = olTiles;
        });

        scope.$digest();
        expect(tiles[0].getSource() instanceof ol.source.OSM).toBe(true);

        scope.tiles = {
            type: 'TileJSON',
            url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
        };

        scope.$digest();

        olData.getTiles().then(function(olTiles) {
            tiles = olTiles;
        });

        scope.$digest();
        expect(tiles[0].getSource() instanceof ol.source.TileJSON).toBe(true);
    });

    xit('should remove the map tiles if the scope tiles are changed into an empty value', function() {
        var initTiles = {
            type: 'TileJSON',
            url: 'http://api.tiles.mapbox.com/v3/mapbox.geography-class.jsonp'
        };
        angular.extend(scope, { tiles: initTiles });
        var element = angular.element('<openlayers tiles="tiles"></openlayers>');
        element = $compile(element)(scope);

        var map;
        olData.getMap().then(function(olMap) {
            map = olMap;
        });

        var tiles;
        olData.getTiles().then(function(olTiles) {
            tiles = olTiles;
        });
        scope.$digest();

        expect(tiles[0].getSource() instanceof ol.source.TileJSON).toBe(true);
        scope.tiles = {};
        scope.$digest();
        olData.getTiles().then(function(olTiles) {
            tiles = olTiles;
        });
        scope.$digest();
        expect(tiles[0].getSource() instanceof ol.source.OSM).toBe(true);
    });
});
