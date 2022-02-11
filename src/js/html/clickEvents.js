import {go} from "../cesium/globalObject"
import drawPoint from "../cesium/entity/plot/edit/GlobeUninterruptedBillboardDrawer"
// const $ = require("jQuery");
import $ from "jquery";

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
