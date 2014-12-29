'use strict';

module.exports = function (grunt, options) {
    return {
        source: {
            files: ['js/**/*.js', 'partials/*.html', 'css/*.css'],
            tasks: [
                'build'
            ]
        }
    };
};
