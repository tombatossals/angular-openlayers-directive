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
                'src/directives/layer.js',
                'src/directives/events.js',
                'src/directives/path.js',
                'src/directives/view.js',
                'src/directives/control.js',
                'src/directives/marker.js',
                'src/services/olData.js',
                'src/services/olHelpers.js',
                'src/services/olMapDefaults.js'
            ],
            dest: 'dist/angular-openlayers-directive.pre.js',
        },
        css: {
            src: [
                'css/markers.css',
                'css/openlayers.css'
            ],
            dest: 'dist/angular-openlayers-directive.css'
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
