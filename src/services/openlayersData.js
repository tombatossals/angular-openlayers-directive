angular.module("openlayers-directive").service('openlayersData', function ($log, $q, openlayersHelpers) {
    var getDefer = openlayersHelpers.getDefer,
        getUnresolvedDefer = openlayersHelpers.getUnresolvedDefer,
        setResolvedDefer = openlayersHelpers.setResolvedDefer;

    var maps = {};
    var tiles = {};
    var layers = {};
    var paths = {};
    var markers = {};
    var geoJSON = {};

    this.setMap = function(openlayersMap, scopeId) {
        var defer = getUnresolvedDefer(maps, scopeId);
        defer.resolve(openlayersMap);
        setResolvedDefer(maps, scopeId);
    };

    this.getMap = function(scopeId) {
        var defer = getDefer(maps, scopeId);
        return defer.promise;
    };

    this.getPaths = function(scopeId) {
        var defer = getDefer(paths, scopeId);
        return defer.promise;
    };

    this.setPaths = function(openlayersPaths, scopeId) {
        var defer = getUnresolvedDefer(paths, scopeId);
        defer.resolve(openlayersPaths);
        setResolvedDefer(paths, scopeId);
    };

    this.getMarkers = function(scopeId) {
        var defer = getDefer(markers, scopeId);
        return defer.promise;
    };

    this.setMarkers = function(openlayersMarkers, scopeId) {
        var defer = getUnresolvedDefer(markers, scopeId);
        defer.resolve(openlayersMarkers);
        setResolvedDefer(markers, scopeId);
    };

    this.getLayers = function(scopeId) {
        var defer = getDefer(layers, scopeId);
        return defer.promise;
    };

    this.setLayers = function(openlayersLayers, scopeId) {
        var defer = getUnresolvedDefer(layers, scopeId);
        defer.resolve(openlayersLayers);
        setResolvedDefer(layers, scopeId);
    };

    this.setTiles = function(openlayersTiles, scopeId) {
        var defer = getUnresolvedDefer(tiles, scopeId);
        defer.resolve(openlayersTiles);
        setResolvedDefer(tiles, scopeId);
    };

    this.getTiles = function(scopeId) {
        var defer = getDefer(tiles, scopeId);
        return defer.promise;
    };

    this.setGeoJSON = function(openlayersGeoJSON, scopeId) {
        var defer = getUnresolvedDefer(geoJSON, scopeId);
        defer.resolve(openlayersGeoJSON);
        setResolvedDefer(geoJSON, scopeId);
    };

    this.getGeoJSON = function(scopeId) {
        var defer = getDefer(geoJSON, scopeId);
        return defer.promise;
    };
});
