 'use strict';

 module.exports = function ngAnnotate(grunt, options) {
     return {
         options: {},
         dist: {
             files: {
                 'dist/app.js': [ 'dist/app.pre.js' ]
             }
         }
     };
};
