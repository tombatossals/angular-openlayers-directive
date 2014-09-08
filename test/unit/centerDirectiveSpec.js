'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Directive: openlayers center', function() {
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

    it('should have default {[0, 0], 1} parameters on the map if not correctly defined', function() {
        scope.center = {};
        var element = angular.element('<openlayers center="center"></openlayers>');
        element = $compile(element)(scope);
        scope.$digest();

        olData.getMap().then(function(map) {
            var zoom = map.getView().getZoom();
            var center = map.getView().getCenter();
            expect(zoom).toEqual(1);
            expect(center[0]).toBeCloseTo(0);
            expect(center[1]).toBeCloseTo(0);
        });
    });

    it('should update the map center if the initial center scope properties are set', function() {

        var center = {
            coord: {
              lat: 0.96658,
              lon: 2.02
            },
            zoom: 4
        };

        scope.center = center;

        var element = angular.element('<openlayers center="center"></openlayers>');
        element = $compile(element)(scope);
        scope.$digest();

        olData.getMap().then(function(map) {
            var zoom = map.getView().getZoom();
            var center = map.getView().getCenter();
            center = ol.proj.transform([ center[1], center[0] ], 'EPSG:3857', 'EPSG:4326');
            expect(zoom).toEqual(4);
            expect(center[0]).toBeCloseTo(0.96658);
            expect(center[1]).toBeCloseTo(2.02);
        });
    });

    it('should update the map center if the scope center properties changes', function() {

        var center = {
            coord: {
              lat: 0.96658,
              lon: 2.02
            },
            zoom: 4
        };

        scope.center = center;

        var element = angular.element('<openlayers center="center"></openlayers>');
        element = $compile(element)(scope);

        var map;
        olData.getMap().then(function(olMap) {
            map = olMap;
        });
        scope.$digest();

        var mapCenter = map.getView().getCenter();
        mapCenter = ol.proj.transform([ mapCenter[1], mapCenter[0] ], 'EPSG:3857', 'EPSG:4326');
        expect(mapCenter[0]).toBeCloseTo(0.96658);
        expect(mapCenter[1]).toBeCloseTo(2.01958);
        expect(map.getView().getZoom()).toEqual(4);

        center.coord = {
          lat: 2.0304,
          lon: 4.04
        };
        center.zoom = 8;
        scope.$digest();

        mapCenter = map.getView().getCenter();
        mapCenter = ol.proj.transform([ mapCenter[1], mapCenter[0] ], 'EPSG:3857', 'EPSG:4326');
        expect(mapCenter[0]).toBeCloseTo(2.0304);
        expect(mapCenter[1]).toBeCloseTo(4.0366);
        expect(map.getView().getZoom()).toEqual(8);
    });
});
