'use strict';

/*jshint -W117 */
/*jshint globalstrict: true*/
/* jasmine specs for directives go here */

describe('Method: olHelpers.createStyle', function() {
    var _olHelpers;

    beforeEach(module('openlayers-directive'));
    beforeEach(inject(function(olHelpers) {
        _olHelpers = olHelpers;
    }));

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

    it('makes circle feature style', function() {
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
        .toEqual(new ol.style.Style({
            fill: null,
            stroke: null,
            image: new ol.style.Circle(
                {
                    radius: 8,
                    fill: new ol.style.Fill({
                        color: style.image.circle.fill.color
                    }),
                    stroke: new ol.style.Stroke({
                        color: style.image.circle.stroke.color,
                        width: style.image.circle.stroke.width
                    })
                }
            )
        }));
    });

});
