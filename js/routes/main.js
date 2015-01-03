'use strict';

var app = angular.module('webapp');

app.config(function($routeProvider) {
    $routeProvider.when('/', {
        templateUrl: 'partials/frontpage.html'
    }).when('/:section/:example', {
        templateUrl: function(attrs) {
            return 'partials/' + attrs.example + '.html';
        },
        reloadOnSearch: false
    });
});
