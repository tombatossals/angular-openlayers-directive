'use strict';

var banner = '(function (root, factory) {\n' +
             '    if (typeof require === \'function\' && typeof exports === \'object\') {\n' +
             '        // CommonJS\n' +
             '        var ol = require(\'openlayers\');\n' +
             '        exports.angularOpenlayersDirective = factory(ol);\n' +
             '    } else if (typeof define === \'function\' && define.amd) {\n' +
             '        // AMD.\n' +
             '        define([\'ol\'], function (ol) {\n' +
             '            return root.angularOpenlayersDirective = factory(ol);\n' +
             '        });\n' +
             '    } else {\n' +
             '        // Browser globals\n' +
             '        root.angularOpenlayersDirective = factory(root.ol);\n' +
             '    }\n' +
             '}(this, function (ol) {\n';

module.exports = function (grunt, options) {
    return {
        dist: {
            options: {
                banner: banner,
                footer: '\n}));'
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
