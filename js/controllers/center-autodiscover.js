(function() {
    var app = angular.module('webapp');

    app.controller('CenterAutodiscoverController',  function($scope) {
        angular.extend($scope, {
            center: {
                autodiscover: true
            }
        });
    });
})();
