import {go} from "../../globalObject";
import GlobePolylineDrawer from "./edit/GlobePolylineDrawer";


let _btnName = "折线";
let _btnIdName = "drawPolyline";
export default class polylineGraphics{
    viewModel = {
        enabled: false
    }
    polylineDrawer = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.polylineDrawer = new GlobePolylineDrawer(_this.viewer);
    }

    start(okCallback, cancelCallback) {
        let _this = this;
        _this.viewModel.enabled = true;
        _this.polylineDrawer.start(function (positions, lonLats, params) {
            okCallback(positions, lonLats, params);
            _this.viewModel.enabled = false;
        }, function () {
            cancelCallback()
            _this.viewModel.enabled = false;
        });
    }

    showPolyline(objId, positions, params, enable = true) {
        let _this = this;
        // var color = $("#paigusu").data("color");
        let color = null;
        if (!color) {
            color = 'rgba(228,235,41,0.6)';
        }
        var material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString(color)
        });
        let bData = {
            name: params.name,
            // layerId: _this.layerId,
            objId: objId,
            shapeType: "Polyline",
            polyline: {
                positions: positions,
                clampToGround: true,
                width: enable ? params.width : 8,
                material: material
            }
        };
        bData.customProp = params;
        bData.customProp.orginPositions = positions;
        let entity = go.ec.add(bData);
        // _this.shape.push(entity)
        return entity;
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById(_btnIdName); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue) // 切换是否选中图片
                // _this.entityPanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}