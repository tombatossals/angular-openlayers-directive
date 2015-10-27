'use strict';
describe('Loading 114-path-add-remove-example.html', function() {

    var expectedPathList = [
        {
            message: 'This is a path',
            coords: '[[[-58.38,-34.6],[-58.58,-34.6]]]'
        },
        {
            message: 'And this is another path',
            coords: '[[[-58.38,-34.7],[-58.38,-34.8]]]'
        },
        {
            message: 'Hello there',
            coords: '[[[-58.48,-34.4],[-58.58,-34.5]]]'
        }
    ];

    beforeAll(function() {
        browser.get('/examples/114-path-add-remove-example.html');
    }, 30000);

    it('add path should display label on map', function() {
        var displayPath = $$('.popup-label.path');

        var displayLabels = displayPath.map(function(elem) {
            return elem.getAttribute('message');
        });

        var expectedLabels = expectedPathList.map(function(elem) {
            return elem.message;
        });

        expect(displayLabels).toEqual(expectedLabels.reverse());
    });

    it('add path should display path on map', function() {
        var displayPath = $$('.popup-label.path');

        var displayCoords = displayPath.map(function(elem) {
            return elem.getAttribute('coords');
        });

        var expectedCoordinate = expectedPathList.map(function(elem) {
            return elem.coords;
        });

        expect(displayCoords).toEqual(expectedCoordinate.reverse());
    });

    it('remove path should clear path on map', function() {

        var removeButton = element(by.id('add-remove-btn'));
        removeButton.click();
        browser.waitForAngular();

        var displayPath = $$('.popup-label.path');

        expect(displayPath.count()).toBe(0);
    });

});
