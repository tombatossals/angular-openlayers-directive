'use strict';
/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

function replacer(k, v) {
    if (typeof v === 'function') {
        v = v.toString();
    } else if (window.File && v instanceof File) {
        v = '[File]';
    } else if (window.FileList && v instanceof FileList) {
        v = '[FileList]';
    }
    return v;
}

describe('Method: olHelpers.createStyle', function() {
    var _olHelpers;

    beforeEach(module('openlayers-directive'));
    beforeEach(inject(function(olHelpers) {
        _olHelpers = olHelpers;
    }));

    beforeEach(function() {
        jasmine.addMatchers({
            toBeJsonEqual: function() {
                return {
                    compare: function(actual, expected) {
                        var one = JSON.stringify(actual, replacer).replace(/(\\t|\\n)/g, '');
                        var two = JSON.stringify(expected, replacer).replace(/(\\t|\\n)/g, '');
                        return one === two;
                    }
                };
            }
        });
    });

    it('makes marker icon style', function() {
        var style = {
            image: {
                icon: {
                    anchor: [0.5, 1],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'fraction',
                    opacity: 0.90,
                    src: 'images/map-marker.png'
                }
            }
        };
        expect(_olHelpers.createStyle(style))
            .toEqual(new ol.style.Style({
                fill: null,
                stroke: null,
                image: new ol.style.Icon(style.image.icon)
            }));
    });

    it('makes drawing feature style', function() {
        var style = {
            fill: {
                color: 'rgba(0, 0, 255, 0.6)'
            },
            stroke: {
                color: 'white',
                width: 3
            }
        };

        expect(_olHelpers.createStyle(style))
            .toEqual(new ol.style.Style({
                fill: new ol.style.Fill({
                    color: style.fill.color
                }),
                stroke: new ol.style.Stroke({
                    color: style.stroke.color,
                    width: style.stroke.width
                }),
                image: null
            }));
    });

    xit('makes circle feature style', function() {
        var style = {
            image: {
                circle: {
                    radius: 8,
                    fill: {
                        color: 'rgba(0, 0, 255, 0.6)'
                    },
                    stroke: {
                        color: 'white',
                        width: 3
                    }
                }
            }
        };

        expect(_olHelpers.createStyle(style))
            .toBeJsonEqual(new ol.style.Style({
                fill: null,
                stroke: null,
                image: new ol.style.Circle({
                    radius: 8,
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.6)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'white',
                        width: 3
                    })
                })
            }));
    });

});
