import {go} from "../../globalObject";
import GlobeBufferLineDrawer from "./edit/GlobeBufferLineDrawer";
import gykjPanel from "../../../plugins/panel";
import $ from "jquery";
import {honeySwitch} from "../../../plugins/honeySwitch";
import cm from "../../../plugins/CesiumMethod";
import entityProvider from "../EntityProvider";


let _btnName = "缓冲区";
let _btnIdName = "drawBufferLine";
export default class bufferLineGraphics {
    viewModel = {
        enabled: false
    }
    bufferLineDrawer = null;
    plotType = "bufferLine";
    layerId = "globeDrawerDemoLayer"

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.bufferLineDrawer = new GlobeBufferLineDrawer(_this.viewer);
    }

    clear() {
        let _this = this;
        _this.bufferLineDrawer.clear()
    }

    start(okCallback, cancelCallback) {
        let _this = this;
        _this.viewModel.enabled = true;
        _this.bufferLineDrawer.start(function (positions, lonLats, params) {
            okCallback(positions, lonLats, params);
            _this.viewModel.enabled = false;
        }, function () {
            cancelCallback()
            _this.viewModel.enabled = false;
        });
    }

    showBufferLine(objId, positions, radius, params) {
        let _this = this;
        let buffer = _this.bufferLineDrawer.computeBufferLine(positions, radius);
        // let color = $("#paigusu").data("color");
        // let material = object.tracker.changeColor.getColor(params.color);
        let material = Cesium.Color.fromCssColorString(params.color).withAlpha(0.5);
        let lineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.0)
        });
        radius = Number(radius);
        let r = radius / Number(params.speed);
        // let buffer;
        let bData = {
            layerId: draw.layerId,
            objId: objId,
            shapeType: "BufferLine",
            polygon: new Cesium.PolygonGraphics({
                hierarchy: buffer,
                material: material
            }),
            polyline: {
                positions: positions,
                clampToGround: true,
                width: 2,
                material: lineMaterial
            }
        };
        if (params.animate) {
            let animateHierarchy = new Cesium.CallbackProperty(function () {
                r += Number(params.speed);
                if (r >= radius) {
                    r = radius / Number(params.speed);
                }
                buffer = _thi.computeBufferLine(positions, r);
                return new Cesium.PolygonHierarchy(buffer);
            }, false);
            bData.polygon.hierarchy = animateHierarchy;
        }
        bData.customProp = params;
        let entity = _this.viewer.entities.add(bData);
        // draw.shape.push(entity);
        return entity;
    }


    editShape(treeNode, entity) {
        let _this = this;
        if (_this.bufferLineDrawer.isPanelOpen) {
            return;
        }
        go.draw.flag = 1;
        let objId = entity.objId;
        var old = draw.shapeDic[objId];
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

        //进入编辑状态
        object.tracker.bufferLineDrawer.showModifyBufferLine(old.positions, old.radius, oldParams, function (positions, radius, params) {
            go.draw.draw.shapeDic[objId] = {
                positions: positions,
                radius: radius
            };
            let entity = _this.showBufferLine(objId, positions, radius, params);
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
        }, function () {
            let entity = _this.showBufferLine(objId, old.positions, old.radius, oldParams);
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