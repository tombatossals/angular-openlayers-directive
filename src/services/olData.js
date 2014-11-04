angular.module('openlayers-directive').service('olData', function($log, $q, olHelpers) {
    var obtainEffectiveMapId = olHelpers.obtainEffectiveMapId;

    var maps = {};
    var layers = {};
    var markers = {};
    var controls = {};

    var setResolvedDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId);
        d[id].resolvedDefer = true;
    };

    var getUnresolvedDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId);
        var defer;

        if (!angular.isDefined(d[id]) || d[id].resolvedDefer === true) {
            defer = $q.defer();
            d[id] = {
                defer: defer,
                resolvedDefer: false
            };
        } else {
            defer = d[id].defer;
        }
        return defer;
    };

    var getDefer = function(d, mapId) {
        var id = obtainEffectiveMapId(d, mapId);
        var defer;

        if (!angular.isDefined(d[id]) || d[id].resolvedDefer === false) {
            defer = getUnresolvedDefer(d, mapId);
        } else {
            defer = d[id].defer;
        }
        return defer;
    };

    this.setMap = function(olMap, scopeId) {
        var defer = getUnresolvedDefer(maps, scopeId);
        defer.resolve(olMap);
        setResolvedDefer(maps, scopeId);
    };

    this.getMap = function(scopeId) {
        var defer = getDefer(maps, scopeId);
        return defer.promise;
    };

    this.getLayers = function(scopeId) {
        var defer = getDefer(layers, scopeId);
        return defer.promise;
    };

    this.setLayers = function(olLayers, scopeId) {
        var defer = getUnresolvedDefer(layers, scopeId);
        defer.resolve(olLayers);
        setResolvedDefer(layers, scopeId);
    };

    this.getMarkers = function(scopeId) {
        var defer = getDefer(markers, scopeId);
        return defer.promise;
    };

    this.setMarkers = function(olMarkers, scopeId) {
        var defer = getUnresolvedDefer(markers, scopeId);
        defer.resolve(olMarkers);
        setResolvedDefer(markers, scopeId);
    };

    this.getControls = function(scopeId) {
        var defer = getDefer(controls, scopeId);
        return defer.promise;
    };

    this.setControls = function(olControls, scopeId) {
        var defer = getUnresolvedDefer(controls, scopeId);
        defer.resolve(olControls);
        setResolvedDefer(controls, scopeId);
    };

});
