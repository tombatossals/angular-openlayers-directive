'use strict';

module.exports = function (grunt, options) {
    return {
        jscs: {
            src: [ "src/**/*.js", "test/**/*.js" ]
        }
    };
};
