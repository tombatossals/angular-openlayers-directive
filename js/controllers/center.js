'use strict';

/* Controllers */

var app = angular.module('webapp');

app.controller('CenterController', function($scope) {
    angular.extend($scope, {
        london: {
            lat: 51.505,
            lon: -0.09,
            zoom: 6
        }
    });
});
