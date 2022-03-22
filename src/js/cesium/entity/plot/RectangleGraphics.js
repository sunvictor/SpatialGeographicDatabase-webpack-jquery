import {go} from "../../globalObject";
import GlobeRectangleDrawer from "./edit/GlobeRectangleDrawer";
import gykjPanel from "../../../plugins/panel";
import $ from "jquery";
import {honeySwitch} from "../../../plugins/honeySwitch";
import cm from "../../../plugins/CesiumMethod";
import entityProvider from "../EntityProvider";


let _btnName = "矩形";
let _btnIdName = "drawRectangle";
export default class rectangleGraphics {
    viewModel = {
        enabled: false
    }
    rectangleDrawer = null;
    plotType = "rectangle";
    layerId = "globeDrawerDemoLayer"

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.rectangleDrawer = new GlobeRectangleDrawer(_this.viewer);
    }

    clear() {
        let _this = this;
        _this.rectangleDrawer.clear()
    }

    start(okCallback, cancelCallback) {
        let _this = this;
        _this.viewModel.enabled = true;
        _this.rectangleDrawer.start(function (positions, lonLats, params) {
            okCallback(positions, lonLats, params);
            _this.viewModel.enabled = false;
        }, function () {
            cancelCallback()
            _this.viewModel.enabled = false;
        });
    }

    showRectangle(objId, positions, params) {
        let _this = this;
        // let color = $("#paigusu").data("color");
        let material = Cesium.Color.fromCssColorString(params.color);
        let outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(params.outlineColor)
        });
        let rect = Cesium.Rectangle.fromCartesianArray(positions);
        let arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west,
            rect.north
        ];
        let outlinePositions = Cesium.Cartesian3.fromRadiansArray(arr);
        let bData = {
            rectanglePosition: positions,
            layerId: _this.layerId,
            objId: objId,
            shapeType: "Rectangle",
            polyline: {
                show: params.outline,
                positions: outlinePositions,
                clampToGround: true,
                width: params.outlineWidth,
                material: outlineMaterial
            },
            rectangle: {
                coordinates: rect,
                material: material
            }
        };
        bData.customProp = params;
        let entity = go.ec.add(bData);
        // draw.shape.push(entity)
        return entity;
    }


    editShape(treeNode, entity) {
        let _this = this;
        if (_this.rectangleDrawer.isPanelOpen) {
            return;
        }
        go.draw.flag = 1;
        let objId = entity.objId;
        let oldPositions = go.draw.draw.shapeDic[objId];
        //先移除entity
        let deletedEntity = go.draw.getParams(objId);
        let oldParams = deletedEntity.customProp;
        // console.log(oldParams);
        go.draw.clearEntityById(objId);

        //进入编辑状态
        _this.rectangleDrawer.showModifyRectangle(oldPositions, oldParams, function (positions, params) {
            go.draw.draw.shapeDic[objId] = positions;
            let entity = _this.showRectangle(objId, positions, params);
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
            let entity = _this.showRectangle(objId, oldPositions, oldParams);
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