import GlobeUninterruptedBillboardDrawer from "./edit/GlobeUninterruptedBillboardDrawer";
import {go} from "../../globalObject";
import entityProvider from "../EntityProvider";


let _btnName = "点";
let _btnIdName = "drawBillboard";
export default class billboardGraphics {
    viewModel = {
        enabled: false
    }
    uninterruptedBillboardDrawer = null;
    plotType = "billboard"
    layerId = "globeDrawerDemoLayer"

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.bindModel();
        _this.uninterruptedBillboardDrawer = new GlobeUninterruptedBillboardDrawer(_this.viewer);
    }

    clear() {
        let _this = this;
        _this.uninterruptedBillboardDrawer.clear();
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

    showBillboard(objId, position, isEdit = false) {
        let _this = this;
        let bData = {
            layerId: _this.layerId,
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
        };
        let isAddNode = !isEdit // 是否新增node节点 如果是编辑状态,则不添加node节点
        let entity = go.ec.add(bData, isAddNode);
    }

    editShape(treeNode, entity) {
        let _this = this;
        return;

        console.log("RETURNERROR");
        if (_this.uninterruptedBillboardDrawer.isPanelOpen) {
            return;
        }
        go.draw.flag = 1;
        let objId = entity.objId;
        let oldPosition = go.draw.draw.shapeDic[objId];

        //先移除entity
        let deletedEntity = go.draw.getParams(objId);
        let node;
        try {
            node = go.ec.ztree.getNodeByTId(deletedEntity.nodeProp.tId); // 根据tid获取当前对象的node节点
        } catch (e) {
            console.log(e);
            return;
        }
        let oldParams = deletedEntity.customProp;
        go.draw.clearEntityById(objId);
        let prevNode = treeNode.getPreNode();
        //进入编辑状态
        _this.uninterruptedBillboardDrawer.showModifyPoint(oldPosition, function (position) {
            go.draw.draw.shapeDic[objId] = position;
            let entity = _this.showBillboard(objId, position, params, true);
            entity.nodeProp = treeNode;
            go.ec.treeData[deletedEntity.nodeProp.gIndex] = entity;
            go.ec.entityAttrPanel.closePanel();
            let panelOptions = {
                top: go.ec.entityAttrPanel.top,
                left: go.ec.entityAttrPanel.left,
                width: go.ec.entityAttrPanel.width,
                height: go.ec.entityAttrPanel.height,
            }
            go.ec.entityAttrPanel = new entityProvider(_this.viewer).showAttrPanel(node, entity, panelOptions);
        }, function () {
            _this.showBillboard(objId, oldPosition);
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