'use strict';

describe('Loading simple-example.html', function() {

    var ptor, driver;
    beforeEach(function() {
        ptor = protractor.getInstance();
        ptor.get('/simple-example.html');
        driver = ptor.driver;
    }, 30000);

    it('should load the Openlayers map inside the directive tag', function() {
        driver.findElement(protractor.By.className('angular-openlayers-map')).getText().then(function(text) {
            expect(text).toBe("+\n-\nLeaflet | © OpenStreetMap contributors");
        });
    });

});
