'use strict';

module.exports = function (grunt, options) {
    return {
        options: {
            banner: '/*! angular-openlayers-directive WebApp <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        },
        dist: {
            files: {
                'dist/app.min.no-header.js': ['dist/app.js']
            }
        }
    };
};
