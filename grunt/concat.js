'use strict';

module.exports = function (grunt, options) {
    return {
        dist: {
            options: {
                banner: '(function() {\n\n"use strict";\n\n',
                footer: '\n}());'
            },
            src: [
                'src/directives/openlayers.js',
                'src/directives/center.js',
                'src/directives/layers.js',
                'src/directives/events.js',
                'src/directives/view.js',
                'src/directives/controls.js',
                'src/directives/markers.js',
                'src/services/*.js'
            ],
            dest: 'dist/angular-openlayers-directive.pre.js',
        },
        license: {
            src: [
                'src/header-MIT-license.txt',
                'dist/angular-openlayers-directive.min.no-header.js'
            ],
            dest: 'dist/angular-openlayers-directive.min.js',
        },
    };
};
