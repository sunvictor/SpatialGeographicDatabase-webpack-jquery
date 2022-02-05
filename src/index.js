import * as Cesium from 'cesium/Cesium'; // 模块化引用Cesium
// const Cesium = require('cesium/Cesium');
// var Color = require('cesium/Core/Color'); // 引用Cesium部分组件
// var color = Color.fromRandom();
import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css'; // 在index.html引入css文件，如果在这里引入会导致最开始初始化时html没有样式
import "cesium/Widgets/widgets.css";
import $ from "jquery"
import 'ztree'
// import 'ztree/css/zTreeStyle/zTreeStyle.css'
import "./css/ztree/css/bootstrapztree.css"
import "./css/ztree/css/rightClickStyle.css"
import "./js/plugins/honeySwitch"
import "./css/plugins/honeySwitch.css"
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