 'use strict';

 module.exports = function ngAnnotate(grunt, options) {
     return {
         options: {},
         dist: {
             files: {
                 'dist/angular-openlayers-directive.js': [ 'dist/angular-openlayers-directive.pre.js' ]
             }
         }
     };
};
