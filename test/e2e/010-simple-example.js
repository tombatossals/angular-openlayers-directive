'use strict';

describe('Loading 010-simple-example.html', function() {

    var ptor;
    var driver;
    beforeEach(function() {
        ptor = protractor.getInstance();
        ptor.get('/examples/010-simple-example.html');
        driver = ptor.driver;
    }, 30000);

    it('should load the Openlayers map inside the directive tag', function() {
        driver.findElement(protractor.By.className('angular-openlayers-map')).getText().then(function(text) {
            expect(text).toBe('Zoom in\n+\nZoom out\n−\ni\nAttributions');
        });
    });

});
