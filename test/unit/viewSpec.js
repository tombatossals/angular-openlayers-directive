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
        var map;
        olData.getMap().then(function(olMap) {
            map = olMap;
        });
        scope.$digest();
        expect(map).toBeDefined();
    });

    it('should set default center if no center is provided', function() {
        var element = angular.element('<openlayers></openlayers>');
        element = $compile(element)(scope);
        var map;
        olData.getMap().then(function(olMap) {
            map = olMap;
        });
        $rootScope.$digest();
        expect(map.getView().getZoom()).toEqual(1);
        expect(map.getView().getCenter()[0]).toBeCloseTo(0);
        expect(map.getView().getCenter()[1]).toBeCloseTo(0);
    });

});
