'use strict';


module.exports = function (grunt, options) {
    return {
        unit: {
            frameworks: ['jasmine'],
            browsers: ['PhantomJS'],
            singleRun: true,
            options: {
                files: [
                    'bower_components/openlayers3/build/ol-debug.js',
                    'bower_components/angular/angular.js',
                    'bower_components/angular-sanitize/angular-sanitize.js',
                    'bower_components/angular-mocks/angular-mocks.js',
                    'dist/angular-openlayers-directive.js',
                    'test/unit/*.js'
                ]
            }
        },
        dev: {
            frameworks: ['jasmine'],
            browsers: ['Chrome', 'IE'],
            singleRun: false,
            autoWatch: true,
            options: {
                files: [
                    'bower_components/openlayers3/build/ol-debug.js',
                    'bower_components/angular/angular.js',
                    'bower_components/angular-sanitize/angular-sanitize.js',
                    'bower_components/angular-mocks/angular-mocks.js',
                    'dist/angular-openlayers-directive.js',
                    'test/unit/*.js'
                ]
            }
        }
    };
};
