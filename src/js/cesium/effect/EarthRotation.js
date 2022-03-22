import {go} from "@/js/cesium/globalObject";
import gykjAlert from "@/js/plugins/alert";

let _btnName = "飞行浏览";
let _btnIdName = "earthRotation"
export default class EarthRotation {
    previousTime = null;
    earthHandler = null;
    viewModel = {
        enabled: false,
        multiplier: 100
    }

    constructor(viewer) {
        this.viewer = viewer;
        let options = {
            btn: $("#" + _btnIdName).next(),
            content: `<div id='earthRotationConfig'>
    <div><span>速度</span></div>
    <div><input type='range' min="70" max="1000" step="0.01" data-bind="value: multiplier, valueUpdate: 'input'"></div></div>`
        }
        console.log(2)
        let lightAlert = new gykjAlert(options)
        this.bindModel();
    }

    clear() {
        let _this = this;
        _this.viewer.clock.onTick.removeEventListener(onTickCallback);
        _this.viewer.clock.multiplier = 1;
        _this.viewer.clock.clock = new Cesium.Clock({
            currentTime: Cesium.JulianDate.fromDate(new Date())
        })
    }

    earthRotationStart() {
        let _this = this;
        _this.viewer.clock.multiplier = Number(_this.viewModel.multiplier); //速度
        _this.viewer.clock.shouldAnimate = true;
        _this.previousTime = _this.viewer.clock.currentTime;
        _this.viewer.clock.onTick.removeEventListener(onTickCallback);

        _this.viewer.clock.onTick.addEventListener(onTickCallback);
        _this.earthHandler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
        _this.earthHandler.setInputAction(function (click) {
            _this.viewModel.enabled = false
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById("earthRotationConfig"); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue) // 切换是否选中图片
                if (newValue) {
                    _this.earthRotationStart(newValue)
                } else {
                    _this.clear();
                }
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'multiplier').subscribe(
            function (newValue) {
                if (_this.viewModel.enabled) {
                    _this.viewer.clock.multiplier = Number(newValue)
                }
            }
        );
    }
}

function onTickCallback() {
    let currentTime = go.er.viewer.clock.currentTime;
    let delta = Cesium.JulianDate.toDate(currentTime) - Cesium.JulianDate.toDate(go.er.previousTime);
    go.er.previousTime = currentTime;
    go.er.viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, (Math.PI / (24 * 60 * 60)) * (delta / 60000));
}