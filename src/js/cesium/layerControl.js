import gykjPanel from "../plugins/panel";
import {go} from "./globalObject";
// import ztree from "@ztree/ztree_v3"

let _btnName = "图层管理";
let _btnIdName = "layerManage";
export default class LayerControl {
    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.viewModel = {};
        _this.init();
        _this.bindModel();
    }

    init() {
        let _this = this;
        // var setting = {
        //     check: {
        //         enable: true,
        //         chkStyle: "checkbox"//显示 checkbox 选择框，默认checkbox可选择值radio
        //     }
        // };
        var setting = {
            view: {
                addHoverDom: addHoverDom,
                removeHoverDom: removeHoverDom,
                selectedMulti: false
            },
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            edit: {
                enable: true
            }
        };
        var newCount = 1;
        function addHoverDom(treeId, treeNode) {
            var sObj = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#addBtn_"+treeNode.tId).length>0) return;
            var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                + "' title='add node' onfocus='this.blur();'></span>";
            sObj.after(addStr);
            var btn = $("#addBtn_"+treeNode.tId);
            if (btn) btn.bind("click", function(){
                var zTree = $.fn.zTree.getZTreeObj("treeDemo");
                zTree.addNodes(treeNode, {id:(100 + newCount), pId:treeNode.id, name:"new node" + (newCount++)});
                return false;
            });
        };
        function removeHoverDom(treeId, treeNode) {
            $("#addBtn_"+treeNode.tId).unbind().remove();
        };
        var zTreeNodes = [
            {
                "name": "北京", "open": true, children: [
                    {"name": "东城区"},
                    {"name": "朝阳区"}
                ]
            },//open:true表示默认展开
            {
                "name": "重庆", "open": true, children: [
                    {
                        "name": "巴南区", children: [
                            {"name": "南泉"},
                            {"name": "界石"}
                        ]
                    },
                    {"name": "渝中区"}
                ]
            }
        ];
        let ul = document.createElement("ul");
        ul.setAttribute("id", "tree")
        ul.classList.add('ztree')

        _this.layerPanel = new gykjPanel({
            title: "图层管理",
            show: true,
            width: 400,
            height: 470,
            content: ul
        })
        _this.layerPanel.show = false;
        _this.viewModel['enabled'] = false;

        var city = $.fn.zTree.init($("#tree"), setting, zTreeNodes);
    }

    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        var toolbar = document.getElementById('layerManage');
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue)
                _this.layerPanel.show = newValue;
            }
        );
    }
}