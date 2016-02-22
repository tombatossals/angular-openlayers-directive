'use strict';
describe('Loading 010-simple-example.html', function() {

    beforeEach(function() {
        browser.get('/examples/010-simple-example.html');
    }, 30000);

    it('should load the Openlayers map inside the directive tag', function() {
        element(by.className('angular-openlayers-map')).getText().then(function(text) {
            expect(text).toBe('+\n−');
        });
    });

});
