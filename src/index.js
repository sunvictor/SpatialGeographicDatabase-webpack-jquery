import * as Cesium from 'cesium/Cesium'; // 模块化引用Cesium
// const Cesium = require('cesium/Cesium');
// var Color = require('cesium/Core/Color'); // 引用Cesium部分组件
// var color = Color.fromRandom();
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import "cesium/Widgets/widgets.css";
import "./css/index.css"
import "./css/panel.css"
import {initMainHtml} from "./js/html/mainHtml";
import {startUpEarth, startUpCesium} from "./js/cesium/initMap";
// require('cesium/Widgets/widgets.css');
if (typeof XE !== 'undefined') {
    XE.ready().then(function(){
        startUpEarth();
    })
} else {
    startUpCesium();
}
initMainHtml();