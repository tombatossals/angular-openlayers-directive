'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Directive: openlayers', function() {
    var $compile = null;
    var $rootScope = null;
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

    it('should have loaded openlayers library inside the directive', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        scope.$digest();
        expect(element.text()).toEqual('Zoom in+Zoom out−iAttributions');
    });

    it('should set default center if not center is provided', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        var map;
        olData.getMap().then(function(olMap) {
            map = olMap;
        });
        $rootScope.$digest();
        expect(map.getView().getZoom()).toEqual(1);
        expect(map.getView().getCenter()[0]).toEqual(0);
        expect(map.getView().getCenter()[1]).toEqual(0);
    });

    xit('should set default tile if not tiles nor layers are provided', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        var leafletTiles;
        var defaults;
        leafletData.getTiles().then(function(tiles) {
            leafletTiles = tiles;
        });
        leafletMapDefaults.getDefaults().then(function(d) {
            defaults = d;
        });
        $rootScope.$digest();
        expect(leafletTiles._url).toEqual(defaults.tileLayer);
    });

    xit('should set the max zoom if specified', function() {
        angular.extend(scope, { defaults: { maxZoom: 15 } });
        var element = angular.element('<leaflet defaults="defaults"></leaflet>');
        element = $compile(element)(scope);
        var leafletMap;
        leafletData.getMap().then(function(map) {
            leafletMap = map;
        });
        $rootScope.$digest();
        expect(leafletMap.getMaxZoom()).toEqual(15);
    });

    xit('should set the min zoom if specified', function() {
        angular.extend($rootScope, { defaults: { minZoom: 4 } });
        var element = angular.element('<leaflet defaults="defaults"></leaflet>');
        element = $compile(element)(scope);
        var leafletMap;
        leafletData.getMap().then(function(map) {
            leafletMap = map;
        });
        $rootScope.$digest();
        expect(leafletMap.getMinZoom()).toEqual(4);
    });

    xit('should unset the minzoom if maxbounds specified', function() {
        angular.extend($rootScope, {
            defaults: {
                minZoom: 4,
            },
            maxBounds: {
                southWest: {
                    lat: 47.200,
                    lon: 15.200
                },
                northEast: {
                    lat: 47.200,
                    lon: 15.200
                }
            }
        });
        var element = angular.element('<leaflet defaults="defaults" maxBounds="maxBounds"></leaflet>');
        element = $compile(element)($rootScope);
        var leafletMap;
        leafletData.getMap().then(function(map) {
            leafletMap = map;
        });
        $rootScope.$digest();
        expect(leafletMap.getMinZoom()).toEqual(0);
    });

    xit('should set tileLayer and tileLayer options if specified', function() {
        angular.extend($rootScope, {
            defaults: {
                tileLayer: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png',
                tileLayerOptions: {
                    detectRetina: true,
                    opacity: 0.8
                }
            }
        });
        var element = angular.element('<leaflet defaults="defaults"></leaflet>');
        element = $compile(element)($rootScope);
        var leafletTiles;
        var defaults;
        leafletData.getTiles().then(function(tiles) {
            leafletTiles = tiles;
        });
        leafletMapDefaults.getDefaults().then(function(d) {
            defaults = d;
        });

        $rootScope.$digest();
        expect(leafletTiles.options.detectRetina).toEqual(true);
        expect(leafletTiles.options.opacity).toEqual(0.8);
        expect(leafletTiles._url).toEqual('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png');
        expect(defaults.tileLayer).toEqual('http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png');
    });

    xit('should set zoom control button properly if zoomControlPosition option is set', function() {
        angular.extend($rootScope, {
            defaults: {
                zoomControlPosition: 'topright'
            }
        });
        var element = angular.element('<leaflet defaults="defaults"></leaflet>');
        element = $compile(element)($rootScope);
        var leafletMap;
        leafletData.getMap().then(function(map) {
            leafletMap = map;
        });
        $rootScope.$digest();
        expect(leafletMap.zoomControl.getPosition()).toEqual('topright');
    });

    xit('should remove zoom control button if unset on defaults', function() {
        angular.extend($rootScope, {
            defaults: {
                zoomControl: false
            }
        });
        var element = angular.element('<leaflet defaults="defaults"></leaflet>');
        element = $compile(element)($rootScope);
        var leafletMap;
        leafletData.getMap().then(function(map) {
            leafletMap = map;
        });
        $rootScope.$digest();
        expect(leafletMap.zoomControl).toBe(undefined);
    });
});
