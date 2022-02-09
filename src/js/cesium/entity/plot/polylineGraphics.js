import {go} from "../../globalObject";
import GlobePolylineDrawer from "./edit/GlobePolylineDrawer";
import gykjPanel from "../../../plugins/panel";
import $ from "jquery";
import {honeySwitch} from "../../../plugins/honeySwitch";
import cm from "../../../plugins/CesiumMethod";


let _btnName = "折线";
let _btnIdName = "drawPolyline";
export default class polylineGraphics {
    viewModel = {
        enabled: false
    }
    polylineDrawer = null;
    plotType = "polyline";
    layerId = "globeDrawerDemoLayer"
    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.polylineDrawer = new GlobePolylineDrawer(_this.viewer);
    }

    clear(){
        let _this = this;
        _this.polylineDrawer.clear()
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
            layerId: _this.layerId,
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


    editShape(treeNode, entity){
        let _this = this;
        go.draw.flag = 1;
        window.t = treeNode;
        let objId = entity.objId;
        let oldPositions = go.draw.draw.shapeDic[objId];

        //先移除entity
        let deletedEntity = go.draw.getParams(objId);
        let oldParams = deletedEntity.customProp;
        // console.log(oldParams);
        go.draw.clearEntityById(objId);
        let prevNode = treeNode.getPreNode();
        //进入编辑状态
        _this.polylineDrawer.showModifyPolyline(oldPositions, oldParams, function (positions, lonLats, params) {
            go.draw.draw.shapeDic[objId] = positions;
            go.ec.removeNode(treeNode)
            go.ec.entityAttrPanel.closePanel();
            _this.showPolyline(objId, positions, params);
            // go.ec.moveNode(prevNode, go.ec.latestNode)
        }, function () {
            _this.showPolyline(objId, oldPositions, oldParams);
            go.ec.removeNode(treeNode)
            go.ec.showNodeAttr(treeNode)
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