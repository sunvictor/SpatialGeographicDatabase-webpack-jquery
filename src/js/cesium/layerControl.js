import gykjPanel from "../plugins/panel";
import {go} from "./globalObject";

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
        _this.layerPanel = new gykjPanel({
            title: "图层管理",
            show: true,
            width: 400,
            height: 470,
            content: `<h1>Hello</h1>`
        })
        _this.layerPanel.show = false;
        _this.viewModel['enabled'] = false;
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