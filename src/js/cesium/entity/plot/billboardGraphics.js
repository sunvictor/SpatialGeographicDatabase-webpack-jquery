import GlobeUninterruptedBillboardDrawer from "./edit/GlobeUninterruptedBillboardDrawer";
import {go} from "../../globalObject";


let _btnName = "点";
let _btnIdName = "drawBillboard";
export default class billboardGraphics {
    viewModel = {
        enabled: false
    }
    uninterruptedBillboardDrawer = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.uninterruptedBillboardDrawer = new GlobeUninterruptedBillboardDrawer(_this.viewer);
    }

    showDetailPanel(treeNode, entity) {
        console.log(treeNode)
    }

    start(okCallback, cancelCallback) {
        let _this = this;
        _this.viewModel.enabled = true;
        _this.uninterruptedBillboardDrawer.start(function (positions) {
            okCallback(positions);
            _this.viewModel.enabled = false;
        }, function (positions) {
            cancelCallback(positions)
            _this.viewModel.enabled = false;
        });
    }

    showBillboard(objId, position) {
        let _this = this;
        let entity = go.ec.add({
            // layerId: _this.layerId,
            objId: objId,
            shapeType: "Billboard",
            position: position,
            billboard: {
                image: _this.uninterruptedBillboardDrawer.image,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //元素在正上方
            },
            clampToGround: true
        });
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