'use strict';

module.exports = function (grunt, options) {
    return {
        options : {
            livereload: 7777
        },
        source: {
            files: ['src/**/*.js', 'test/unit/**.js', 'test/e2e/**.js', 'css/*.css'],
            tasks: [
                'jshint',
                'jscs',
                'concat:dist',
                'concat:css',
                'ngAnnotate',
                'uglify',
                'test-unit',
                'concat:license'
            ]
        }
    };
};
