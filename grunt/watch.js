'use strict';

module.exports = function (grunt, options) {
    return {
        source: {
            files: ['js/**/*.js', 'css/*.css'],
            tasks: [
                'build'
            ]
        }
    };
};
