import gykjPanel from "@/js/plugins/panel";
import {go} from "@/js/cesium/globalObject";
import pm from "@/js/plugins/publicMethod";
import cocoMessage from '@/js/plugins/coco-message'

let _btnName = "数据源"
let _btnIdName = "dataSource"
export default class DataSourceControl {
    viewModel = {
        enabled: false
    };

    constructor(viewer) {
        this.viewer = viewer;
        this.init();
        this.bindModel();
    }

    init() {
        let _this = this;
        let html = `<div>
                    <table>
                    <tr>
                        <td>数据类型</td>
                        <td><select id="dataSourceType">
                        <option value="kml" selected>KML/KMZ</option>
                        <option value="geojson">GEOJSON</option>
                        </select></td>
                    </tr>
                    <tr>
                        <td><span>名称</span></td>
                        <td><input type="text" id="dataSourceName"></td>
                    </tr>
                    <tr>
                        <td><span>数据源地址</span></td>
                        <td><input type="text" id="dataSourceUrl"></td>
                    </tr>
                    <tr>
                        <td><span>水面</span><input id="dataSourceWater" type="checkbox"></td>
                    </tr>
                    </table> 
                    <button id="addDataSourceBtn">确定</button>
                    </div>`
        _this.dataSourcePanel = new gykjPanel({
            title: "数据源",
            show: false,
            width: 500,
            height: 250,
            left: 900,
            content: html,
            closeType: "hide",
            callback: {
                closePanel: closeLayerPanel
            }
        })

        function closeLayerPanel() {
            _this.viewModel.enabled = false
        }

        _this.addPanelEvents();
    }

    add(options) {
        let _this = this;
        if (!options.url) {
            cocoMessage.error("请输入数据源地址")
            return;
        }
        if (!options.type) {
            cocoMessage.error("请选择数据源类型")
            return;
        }
        let op = {
            camera: _this.viewer.scene.camera,
            canvas: _this.viewer.scene.canvas,
            clampToGround: true //开启贴地
        };
        pm.setOptions(op, options)
        let data;
        if (options.type == "kml") {
            if (options.isWater) {
                let water = go.water.start(op.url, true);
                return;
            } else {
                data = Cesium.KmlDataSource.load(op.url, op);
            }
        }
        if (options.type == "geojson") {
            data = Cesium.GeoJsonDataSource.load(op.url, op);
        }
        if (!data) {
            return;
        }
        _this.viewer.dataSources.add(data).then(function (dataSource) {
            console.log(dataSource)
            let newNode = {
                name: op.name ? op.name : "未命名数据源",
                checked: dataSource.show
            }
            let node = go.ec.addNode(-1, newNode, dataSource)
        });
    }

    addPanelEvents() {
        let _this = this;
        $("#addDataSourceBtn").off('click').on('click', function () {
            let name = $("#dataSourceName").val();
            let url = $("#dataSourceUrl").val();
            let type = $('#dataSourceType option:selected').val();
            let isWater = $("#dataSourceWater").prop("checked");
            _this.add({
                name: name,
                url: url,
                type: type,
                isWater: isWater
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
                _this.dataSourcePanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}