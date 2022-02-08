import {go} from "../cesium/globalObject"
import drawPoint from "../cesium/entity/plot/edit/GlobeUninterruptedPointDrawer"
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
