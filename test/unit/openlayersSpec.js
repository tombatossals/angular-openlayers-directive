'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Directive: openlayers', function() {
    var $compile = null;
    var $rootScope = null;
    var $timeout;
    var olData = null;
    var olHelpers;
    var olMapDefaults = null;
    var scope;

    beforeEach(module('openlayers-directive'));
    beforeEach(inject(function(_$compile_, _$rootScope_, _$timeout_, _olData_, _olHelpers_, _olMapDefaults_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
        olData = _olData_;
        olHelpers = _olHelpers_;
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

    it('should set default layer if not layers are provided', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        var olLayers;
        olData.getLayers().then(function(layers) {
            olLayers = layers;
        });
        scope.$digest();
        expect(olLayers.getLength()).toEqual(1);
        var layer = olLayers.item(0);
        expect(layer instanceof ol.layer.Tile).toBe(true);
        var olSource = olLayers.item(0).getSource();
        expect(olSource instanceof ol.source.OSM).toBe(true);
    });

    it('should set the default view if not specified', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        var map;
        var defaults = olMapDefaults.getDefaults();

        olData.getMap().then(function(olMap) {
            map = olMap;
        });

        scope.$digest();
        var view = map.getView();
        expect(view.getProjection().getCode()).toEqual(defaults.view.projection);
        expect(view.getRotation()).toEqual(defaults.view.rotation);
    });

    it('should set the default controls if not specified', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        var defaults = olMapDefaults.getDefaults();
        var controls;

        olData.getControls().then(function(olControls) {
            controls = olControls;
        });

        scope.$digest();
        var activeControls = Object.keys(defaults.controls).filter(function(c) {
            return defaults.controls[c] === true;
        });
        expect(controls.getLength()).toEqual(activeControls.length);

        var actualControls = Object.keys(olHelpers.detectControls(controls));
        actualControls.sort();
        activeControls.sort();
        expect(activeControls).toEqual(actualControls);
    });
});
