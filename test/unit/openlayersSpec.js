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
        var defaults = olMapDefaults.getDefaults();

        olData.getMap().then(function(olMap) {
            map = olMap;
        });

        scope.$digest();
        expect(map.getView().getZoom()).toEqual(defaults.center.zoom);
        expect(map.getView().getCenter()[0]).toEqual(defaults.center.lon);
        expect(map.getView().getCenter()[1]).toEqual(defaults.center.lat);
    });

    iit('should set default layer if not layers are provided', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        var olLayers;
        var defaults = olMapDefaults.getDefaults();

        olData.getLayers().then(function(layers) {
            olLayers = layers;
        });
        scope.$digest();
        expect(olLayers.getLength()).toEqual(1);
        expect(olLayers.get(1) instanceof ol.layer.Tile).toBe(true);
        var olSource = olLayers.item(0).getSource();
        console.log(olSource, defaults);
    });

    it('should set the default view if not specified', function() {
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

    it('should set the default controls if not specified', function() {
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
        scope.$digest();
        expect(leafletMap.zoomControl.getPosition()).toEqual('topright');
    });
});
