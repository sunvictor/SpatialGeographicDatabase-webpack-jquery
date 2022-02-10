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
