import gykjPanel from "../../plugins/panel";
import {go} from "../globalObject";
import imageryProvider from "@/js/cesium/layer/ImageryProvider";
import cocoMessage from "@/js/plugins/coco-message";
import pm from "@/js/plugins/publicMethod";
// import ztree from "@ztree/ztree_v3"

let _btnName = "地形管理";
let _btnIdName = "terrainManage";
let _tc_terrains_id = "tc_terrains";
export default class TerrainControl {
    newCount = 1;
    defaultTerrainProvider = null;
    currentTerrainProvider = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.viewModel = {};
        _this.init();
        _this.bindModel();
        _this.defaultTerrainProvider = _this.viewer.terrainProvider;
        _this.defaultTerrainProvider.name = "默认无地形";
        // _this.worldTerrainProvider = Cesium.createWorldTerrain(); // 这里创建的对象数据不完整
        // console.log(_this.worldTerrainProvider)
        // _this.worldTerrainProvider.name = "全球地形（测试）"
        _this.addToPanel(_this.defaultTerrainProvider)
        // _this.addToPanel(_this.worldTerrainProvider)
    }

    init() {
        let _this = this;
        let html = _this.createPanelHtml();
        _this.terrainPanel = new gykjPanel({
            title: "地形管理",
            show: true,
            width: 600,
            height: 350,
            left: 430,
            content: html,
            closeType: "hide",
            callback: {
                closePanel: closeTerrainPanel
            }
        })
        _this.addTerrainEvents();
        _this.terrainPanel.show = false;
        _this.viewModel['enabled'] = false;

        function closeTerrainPanel() {
            _this.viewModel.enabled = false
        }
    }

    add(options) {
        let terrain = this.addTerrain(options);
        this.addToPanel(terrain);
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
        // }
        else {
            terrain = _this.addTerrainByOriginFunc(options);
        }
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
        if (typeof options.show == "undefined" || options.show) {
            viewer.terrainProvider = terrain;
        }
        pm.setOptions(terrain, options.options);
        return terrain;
    }

    addToPanel(terrain) {
        let _this = this;
        let terrainsDom = $("#" + _tc_terrains_id);
        let terrainBtn = $("<button name='terrain'>" + terrain.name + "</button>");
        if (terrain.customProp) {
            terrainBtn.attr('title', terrain.customProp.url);
        }
        terrainBtn.data("terrain", terrain)
        terrainsDom.append(terrainBtn)
        $("[name='terrain']").off('click').on('click', function () {
            let terrainProvider = $(this).data('terrain');
            _this.switchTerrain(terrainProvider)
        })
    }

    switchTerrain(terrain) {
        let _this = this;
        _this.viewer.terrainProvider = terrain
    }

    createPanelHtml() {
        let html = `<div>
                        <div>
                            <div>
                            <table id="terrainTable">
                                <tr><td><span>名称</span></td><td><input name="terrain_name" type="text"></td></tr>
                                <tr><td>服务地址</td><td><input name="terrain_url" type="text"></td></tr>
                                <tr><td>服务类型</td><td><input type="checkbox" checked name="CesiumTerrainProvider" onclick="return false;"><label>标准</label></td></tr>
                                <tr><td>法向量</td><td><input name="terrain_requestVertexNormals" type="checkbox" checked></td></tr>
                                <tr><td>水面</td><td><input name="terrain_requestWaterMask" type="checkbox" checked></td></tr>
                                <tr><td>是否加载</td><td><input name="isLoad" type="checkbox" checked></td></tr>
                            </table>
                            <div><button id="addTerrainBtn">确定</button></div>
                            </div>
                        </div>
                        <div id="${_tc_terrains_id}"></div>
                    </div>`;
        return html;
    }

    addTerrainEvents() {
        let _this = this;
        $("#addTerrainBtn").off('click').on('click', function () {
            let terrainName = $("#terrainTable [name='terrain_name']").val();
            let terrainUrl = $("#terrainTable [name='terrain_url']").val();
            let terrainType = $("#terrainTable [name='CesiumTerrainProvider']").prop("checked");
            let terrainRequestVertexNormals = $("#terrainTable [name='terrain_requestVertexNormals']").prop("checked");
            let terrainRequestWaterMask = $("#terrainTable [name='terrain_requestWaterMask']").prop("checked");
            let isLoad = $("#terrainTable [name='isLoad']").prop("checked");
            if (!terrainName === "" || terrainUrl === "") {
                cocoMessage.error("请输入参数");
                return;
            }
            _this.add({
                name: terrainName,
                url: terrainUrl,
                type: terrainType ? "origin" : "",
                show: isLoad,
                terrainProp: {
                    requestWaterMask: terrainRequestVertexNormals,
                    requestVertexNormals: terrainRequestWaterMask,
                }
            })
        })

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