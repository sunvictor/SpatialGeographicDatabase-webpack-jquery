import gykjAlert from "../../plugins/alert";
import {go} from "../globalObject";
import cm from "@/js/plugins/CesiumMethod";

let _btnName = "初始视图";
let _btnIdName = "homeView";
export default class HomeView {
    viewModel = {
        lon: 106.3931931565161,
        lat: 29.805810956616792,
        height: 1100,
        heading: 0,
        pitch: -90,
        roll: 0
    }

    constructor(viewer) {
        this.viewer = viewer;
        let options = {
            btn: $("#" + _btnIdName).next(),
            content: `<div id='homeView_config'>
    <div><span>精度</span><input type='text' data-bind="value: lon, valueUpdate: 'input'"></div>
    <div><span>纬度</span><input type='text' data-bind="value: lat, valueUpdate: 'input'"></div>
    <div><span>朝向</span><input type='range' min="-90" max="90" data-bind="value: heading, valueUpdate: 'input'"><input type='text' data-bind="value: heading, valueUpdate: 'input'">°</div>
    <div><span>倾斜</span><input type='range' min="-90" max="90" data-bind="value: pitch, valueUpdate: 'input'"><input type='text' data-bind="value: pitch, valueUpdate: 'input'">°</div>
    <div><span>翻转</span><input type='range' min="-90" max="90" data-bind="value: roll, valueUpdate: 'input'"><input type='text' data-bind="value: roll, valueUpdate: 'input'">°</div>
    <div><button id="resetHomeView">重置</button><button id="saveHomeView">保存当前视角</button></div>
    <div></div></div>`
        }
        let lightAlert = new gykjAlert(options);
        this.bindModel();
        this.clickEvents();
    }

    start() {
        let _this = this;
        // 设置相机初始化显示视角
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(_this.viewModel.lon, _this.viewModel.lat, _this.viewModel.height),
            orientation: {
                heading: Cesium.Math.toRadians(_this.viewModel.heading),
                pitch: Cesium.Math.toRadians(_this.viewModel.pitch),
                roll: Cesium.Math.toRadians(_this.viewModel.roll)
            }
        });
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById("homeView_config"); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
    }

    clickEvents() {
        let _this = this;
        $("#resetHomeView").off('click').on('click', function () {
            go.hv.viewModel.lon = 106.3931931565161
            go.hv.viewModel.lat = 29.805810956616792
            go.hv.viewModel.height = 1100
            go.hv.viewModel.heading = 0
            go.hv.viewModel.pitch = -90
            go.hv.viewModel.roll = 0
        })
        $("#saveHomeView").off('click').on('click', function () {
            let camera = _this.viewer.scene.camera;
            let coordinate = cm.cartesianToCoordinate(camera.position);
            go.hv.viewModel.lon = coordinate[0]
            go.hv.viewModel.lat = coordinate[1]
            go.hv.viewModel.height = cm.getCameraHeight()
            go.hv.viewModel.heading = Cesium.Math.toDegrees(camera.heading)
            go.hv.viewModel.pitch = Cesium.Math.toDegrees(camera.pitch)
            go.hv.viewModel.roll = Cesium.Math.toDegrees(camera.roll)
        })
    }
}