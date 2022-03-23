import {go} from "../../globalObject";
import GlobeCircleDrawer from "@/js/cesium/entity/plot/edit/GlobeCircleDrawer";
import gykjPanel from "../../../plugins/panel";
import $ from "jquery";
import {honeySwitch} from "../../../plugins/honeySwitch";
import cm from "../../../plugins/CesiumMethod";
import entityProvider from "../EntityProvider";


let _btnName = "圆形";
let _btnIdName = "drawCircle";
export default class circleGraphics {
    viewModel = {
        enabled: false
    }
    circleDrawer = null;
    plotType = "circle";
    layerId = "globeDrawerDemoLayer"

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.circleDrawer = new GlobeCircleDrawer(_this.viewer);
    }

    clear() {
        let _this = this;
        _this.circleDrawer.clear()
    }

    start(okCallback, cancelCallback) {
        let _this = this;
        _this.viewModel.enabled = true;
        _this.circleDrawer.start(function (positions, lonLats, params) {
            okCallback(positions, lonLats, params);
            _this.viewModel.enabled = false;
        }, function () {
            cancelCallback()
            _this.viewModel.enabled = false;
        });
    }

    showCircle(objId, positions, params, isEdit = false) {
        let _this = this;
        let distance = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
            let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
            /**根据经纬度计算出距离**/
            let geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            let s = geodesic.surfaceDistance;
            //返回两点之间的距离
            //			s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));	
            s = Math.abs(point2cartographic.height - point1cartographic.height);
            distance = distance + s;
        }

        // let color = $("#paigusu").data("color");
        // let material = object.tracker.changeColor.getColor(params.color);
        let material = Cesium.Color.fromCssColorString(params.color);
        let outlineMaterial = new Cesium.PolylineGlowMaterialProperty({
            // dashLength: 16,
            color: Cesium.Color.fromCssColorString(params.outlineColor),
        });
        let radiusMaterial = new Cesium.PolylineGlowMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(params.outlineColor),
        });
        let pnts = _this.circleDrawer._computeCirclePolygon(positions);
        let dis = _this.circleDrawer._computeCircleRadius3D(positions);
        // dis = (dis / 1000).toFixed(3);
        let value = typeof positions.getValue === 'function' ? positions.getValue(0) : positions;
        let text = dis + "km";
        let r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));
        // let r = Math.sqrt(Math.pow(value[0].x - value[value.length - 1].x, 2) + Math.pow(value[0].y - value[value.length - 1].y, 2));

        let bData = {
            name: params.name,
            circlePosition: positions,
            // layerId: draw.layerId,
            objId: objId,
            shapeType: "Circle",
            position: positions[0],
            ellipse: {
                semiMajorAxis: dis ? dis : dis + 1,
                semiMinorAxis: dis ? dis : dis + 1,
                material: material,
                outline: true
            }
        };

        let outlineBdata = {
            // layerId: draw.layerId,
            objId: objId,
            shapeType: "CircleOutline",
            polyline: {
                show: params.outline,
                positions: pnts,
                clampToGround: true,
                width: params.outlineWidth,
                material: outlineMaterial
            }
        };
        bData.customProp = params;
        let isAddNode = !isEdit // 是否新增node节点 如果是编辑状态,则不添加node节点
        let entity = go.ec.add(bData, isAddNode);
        // draw.shape.push(entity)
        outlineBdata.customProp = params;
        let outlineEntity = go.ec.add(outlineBdata, isAddNode);
        // draw.shape.push(outlineEntity)
    }


    editShape(treeNode, entity) {
        let _this = this;
        if (_this.circleDrawer.isPanelOpen) {
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
        _this.circleDrawer.showModifyCircle(oldPositions, oldParams, function (positions, params) {
            go.draw.draw.shapeDic[objId] = positions;
            let entity = _this.showCircle(objId, positions, params);
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
            let entity = _this.showCircle(objId, oldPositions, oldParams);
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