import {go} from "../cesium/globalObject"
import drawPoint from "../cesium/entity/plot/edit/GlobeUninterruptedBillboardDrawer"
// const $ = require("jQuery");
import $ from "jquery";
import RadarScan from "../cesium/effect/RadarScan";
import CircleScan from "../cesium/effect/CircleScan";

$(".nav_btn").on('click', function () {

})
$("#layerManage").on('click', function () {
    go.lc.viewModel.enabled = !go.lc.viewModel.enabled
})
$("#entityManage").on('click', function () {
    go.ec.viewModel.enabled = !go.ec.viewModel.enabled
})
$("#terrainManage").on('click', function () {
    go.terrain.viewModel.enabled = !go.terrain.viewModel.enabled
})
$("#measurePoint").on('click', function () {
    go.measure.viewModel.measurePointEnabled = !go.measure.viewModel.measurePointEnabled
})
$("#measureDistance").on('click', function () {
    go.measure.viewModel.measureDistanceEnabled = !go.measure.viewModel.measureDistanceEnabled
})
$("#measureArea").on('click', function () {
    go.measure.viewModel.measureAreaEnabled = !go.measure.viewModel.measureAreaEnabled
})
$("#measureHeight").on('click', function () {
    go.measure.viewModel.measureHeightEnabled = !go.measure.viewModel.measureHeightEnabled
})
$("#clearMeasure").on('click', function () {
    go.measure.destroy();
})
$("#lightRain").on('click', function () {
    go.weather.viewModel.lightRainEnabled = !go.weather.viewModel.lightRainEnabled;
})
$("#midRain").on('click', function () {
    go.weather.viewModel.midRainEnabled = !go.weather.viewModel.midRainEnabled;
})
$("#heavyRain").on('click', function () {
    go.weather.viewModel.heavyRainEnabled = !go.weather.viewModel.heavyRainEnabled;
})
$("#raindropFunc").on('click', function () {
    go.weather.viewModel.raindropEnabled = !go.weather.viewModel.raindropEnabled;
})
$("#thunder").on('click', function () {
    go.weather.viewModel.thunderEnabled = !go.weather.viewModel.thunderEnabled;
})
$("#snow").on('click', function () {
    go.weather.viewModel.snowEnabled = !go.weather.viewModel.snowEnabled;
})
$("#overcast").on('click', function () {
    go.weather.viewModel.overcastEnabled = !go.weather.viewModel.overcastEnabled;
})
$("#cloudy").on('click', function () {
    go.weather.viewModel.cloudyEnabled = !go.weather.viewModel.cloudyEnabled;
})
$("#sunny").on('click', function () {
    go.weather.viewModel.sunnyEnabled = !go.weather.viewModel.sunnyEnabled;
})
$("#nightView").on('click', function () {
    go.weather.viewModel.nightViewEnabled = !go.weather.viewModel.nightViewEnabled;
})
$("#snowMountain").on('click', function () {
    go.weather.viewModel.snowMountainEnabled = !go.weather.viewModel.snowMountainEnabled;
})
$("#screenFog").on('click', function () {
    go.weather.viewModel.screenFogEnabled = !go.weather.viewModel.screenFogEnabled;
})
$("#floodLight").on('click', function () {
    go.fl.viewModel.show = !go.fl.viewModel.show;
})
$("#heatMap").on('click', function () {
    let enabled = $(this).data('enabled');
    if (!enabled) {
        let coordinate1 = [106.23981504570496, 29.640241208388307, 106.5416197281101, 29.871498171685833];
        let heatMap1 = go.heatmap.createHeatMap(go.heatmap.getData(1000).max, go.heatmap.getData(1000).data);
        go.heatmap.createRectangle(viewer, coordinate1, heatMap1);
        $(this).data('enabled', true)
    } else {
        viewer.entities.remove(go.heatmap.heatM);
        $(this).data('enabled', false)
    }
    go.bbi.bindImg("热力图", "heatMap", !enabled) // 切换是否选中图片
})
$("#addModel").on('click', function () {
    go.model.viewModel.enabled = !go.model.viewModel.enabled;
})
$("#earthRotation").on('click', function () {
    go.er.viewModel.enabled = !go.er.viewModel.enabled;
})
$("#dataSource").on('click', function () {
    go.ds.viewModel.enabled = !go.ds.viewModel.enabled;
})
$("#panoramicView").on('click', function () {
    go.pc.viewModel.enabled = !go.pc.viewModel.enabled;
})
$("#wireFrame").on('click', function () {
    let enabled = $(this).data('enabled')
    go.bbi.bindImg("地形三角网", "wireFrame", !enabled) // 切换是否选中图片
    viewer.cesiumInspector.viewModel.wireframe = !enabled;
    $(this).data('enabled', !enabled)
})
$("#radar").on('click', function () {
    let enabled = $(this).data('enabled');
    if (!enabled) {
        let center = Cesium.Cartesian3.fromDegrees(106.39194994, 29.84123831, 0);
        let color = new Cesium.Color(1, 0.0, 0.0, 1);
        let radar = new RadarScan(viewer);
        $(this).data('data', radar);
        radar.start(center, 1500, color, 3000);
    } else {
        let radar = $(this).data('data');
        radar.clear();
    }
    $(this).data("enabled", !enabled)
    go.bbi.bindImg("雷达", "radar", !enabled)
})
$("#proliferation").on('click', function () {
    let enabled = $(this).data('enabled');
    if (!enabled) {
        let center = Cesium.Cartesian3.fromDegrees(106.39194994, 29.84123831, 0);
        let color = new Cesium.Color(0, 1.0, 0.0, 1);
        var circle = new CircleScan(viewer);
        $(this).data('data', circle);
        circle.start(center, 1500, color, 3000);
    } else {
        let circle = $(this).data('data');
        circle.clear();
    }
    $(this).data("enabled", !enabled)
    go.bbi.bindImg("扩散", "proliferation", !enabled)
})
$("#wall").on('click', function () {
    let enabled = $(this).data('enabled');
    if (!enabled) {
        go.dw.start();
    } else {
        go.dw.clear();
    }
    $(this).data("enabled", !enabled)
    go.bbi.bindImg("动态墙", "wall", !enabled)
})
$("#navigator").on('click', function () {
    let enabled = $(this).data('enabled')
    go.bbi.bindImg("指北针", "navigator", !enabled)
    _earth.camera.navigator.showCompass = !enabled
    $(this).data("enabled", !enabled)
})
$("#plottingScale").on('click', function () {
    let enabled = $(this).data('enabled')
    if (!enabled) {
        $("#customerPlottingScale").show();
    } else {
        $("#customerPlottingScale").hide();
    }
    go.bbi.bindImg("指北针", "plottingScale", !enabled)
    $(this).data("enabled", !enabled)
})
$("#homeView").on('click', function () {
    go.hv.start();
})