import {go} from "../../globalObject";
import GlobePolygonDrawer from "./edit/GlobePolygonDrawer";
import gykjPanel from "../../../plugins/panel";
import $ from "jquery";
import {honeySwitch} from "../../../plugins/honeySwitch";
import cm from "../../../plugins/CesiumMethod";
import entityProvider from "../EntityProvider";


let _btnName = "多边形";
let _btnIdName = "drawPolygon";
export default class polygonGraphics {
    viewModel = {
        enabled: false
    }
    polygonDrawer = null;
    plotType = "polygon";
    layerId = "globeDrawerDemoLayer"

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.polygonDrawer = new GlobePolygonDrawer(_this.viewer);
    }

    clear() {
        let _this = this;
        _this.polygonDrawer.clear()
    }

    start(okCallback, cancelCallback) {
        let _this = this;
        _this.viewModel.enabled = true;
        _this.polygonDrawer.start(function (positions, lonLats, params) {
            okCallback(positions, lonLats, params);
            _this.viewModel.enabled = false;
        }, function () {
            cancelCallback()
            _this.viewModel.enabled = false;
        });
    }

    showPolygon(objId, positions, params, isEdit = false) {
        let _this = this;
        let height = 300;
        let outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(params.outlineColor),
        });
        let outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        let ex = new Cesium.CallbackProperty(function () {
            return params.extrudedHeight;
        }, false);
        let bData = {
            name: params.name,
            layerId: _this.layerId,
            objId: objId,
            shapeType: "Polygon",
            polyline: {
                show: params.outline,
                // positions: new Cesium.CallbackProperty(function () {
                //     return outlinePositions;
                // }, false),
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: {
                hierarchy: positions,
                // hierarchy: new Cesium.CallbackProperty(function (time, result) {
                //     return new Cesium.PolygonHierarchy(positions);
                // }, false),
                // extrudedHeight: params.extrudedHeight>0?ex:undefined,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                asynchronous: false,
                material: Cesium.Color.fromCssColorString(params.color),
                // height: new Cesium.CallbackProperty(function () {
                // 	return height;
                // })
            }
        };
        if (!params.ground && params.extrudedHeight > 0) { // 当贴地属性为false并且拉伸高度大于0时，拉伸
            bData.polygon.extrudedHeight = ex;
            // bData.polygon.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        bData.customProp = params;
        let isAddNode = !isEdit // 是否新增node节点 如果是编辑状态,则不添加node节点
        let entity = go.ec.add(bData, isAddNode);
        // draw.shape.push(entity)
        return entity;
    }


    editShape(treeNode, entity) {
        let _this = this;
        if (_this.polygonDrawer.isPanelOpen) {
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
        _this.polygonDrawer.showModifyPolygon(oldPositions, oldParams, function (positions, params) {
            go.draw.draw.shapeDic[objId] = positions;
            // go.ec.removeNode(treeNode)
            // treeNode.customProp.entityPanel.closePanel();
            let entity = _this.showPolygon(objId, positions, params, true);
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
            let entity = _this.showPolygon(objId, oldPositions, oldParams, true);
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
                _this.clear();
                // _this.entityPanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}