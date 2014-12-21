'use strict';

module.exports = function (grunt, options) {
    return {
        dist: {
            options: {
                banner: '(function() {\n\n"use strict";\n\n',
                footer: '\n}());'
            },
            src: [
                'js/**/*.js',
            ],
            dest: 'dist/app.pre.js',
        },
        css: {
            src: [
                'css/*.css'
            ],
            dest: 'dist/app.css'
        },
        license: {
            src: [
                'header-MIT-license.txt',
                'dist/app.min.no-header.js'
            ],
            dest: 'dist/app.min.js',
        },
    };
};
