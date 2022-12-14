import gykjPanel from "../../plugins/panel";
import {go} from "../globalObject";
import imageryProvider from "@/js/cesium/layer/ImageryProvider";
// import ztree from "@ztree/ztree_v3"

let _btnName = "图层管理";
let _btnIdName = "layerManage";
export default class LayerControl {
    newCount = 1;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.viewModel = {};
        _this.treeData = [];
        _this.ztree = null;
        _this.init();
        _this.bindModel();
    }

    init() {
        let _this = this;
        // let setting = {
        //     check: {
        //         enable: true,
        //         chkStyle: "checkbox"//显示 checkbox 选择框，默认checkbox可选择值radio
        //     }
        // };
        let setting = {
            view: {
                addHoverDom: _this.addHoverDom,
                removeHoverDom: _this.removeHoverDom,
                // addDiyDom: _this.addDiyDom,
                selectedMulti: false
            },
            async: {
                enabled: true
            },
            check: {
                enable: true,
                autoCheckTrigger: true,
                // chkboxType: {"Y": "s", "N": "s"},
                nocheckInherit: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            edit: {
                enable: true,
                // showRemoveBtn: false
            },
            callback: {
                onRightClick: _this.onRightClick,
                onCheck: _this.controlLayerShow,
                onRename: _this.onRename,
                onRemove: _this.onRemove,
                onClick: _this.onClick,
                onDblClick: _this.onDblClick,
                beforeDrag: _this.beforeDrag,
                beforeDrop: _this.beforeDrop
            }
        };

        _this.treeData.push({
            name: "新建场景",
            open: true,
            checked: true,
            type: 'dir'
        })

        let ul = document.createElement("ul");
        ul.setAttribute("id", "tree")
        ul.classList.add('ztree')

        _this.layerPanel = new gykjPanel({
            title: "图层管理",
            show: true,
            width: 400,
            height: 470,
            content: ul,
            closeType: "hide",
            callback: {
                closePanel: closeLayerPanel
            }
        })
        _this.layerPanel.show = false;
        _this.viewModel['enabled'] = false;

        _this.ztree = $.fn.zTree.init($("#tree"), setting, _this.treeData);

        function closeLayerPanel() {
            _this.viewModel.enabled = false
        }
    }

    /**
     * 生成一个用不重复的ID
     * @param { Number } randomLength
     */
    generateUUid(randomLength = 2) {
        return Number(Math.random().toString().substr(2, randomLength) + Date.now()).toString(16)
    }

    /**
     * 刷新当前节点
     */
    refreshNode() {
        /*根据 treeId 获取 zTree 对象*/
        let zTree = $.fn.zTree.getZTreeObj("tree"),
            type = "refresh",
            silent = false,
            /*获取 zTree 当前被选中的节点数据集合*/
            nodes = zTree.getSelectedNodes();
        /*强行异步加载父节点的子节点。[setting.async.enable = true 时有效]*/
        zTree.reAsyncChildNodes(nodes[0], type, silent);
    }

    beforeDrag(treeId, treeNodes) {

    }

    beforeDrop(treeId, treeNodes, targetNode, moveType, isCopy) {
        if (treeNodes && targetNode.isParent) {
            return false;
        } else {
            return !(targetNode == null || (moveType != "inner" && !targetNode.parentTId)); // 禁止将节点拖拽成为根节点
        }
    }

    onDblClick(event, treeId, treeNode) {
        if (treeNode && treeNode.isParent) {
            return;
        }
        let nodeData = go.lc.getNodeData(treeNode.gIndex);
        nodeData.show = !nodeData.show;
        // 同步修改ztree的checked状态
        go.lc.checkNode(treeNode, nodeData.show)
    }

    onClick(event, treeId, treeNode, clickFlag) {
        console.log(treeNode)
    }

    onRemove(event, treeId, treeNode) {
        if (treeNode && treeNode.isParent) {
            for (let i = 0; i < treeNode.children.length; i++) {
                go.lc.removeLayer(treeNode.children[i])
            }
        } else {
            go.lc.removeLayer(treeNode);
        }
    }

    onRename(event, treeId, treeNode) {
        let layer = go.lc.getNodeData(treeNode.gIndex)
        if (!layer) {
            return;
        }
        layer.name = treeNode.name
    }

    controlLayerShow(event, treeId, treeNode) {
        let chkStatus = treeNode.getCheckStatus()
        let layer = go.lc.getNodeData(treeNode.gIndex)
        if (!layer) {
            return;
        }
        layer.show = chkStatus.checked
    }

    addDiyDom(treeId, treeNode) {
        let aObj = $("#" + treeNode.tId + '_span');
        if (treeNode.editNameFlag || $("#upLayerBtn_" + treeNode.tId).length > 0) return;
        if (treeNode.editNameFlag || $("#lowerLayerBtn_" + treeNode.tId).length > 0) return;
        let upLayerStr = `<span class="button add" id="upLayerBtn_${treeNode.tId}"></span>`
        let lowerLayerStr = `<span class="button edit" id="lowerLayerBtn_${treeNode.tId}"></span>`
        aObj.after(lowerLayerStr)
        aObj.after(upLayerStr)
    }

    /**
     * 添加节点 （页面鼠标悬停节点，点击按钮方式添加）用于配置在setting-addHoverDom，参数会自动传入
     * @param treeId
     * @param treeNode
     */
    addHoverDom(treeId, treeNode) {
        let sObj = $("#" + treeNode.tId + "_span");
        if (treeNode.isParent) {
            return;
        }
        window.a = treeNode
        if (treeNode.getNextNode() == null) {
            lowerLayerBtn();
        } else if (treeNode.getPreNode() == null) {
            upLayerBtn();
        } else {
            upLayerBtn();
            lowerLayerBtn();
        }

        function addBtn() {
            if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
            let addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                + "' title='add node' onfocus='this.blur();'></span>";
            sObj.after(addStr);
            let btn = $("#addBtn_" + treeNode.tId);
            if (btn) btn.bind("click", function () {
                let zTree = $.fn.zTree.getZTreeObj("tree");
                zTree.addNodes(treeNode, {
                    id: (100 + _this.newCount),
                    pId: treeNode.id,
                    name: "new node" + (_this.newCount++)
                });
                return false;
            });
        }

        function upLayerBtn() {
            if (treeNode.editNameFlag || $("#upLayerBtn_" + treeNode.tId).length > 0) return;
            let upLayerStr = `<span class="" id="upLayerBtn_${treeNode.tId}" title="升">升</span>`
            sObj.after(upLayerStr)
            let btn = $("#upLayerBtn_" + treeNode.tId);
            if (btn) btn.bind("click", function () {
                const tree = $.fn.zTree.getZTreeObj("tree")
                let resNode = tree.moveNode(treeNode.getNextNode(), treeNode, 'next')
                $("#upLayerBtn_" + treeNode.tId).unbind().remove();
                go.lc.addHoverDom(treeId, treeNode)
                let layer = go.lc.getNodeData(resNode.gIndex)
                go.lm.raise(layer)
            })
        }

        function lowerLayerBtn() {
            if (treeNode.editNameFlag || $("#lowerLayerBtn_" + treeNode.tId).length > 0) return;
            let lowerLayerStr = `<span class="" id="lowerLayerBtn_${treeNode.tId}" title="降">降</span>`
            sObj.after(lowerLayerStr)
            let btn = $("#lowerLayerBtn_" + treeNode.tId);
            if (btn) btn.bind("click", function () {
                const tree = $.fn.zTree.getZTreeObj("tree")
                let resNode = tree.moveNode(treeNode.getPreNode(), treeNode, 'prev')
                $("#lowerLayerBtn_" + treeNode.tId).unbind().remove();
                go.lc.addHoverDom(treeId, treeNode)
                let layer = go.lc.getNodeData(resNode.gIndex)
                go.lm.lower(layer)
            })
        }
    }

    removeHoverDom(treeId, treeNode) {
        $("#addBtn_" + treeNode.tId).unbind().remove();
        $("#upLayerBtn_" + treeNode.tId).unbind().remove();
        $("#lowerLayerBtn_" + treeNode.tId).unbind().remove();
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

    onRightClick(event, treeId, treeNode) {
        let _this = this;
        if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
            go.lc.showRMenu(treeId, treeNode, "root", event.clientX, event.clientY - 130); // 减去导航栏的高度
        } else if (treeNode && !treeNode.noR) {
            go.lc.showRMenu(treeId, treeNode, "node", event.clientX, event.clientY - 130); // 减去导航栏的高度
        }
    }

    //鼠标按下事件
    onBodyMouseDown(event) {
        if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length > 0)) {
            // $("#rMenu").hide();
            // $("#rMenu").css({"visibility": "hidden"});
            go.lc.hideRMenu()
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
        if (!data.customProp.isAttrPanelOpen) {
            new imageryProvider(_this.viewer).showAttrPanel(treeNode, data);
            // go.ip.showAttrPanel(treeNode, data)
            data.customProp.isAttrPanelOpen = true;
        }
        _this.hideRMenu();
    }

    /**
     * 勾选 或 取消勾选 单个节点 参数含义参建ztree api
     * @param treeNode
     * @param checked
     * @param checkTypeFlag
     * @param callbackFlag
     */
    checkNode(treeNode, checked, checkTypeFlag = true, callbackFlag = false) {
        const tree = $.fn.zTree.getZTreeObj("tree")
        tree.checkNode(treeNode, checked, checkTypeFlag, callbackFlag)
    }

    /**
     * 移除节点
     * @param treeNode
     * @param callbackFlag
     */
    removeNode(treeNode, callbackFlag = false) {
        let _this = this;
        const tree = $.fn.zTree.getZTreeObj("tree")
        tree.removeNode(treeNode, callbackFlag)
        _this.removeLayer(treeNode)
        _this.hideRMenu();
    }

    /**
     * 添加节点
     * @param parentNode {Object} 父节点
     * @param newNode {Object} 新节点的json格式对象，里面的`name`属性值会作为节点名称呈现在页面中
     * @param data {Object} 要添节点的数据
     */
    addNode(parentNode, newNode, data) {
        let _this = this;
        const tree = $.fn.zTree.getZTreeObj("tree")
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

    removeLayer(layer) {
        let _this = this;
        if (typeof layer == "object") { // layer是treeNode对象
            let gIndex = layer.gIndex;
            go.lm.remove(_this.treeData[gIndex])
            // _this.treeData.removeByIndex(gIndex);
            _this.treeData[gIndex] = "hasRemoved"
        } else if (typeof layer == "string") {
            _this.treeData.remove(layer);
        }
    }

    getNodeData(index) {
        let _this = this;
        return _this.treeData[index]
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById('layerManage'); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue) // 切换是否选中图片
                _this.layerPanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}