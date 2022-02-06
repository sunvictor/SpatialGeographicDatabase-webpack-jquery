import gykjPanel from "@/js/plugins/panel";
import {go} from "@/js/cesium/globalObject";

let _btnName = "图形管理";
let _btnIdName = "entityManage";
export default class entityControl {
    treeData = [];

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.viewModel = {};
        _this.init();
        _this.bindModel();
    }

    init() {
        let _this = this;
        let setting = {
            view: {
                selectedMulti: false
            },
            async: {
                enabled: true
            },
            check: {
                enable: true,
                autoCheckTrigger: true,
                nocheckInherit: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            edit: {
                enable: true,
            },
            callback: {
                // onRightClick: _this.onRightClick,
                onCheck: _this.controlEntityShow,
                onRename: _this.onRename,
                onRemove: _this.onRemove,
                // onClick: _this.onClick,
                // onDblClick: _this.onDblClick,
                // beforeDrag: _this.beforeDrag,
                // beforeDrop: _this.beforeDrop
            }
        };

        _this.treeData.push({
            name: "图形管理",
            open: true,
            checked: true,
            type: 'dir'
        })

        let ul = document.createElement("ul");
        ul.setAttribute("id", "entityTree")
        ul.classList.add('ztree')

        _this.entityPanel = new gykjPanel({
            title: "图形管理",
            show: true,
            width: 400,
            height: 470,
            top: 220,
            content: ul,
            callback: {
                hidePanel: closeLayerPanel
            }
        })
        _this.entityPanel.show = false;
        _this.viewModel['enabled'] = false;

        _this.ztree = $.fn.zTree.init($("#entityTree"), setting, _this.treeData);

        function closeLayerPanel() {
            _this.viewModel.enabled = false
        }
    }

    /**
     * 添加图层
     * @param params 参数与 viewer.entities.add 的参数相同
     */
    add(params) {
        let _this = this;
        if (!params.name) {
            params.name = "未命名图形"
        }
        const entity = _this.viewer.entities.add(params)
        entity.customProp = {};
        let newNode = {
            name: entity.name,
            checked: entity.show
            // data: JSON.stringify(map)
        }
        _this.addNode(-1, newNode, entity)
        return entity;
    }

    remove(entity) {
        let _this = this;
        if (!Cesium.defined(entity)) {
            return false;
        }
        let isRemove = _this.viewer.entities.remove(entity);
        if (isRemove) {

        }
        return isRemove;
    }

    removeEntity(entity) {
        let _this = this;
        if (typeof entity == "object") { // layer是treeNode对象
            let gIndex = entity.gIndex;
            go.ec.remove(_this.treeData[gIndex])
            // _this.treeData.removeByIndex(gIndex);
            _this.treeData[gIndex] = "hasRemoved"
        } else if (typeof entity == "string") {
            _this.treeData.remove(entity);
        }
    }

    /**
     * 添加节点
     * @param parentNode {Object} 父节点
     * @param newNode {Object} 新节点的json格式对象，里面的`name`属性值会作为节点名称呈现在页面中
     * @param data {Object} 要添节点的数据
     */
    addNode(parentNode, newNode, data) {
        let _this = this;
        const tree = $.fn.zTree.getZTreeObj("entityTree")
        const selectedNode = tree.getSelectedNodes();
        let arrLength = _this.treeData.push(data);
        let uuid = _this.generateUUid();
        let index = arrLength - 1;
        newNode.gid = uuid;
        newNode.gIndex = index;
        // if (selectedNode.length > 0) {
        if (parentNode != null) {
            parentNode = tree.getNodes()[0]
        }
        newNode = tree.addNodes(parentNode, newNode);
        // tree.refresh()
        // }
        return newNode;
    }

    onRename(event, treeId, treeNode) {
        let entity = go.ec.getNodeData(treeNode.gIndex)
        if (!entity) {
            return;
        }
        entity.name = treeNode.name
    }


    onRemove(event, treeId, treeNode) {
        if (treeNode && treeNode.isParent) {
            for (let i = 0; i < treeNode.children.length; i++) {
                go.ec.removeEntity(treeNode.children[i])
            }
        } else {
            go.ec.removeEntity(treeNode);
        }
    }

    controlEntityShow(event, treeId, treeNode) {
        let chkStatus = treeNode.getCheckStatus()
        let entity = go.ec.getNodeData(treeNode.gIndex)
        if (!entity) {
            return;
        }
        entity.show = chkStatus.checked
    }

    getNodeData(index) {
        let _this = this;
        return _this.treeData[index]
    }

    /**
     * 生成一个用不重复的ID
     * @param { Number } randomLength
     */
    generateUUid(randomLength = 2) {
        return Number(Math.random().toString().substr(2, randomLength) + Date.now()).toString(16)
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById('entityManage'); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue) // 切换是否选中图片
                _this.entityPanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}