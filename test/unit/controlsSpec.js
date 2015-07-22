'use strict';
/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Directive: openlayers controls', function() {
    var $compile = null;
    var $rootScope = null;
    var $timeout;
    var olData = null;
    var olMapDefaults = null;
    var scope;

    var containsInstance = function(controls, instance) {
        for (var i in controls.array_) {
            if (controls.array_[i] instanceof instance) {
                return true;
            }
        }
        return false;
    };

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

    it('should show controls by name', function() {
        var element = angular.element('<openlayers>' +
                                      '<ol-control name="fullscreen"></ol-control>' +
                                      '</openlayers>');
        element = $compile(element)(scope);
        var controls;
        olData.getMap().then(function(olMap) {
            controls = olMap.getControls();
        });
        scope.$digest();

        expect(containsInstance(controls, ol.control.FullScreen)).toBe(true);
    });

    it('should add controls by scope', function() {
        scope.fullscreen = {
            control: new ol.control.FullScreen()
        };
        var element = angular.element('<openlayers>' +
                                      '<ol-control ol-control-properties="fullscreen"></ol-control>' +
                                      '</openlayers>');
        element = $compile(element)(scope);
        var controls;
        olData.getMap().then(function(olMap) {
            controls = olMap.getControls();
        });
        scope.$digest();

        expect(containsInstance(controls, ol.control.FullScreen)).toBe(true);
    });

    it('should remove controls from map', function() {
        scope.fullscreenControl = {
            control: new ol.control.FullScreen()
        };
        scope.showControl = true;
        var element = angular.element('<openlayers>' +
                '<ol-control ol-control-properties="fullscreenControl" ng-if="showControl"></ol-control>' +
                '</openlayers>');
        element = $compile(element)(scope);
        var controls;
        olData.getMap().then(function(olMap) {
            controls = olMap.getControls();
        });
        scope.$digest();
        expect(containsInstance(controls, ol.control.FullScreen)).toBe(true);

        scope.showControl = false;
        scope.$digest();
        expect(containsInstance(controls, ol.control.FullScreen)).toBe(false);
    });

});
