'use strict';
/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Directive: openlayers marker', function() {
    var $compile = null;
    var scope;

    beforeEach(module('openlayers-directive'));
    beforeEach(inject(function(_$compile_, $rootScope) {
        $compile = _$compile_;

        scope = $rootScope.$new();
    }));

    it('should not error on $scope.$destroy', function() {
        var element = angular.element('<openlayers><ol-marker lat="0" lon="0"></ol-marker></openlayers>');
        element = $compile(element)(scope);
        scope.$digest();
        expect(function() { scope.$destroy(); }).not.toThrow();
    });
});
