'use strict';

module.exports = function (grunt, options) {
    return {
        webapp: {
            src:        'partials/*.html',
            dest:       'tmp/templates.js',
            options:    {
                htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true }
            }
        }
    };
};
