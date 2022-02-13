import gykjPanel from "@/js/plugins/panel";
import {go} from "@/js/cesium/globalObject";
import entityProvider from "./EntityProvider";
import cocoMessage from '@/js/plugins/coco-message'

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
        _this.treeSetting = {
            view: {
                selectedMulti: false
            },
            async: {
                enabled: false
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
                beforeRemove: _this.beforeRemove,
                onRightClick: _this.onRightClick,
                onCheck: _this.controlEntityShow,
                onRename: _this.onRename,
                onRemove: _this.onRemove,
                // onClick: _this.onClick,
                onDblClick: _this.onDblClick,
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
            left: 250,
            content: ul,
            closeType: "hide",
            callback: {
                closePanel: closeLayerPanel
            }
        })
        _this.entityPanel.show = false;
        _this.viewModel['enabled'] = false;

        _this.ztree = $.fn.zTree.init($("#entityTree"), _this.treeSetting, _this.treeData);

        function closeLayerPanel() {
            _this.viewModel.enabled = false
        }
    }

    /**
     * 添加图层
     * @param params 参数与 viewer.entities.add 的参数相同
     * @param isAddNode
     */
    add(params, isAddNode = true) {
        let _this = this;
        if (!params.name) {
            params.name = "未命名图形"
        }
        const entity = _this.viewer.entities.add(params)
        if (!entity.customProp) {
            entity.customProp = {};
        }
        let newNode = {
            name: entity.name,
            checked: entity.show
            // data: JSON.stringify(map)
        }
        if (isAddNode) {
            let node = _this.addNode(-1, newNode, entity);
            node.customProp = {
                isAttrPanelOpen: false
            }
        }
        return entity;
    }

    remove(entity) {
        let _this = this;
        if (!Cesium.defined(entity)) {
            return false;
        }
        let isRemove;
        if (entity instanceof Cesium.Entity) {
            isRemove = _this.viewer.entities.remove(entity);
        } else if (entity instanceof Cesium.Cesium3DTileset) {
            isRemove = _this.viewer.scene.primitives.remove(entity)
        } else if (entity instanceof  Cesium.KmlDataSource) {
            isRemove = _this.viewer.dataSources.remove(entity)
        }
        if (isRemove) {
            if (entity.nodeProp) {
                // console.log(2,entity.nodeProp)
                const tree = $.fn.zTree.getZTreeObj("entityTree")
                let node = tree.getNodeByTId(entity.nodeProp.tId)
                if (node) {
                    _this.removeNode(node);
                }
            }
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
            if (typeof parentNode == "undefined") { // 如果已经没有根节点了,就创建一个
                _this.treeData = [{
                    name: "图形管理",
                    open: true,
                    checked: true,
                    type: 'dir'
                }]
                _this.ztree = $.fn.zTree.init($("#entityTree"), _this.treeSetting, _this.treeData);
                _this.addNode(-1, newNode, data)
                return null;
            }
        }
        newNode = tree.addNodes(parentNode, newNode);
        data.nodeProp = newNode[0] // 将treeNode数据放入entity中
        // tree.refresh()
        // }
        return newNode[0];
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

    moveNode(targetNode, treeNode, moveType = "next", isSilent = true) {
        const tree = $.fn.zTree.getZTreeObj("entityTree")
        tree.moveNode(targetNode, treeNode, moveType, isSilent)
    }

    onDblClick(event, treeId, treeNode) {
        if (!treeNode) {
            return;
        }
        if (treeNode && treeNode.isParent) {
            return;
        }
        let nodeData = go.ec.getNodeData(treeNode.gIndex);
        go.ec.flyToEntity(nodeData);
    }

    positionEntity(treeNode) {
        let _this = this;
        _this.flyToEntity(_this.getNodeData(treeNode.gIndex))
        _this.hideRMenu();
        _this.ztree.selectNode(treeNode)
    }

    flyToEntity(entity) {
        let _this = this;
        let height = _this.viewer.camera.positionCartographic.height;
        _this.viewer.flyTo(entity, {
            offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(0), Cesium.Math.toRadians(-90), 1000)
        }).then((bool) => {
            if (!bool) {
                console.log("定位失败")
                cocoMessage.warning("定位失败");
            }
        });
    }

    /**
     * 显示右键菜单
     * @param treeId
     * @param treeNode
     * @param type
     * @param x
     * @param y
     */
    showRMenu(treeId, treeNode, type, x, y) {
        let _this = this;
        let rMenu = document.createElement("div")
        document.querySelector(".B").append(rMenu)

        let positionA = document.createElement("a")
        rMenu.append(positionA)
        positionA.classList.add('list-group-item')
        $(positionA).text("定位")
        $(positionA).on('click', function () {
            _this.positionEntity(treeNode)
        })
        let deleteA = document.createElement("a")
        rMenu.append(deleteA)
        deleteA.classList.add('list-group-item')
        $(deleteA).text("删除")
        $(deleteA).on('click', function () {
            _this.removeNode(treeNode)
        })
        let attrA = document.createElement("a")
        rMenu.append(attrA)
        attrA.classList.add('list-group-item')
        $(attrA).text("属性")
        $(attrA).on('click', function () {
            _this.showNodeAttr(treeNode)
        })

        $(rMenu).attr("id", "rMenu")
        $("#rMenu").css({
            "top": y + "px",
            "left": x + "px",
            "visibility": "visible"
        }); //设置右键菜单的位置、可见
        $("body").bind("mousedown", _this.onBodyMouseDown);
    }

    beforeRemove(treeId, treeNode) {

    }

    onRightClick(event, treeId, treeNode) {
        if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
            go.ec.showRMenu(treeId, treeNode, "root", event.clientX, event.clientY - 130); // 减去导航栏的高度
        } else if (treeNode && !treeNode.noR) {
            go.ec.showRMenu(treeId, treeNode, "node", event.clientX, event.clientY - 130); // 减去导航栏的高度
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

    /**
     * 勾选 或 取消勾选 单个节点 参数含义参建ztree api
     * @param treeNode
     * @param checked
     * @param checkTypeFlag
     * @param callbackFlag
     */
    checkNode(treeNode, checked, checkTypeFlag = true, callbackFlag = false) {
        const tree = $.fn.zTree.getZTreeObj("entityTree")
        let checkNode = tree.checkNode(treeNode, checked, checkTypeFlag, callbackFlag);
        return checkNode;
    }

    /**
     * 移除节点
     * @param treeNode
     * @param callbackFlag
     */
    removeNode(treeNode, callbackFlag = false) {
        let _this = this;
        const tree = $.fn.zTree.getZTreeObj("entityTree")
        tree.removeNode(treeNode, callbackFlag)
        _this.removeEntity(treeNode)
        _this.hideRMenu();
    }


    //鼠标按下事件
    onBodyMouseDown(event) {
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
            // $("#rMenu").hide();
            // $("#rMenu").css({"visibility": "hidden"});
            go.ec.hideRMenu()
        }
    }

    //隐藏右键菜单
    hideRMenu() {
        let _this = this;
        $("#rMenu").remove();
        $("body").unbind("mousedown", _this.onBodyMouseDown);
    }

    /**
     * 显示节点属性
     * @param treeNode
     */
    showNodeAttr(treeNode) {
        let _this = this;
        let data = _this.getNodeData(treeNode.gIndex);
        if (!treeNode.customProp.isAttrPanelOpen) {
            treeNode.customProp.entityPanel = new entityProvider(_this.viewer).showAttrPanel(treeNode, data);
        }
        _this.hideRMenu();
        _this.ztree.selectNode(treeNode)
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