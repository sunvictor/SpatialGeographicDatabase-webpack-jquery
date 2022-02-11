// import * as Cesium from 'cesium/Cesium'; // 模块化引用Cesium
// const Cesium = require('cesium/Cesium');
// var Color = require('cesium/Core/Color'); // 引用Cesium部分组件
// var color = Color.fromRandom();
import 'bootstrap';
import cocoMessage from '@/js/plugins/coco-message'
// import 'bootstrap/dist/css/bootstrap.min.css'; // 在index.html引入css文件，如果在这里引入会导致最开始初始化时html没有样式
import "./css/index.css"
import "cesium/Widgets/widgets.css";
import $ from "jquery" // 这里不能注释掉，下面的ztree要用
import 'ztree'
// import 'ztree/css/zTreeStyle/zTreeStyle.css'
import "./css/ztree/css/bootstrapztree.css"
import "./css/ztree/css/rightClickStyle.css"
import "./js/plugins/honeySwitch"
import "./css/plugins/honeySwitch.css"
import "./css/panel.css"
import {initMainHtml} from "./js/html/mainHtml";
import {startUpEarth, startUpCesium} from "./js/cesium/initMap";

// 初始化消息提示
cocoMessage.config({
    duration: 2500,
});

// require('cesium/Widgets/widgets.css');
if (typeof XE !== 'undefined') {
    XE.ready().then(function () {
        startUpEarth();
    })
} else {
    startUpCesium();
}
initMainHtml();

$(document.body).show(); // 加载index.html时是给body加了`display: none`的, 因为css还没有加载进去, 会导致最开始的html没有样式, 所以最开始就不显示body了
// const { app, BrowserWindow } = require('electron')
//
// function createWindow () {
//     const win = new BrowserWindow({
//         width: 800,
//         height: 600
//     })
//
//     win.loadFile('src/index.html')
// }
// app.whenReady().then(() => {
//     createWindow()
// })