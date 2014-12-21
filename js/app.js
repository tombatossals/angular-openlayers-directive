'use strict';

angular.module('webapp', ['ngRoute', 'openlayers-directive']).config(function($locationProvider) {
    $locationProvider.html5Mode(false);
});
