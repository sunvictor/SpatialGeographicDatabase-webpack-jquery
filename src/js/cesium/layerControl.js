import gykjPanel from "../plugins/panel";
import {go} from "./globalObject";
import 'ztree'
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
        var setting = {
            check: {
                enable: true,
                chkStyle: "checkbox"//显示 checkbox 选择框，默认checkbox可选择值radio
            }
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
        let d = document.createElement("div");
        d.setAttribute("id", "tree")
        d.classList.add('ztree')

        _this.layerPanel = new gykjPanel({
            title: "图层管理",
            show: true,
            width: 400,
            height: 470,
            content: d
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