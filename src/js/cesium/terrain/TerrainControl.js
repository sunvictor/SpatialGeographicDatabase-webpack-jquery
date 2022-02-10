import gykjPanel from "../../plugins/panel";
import {go} from "../GlobalObject";
import imageryProvider from "@/js/cesium/layer/imageryProvider";
import cocoMessage from "@/js/plugins/coco-message";
import pm from "@/js/plugins/publicMethod";
// import ztree from "@ztree/ztree_v3"

let _btnName = "地形管理";
let _btnIdName = "terrainManage";
export default class TerrainControl {
    newCount = 1;
    defaultTerrainProvider = null;
    currentTerrainProvider = null;
    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.viewModel = {};
        _this.defaultTerrainProvider = _this.viewer.terrainProvider;
        _this.init();
        // _this.bindModel();
    }

    init() {
        let _this = this;
        let html = _this.createPanelHtml();
        _this.terrainPanel = new gykjPanel({
            title: "地形管理",
            show: true,
            width: 600,
            height: 350,
            content: html,
            callback: {
                closePanel: closeTerrainPanel
            }
        })
        _this.terrainPanel.show = false;
        _this.viewModel['enabled'] = false;

        function closeTerrainPanel() {
            _this.viewModel.enabled = false
        }
    }

    add(options) {
        let terrain = this.addTerrain(options);
        if (typeof options.show == "undefined") {
            terrain.show = true;
        } else {
            terrain.show = options.show;
        }
        let newNode = {
            name: terrain.name,
            checked: terrain.show
            // data: JSON.stringify(map)
        }
        go.lc.addNode(-1, newNode, terrain)
    }

    addTerrain(options) {
        let _this = this;
        if (!options.name) {
            cocoMessage.error("请输入图层名称");
            return;
        }
        if (!options.url) {
            cocoMessage.error("请输入图层地址");
            return;
        }
        let terrain = null;
        if (options.type == "origin") {
            terrain = _this.addTerrainByOriginFunc(options);
        }
        // else if ("cesiumlab") {
        //     terrain = _this.addMapByCesiumLab(options);
        // } else {
        //     materrainp = _this.addMapByOriginFunc(options);
        // }
        terrain.customProp = options;
        terrain.customProp.layerType = "terrain"
        _this.currentTerrainProvider = terrain;
        return terrain;
    }

    addTerrainByOriginFunc(options) {
        let _this = this;
        if (!options.terrainProp) {
            options.terrainProp = {};
        }
        let json = {
            url: options.url,
        }
        pm.setOptions(json, options.terrainProp);
        let terrain = new Cesium.CesiumTerrainProvider(json)
        terrain.name = options.name;
        // 加载地形图
        viewer.terrainProvider = terrain;
        pm.setOptions(terrain, options.options);
        return terrain;
    }

    switchTerrain(terrain, status){
        let _this = this;
        if (!status.checked){
            _this.viewer.terrainProvider = _this.defaultTerrainProvider;
        }else {
            _this.viewer.terrainProvider = _this.currentTerrainProvider;
        }
    }
    createPanelHtml() {
        let html = "";
        document.createElement("div")
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
                _this.terrainPanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}