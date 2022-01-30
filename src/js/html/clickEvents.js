import {go} from "../cesium/globalObject"

// const $ = require("jQuery");
import $ from "jquery";
$(".nav_btn").on('click', function () {
    go.lc.viewModel.enabled = !go.lc.viewModel.enabled
})