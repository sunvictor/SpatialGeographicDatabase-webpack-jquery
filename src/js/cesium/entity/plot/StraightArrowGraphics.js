import {go} from "../../globalObject";
import PlotStraightArrowDrawer from "./edit/PlotStraightArrowDrawer";
import gykjPanel from "../../../plugins/panel";
import $ from "jquery";
import {honeySwitch} from "../../../plugins/honeySwitch";
import cm from "../../../plugins/CesiumMethod";
import entityProvider from "../EntityProvider";


let _btnName = "攻击箭头";
let _btnIdName = "drawStraightArrow";
export default class straightArrowGraphics {
    viewModel = {
        enabled: false
    }
    straightArrowDrawer = null;
    plotType = "straightArrow";
    layerId = "globeDrawerDemoLayer"

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.straightArrowDrawer = new PlotStraightArrowDrawer(_this.viewer);
    }

    clear() {
        let _this = this;
        _this.straightArrowDrawer.clear()
    }

    start(okCallback, cancelCallback) {
        let _this = this;
        _this.viewModel.enabled = true;
        _this.straightArrowDrawer.start(function (positions, lonLats, params) {
            okCallback(positions, lonLats, params);
            _this.viewModel.enabled = false;
        }, function () {
            cancelCallback()
            _this.viewModel.enabled = false;
        });
    }

    showStraightArrow(objId, positions, params) {
        let _this = this;
        var material = Cesium.Color.fromCssColorString(params.color);
        var outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(params.outlineColor)
        });
        var outlinePositions = [].concat(positions);
        outlinePositions.push(positions[0]);
        var bData = {
            name: params.name,
            layerId: _this.layerId,
            objId: objId,
            shapeType: "StraightArrow",
            polyline: {
                show: params.outline,
                positions: outlinePositions,
                clampToGround: true,
                width: 2,
                material: outlineMaterial
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: positions,
                asynchronous: false,
                material: material
            })
        };
        bData.customProp = params;
        let entity = go.ec.add(bData);
        return entity;
    }


    editShape(treeNode, entity) {
        let _this = this;
        if (_this.straightArrowDrawer.isPanelOpen) {
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

        //进入编辑状态
        _this.straightArrowDrawer.showModifyStraightArrow(oldPositions, oldParams, function (positions, params) {
            go.draw.draw.shapeDic[objId] = positions;
            let entity = _this.showStraightArrow(objId, positions, params);
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
            let entity = _this.showStraightArrow(objId, oldPositions, oldParams);
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
                _this.clear();
                // _this.entityPanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}