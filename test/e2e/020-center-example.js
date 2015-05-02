'use strict';
describe('Loading 020-center-example.html', function() {

    beforeEach(function() {
        browser.get('/examples/020-center-example.html');
    }, 30000);

    it('should update the zoom value in the input if clicked the zoom control', function() {
        element(by.className('ol-zoom-in')).click();
        // Wait for zoom animation
        browser.sleep(300);
        expect(element(by.model('london.zoom')).getAttribute('value')).toBe('5');
    });

});
