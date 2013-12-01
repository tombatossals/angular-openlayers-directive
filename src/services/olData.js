angular.module("openlayers-directive").service('olData', function ($log, $q, olHelpers) {
    var getDefer = olHelpers.getDefer,
        getUnresolvedDefer = olHelpers.getUnresolvedDefer,
        setResolvedDefer = olHelpers.setResolvedDefer;

    var maps = {};

    this.setMap = function(olMap, scopeId) {
        var defer = getUnresolvedDefer(maps, scopeId);
        defer.resolve(olMap);
        setResolvedDefer(maps, scopeId);
    };

    this.getMap = function(scopeId) {
        var defer = getDefer(maps, scopeId);
        return defer.promise;
    };
});
