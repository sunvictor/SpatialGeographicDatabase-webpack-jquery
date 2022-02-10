import {go} from "../../globalObject";
import GlobePolylineDrawer from "./edit/GlobePolylineDrawer";
import gykjPanel from "../../../plugins/panel";
import $ from "jquery";
import {honeySwitch} from "../../../plugins/honeySwitch";
import cm from "../../../plugins/CesiumMethod";
import entityProvider from "../entityProvider";


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

    clear() {
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

    showPolyline(objId, positions, params, isEdit, enable = true) {
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
            show: params.show,
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
        let isAddNode = !isEdit // 是否新增node节点 如果是编辑状态,则不添加node节点
        let entity = go.ec.add(bData, isAddNode);
        // _this.shape.push(entity)
        return entity;
    }


    editShape(treeNode, entity) {
        let _this = this;
        if (_this.polylineDrawer.isPanelOpen) {
            return;
        }
        go.draw.flag = 1;
        let objId = entity.objId;
        let oldPositions = go.draw.draw.shapeDic[objId];
        //先移除entity
        let deletedEntity = go.draw.getParams(objId);
        let node;
        try {
            node = go.ec.ztree.getNodeByTId(deletedEntity.nodeProp.tId); // 根据tid获取当前对象的node节点
        } catch (e) {
            console.log(e)
            return;
        }
        let oldParams = deletedEntity.customProp;
        // console.log(oldParams);
        go.draw.clearEntityById(objId);
        let prevNode = treeNode.getPreNode();
        //进入编辑状态
        _this.polylineDrawer.showModifyPolyline(oldPositions, oldParams, function (positions, lonLats, params) {
            go.draw.draw.shapeDic[objId] = positions;
            // go.ec.removeNode(treeNode)
            // treeNode.customProp.entityPanel.closePanel();
            let entity = _this.showPolyline(objId, positions, params, true);
            entity.nodeProp = treeNode;
            go.ec.treeData[deletedEntity.nodeProp.gIndex] = entity;
            treeNode.customProp.entityPanel.closePanel();
            let panelOptions = {
                top: treeNode.customProp.entityPanel.top,
                left: treeNode.customProp.entityPanel.left,
                width: treeNode.customProp.entityPanel.width,
                height: treeNode.customProp.entityPanel.height,
            }
            treeNode.customProp.entityPanel = new entityProvider(_this.viewer).showAttrPanel(node, entity, panelOptions);
            // go.ec.moveNode(prevNode, go.ec.latestNode)
        }, function () {
            let entity = _this.showPolyline(objId, oldPositions, oldParams, true);
            entity.nodeProp = treeNode;
            go.ec.treeData[deletedEntity.nodeProp.gIndex] = entity;
            treeNode.customProp.entityPanel.closePanel();
            let panelOptions = {
                top: treeNode.customProp.entityPanel.top,
                left: treeNode.customProp.entityPanel.left,
                width: treeNode.customProp.entityPanel.width,
                height: treeNode.customProp.entityPanel.height,
            }
            treeNode.customProp.entityPanel = new entityProvider(_this.viewer).showAttrPanel(node, entity, panelOptions);
            // go.ec.removeNode(treeNode)
            // go.ec.showNodeAttr(treeNode)
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