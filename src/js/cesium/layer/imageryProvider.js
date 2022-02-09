import gykjPanel from "@/js/plugins/panel";
import $ from 'jquery'
import {honeySwitch} from "@/js/plugins/honeySwitch";
import {go} from "@/js/cesium/globalObject";

export default class imageryProvider {
    attrDict = ["show", "alpha", "brightness", "contrast", "hue", "saturation", "gamma", "splitDirection"] // 图层属性字典
    attrModel = { // @Unused
        "show": null,
        "alpha": null,
        "brightness": null,
        "contrast": null,
        "hue": null,
        "saturation": null,
        "gamma": null,
        "colorToAlphaThreshold": null,
        "splitDirection": null,
        "rectangle": null,
    }

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
    }

    setViewModel(map) {
        // 定义一个额外的参数，是为了在imageryProvider.js中绑定属性使用
        // 因为是直接监听的map，所以需要定义一个单独的参数，否则就会重复调用导致堆溢出，所以其实不应该监听map
        // 通常是监听一个自定义的viewModel对象，通过改变viewModel里的值，在回调函数中再去改变map的值
        // 监听map是因为会在其他地方调用例如 map.show = true 如果监听viewModel的话，其他地方就需要调用 viewModel.show = true 才能实现
        // 但这也不合理，所以就直接监听map了
        map.bindModelSplitDirections = map.splitDirections;
        // map.splitDirections = ["ImagerySplitDirection.NONE","ImagerySplitDirection.LEFT","ImagerySplitDirection.RIGHT"]
        map.splitDirections = Cesium.knockout.observableArray([{ // 设置下拉框中的选项和值
            'Value': Cesium.ImagerySplitDirection.NONE,
            'Key': 'ImagerySplitDirection.NONE'
        }, {
            'Value': Cesium.ImagerySplitDirection.LEFT,
            'Key': 'ImagerySplitDirection.LEFT'
        }, {
            'Value': Cesium.ImagerySplitDirection.RIGHT,
            'Key': 'ImagerySplitDirection.RIGHT'
        }]);
        // 默认选中的值
        map.selectedSelectedOptions = Cesium.knockout.observableArray([map.splitDirection])
    }

    /**
     * 显示图层属性面板
     * @param treeNode 节点数据
     * @param imageryLayer 图层数据
     */
    showAttrPanel(treeNode, imageryLayer) {
        let _this = this;
        let div = document.createElement('div');
        div.setAttribute("id", "imagery_attr_" + treeNode.gid)
        let html = "<table>";
        for (let i = 0; i < _this.attrDict.length; i++) {
            const element = _this.attrDict[i]
            if (element == "show") {
                let className = imageryLayer[element] ? "switch-on" : "switch-off"
                html += `<tr><td>${element}</td><td><span data-bind="value: show" class="${className}" id="imagery_attr_${treeNode.gid}_show"></span></td></tr>`
            } else if (element == "alpha") {
                html += `<tr><td>${element}</td><td>
                    <input type="range" min="0.0" max="1.0" step="0.05" data-bind="value: alpha, valueUpdate: 'input'">
                    <input type="text" size="5" data-bind="value: alpha">
                    </td></tr>`
            } else if (element == "splitDirection") {
                html += `<tr><td>${element}</td><td>
                    <select data-bind="options:splitDirections,optionsText:'Key',optionsValue:'Value',selectedOptions:selectedSelectedOptions"></select>
                       </td></tr>`
            } else {
                html += `<tr><td>${element}</td><td>
                    <input type="range" min="0.0" max="10.0" step="0.1" data-bind="value: ${element}, valueUpdate: 'input'">
                    <input type="text" size="5" data-bind="value: ${element}">
                    </td></tr>`
            }
            _this.attrModel[element] = imageryLayer[element];
        }
        html += `</table>`
        $(div).append(html)
        _this.imageryLayerAttrPanel = new gykjPanel({
            title: imageryLayer.name,
            show: true,
            width: 400,
            height: 470,
            left: 440,
            content: div,
            callback: {
                closePanel: function () {
                    imageryLayer.customProp.isAttrPanelOpen = false;
                }
            }
        })

        honeySwitch.init($("#imagery_attr_" + treeNode.gid + "_show")) // 重新初始化开关按钮
        let manualSwitch = false;
        switchEvent("#imagery_attr_" + treeNode.gid + "_show", function () { // 切换开关按钮的回调函数
            // 修改开关状态，同步更改图层状态和ztree的checked状态
            manualSwitch = true;
            imageryLayer.show = true;
            go.lc.checkNode(treeNode, true)
        }, function () {
            manualSwitch = true;
            imageryLayer.show = false;
            go.lc.checkNode(treeNode, false)
        });

        Cesium.knockout.track(imageryLayer);
        let toolbar = document.getElementById("imagery_attr_" + treeNode.gid);
        Cesium.knockout.applyBindings(imageryLayer, toolbar);
        Cesium.knockout.getObservable(imageryLayer, "show")
            .subscribe(function (newValue) {
                // 监听到imageryLayer.show变化时 同步更改开关按钮的状态
                // 如果是在下面的switchEvent中修改开关状态时，也会修改imageryLayer.show，这里也会执行，再一次的修改开关状态，不过没什么问题
                if (manualSwitch) {
                    manualSwitch = false;
                    return;
                }
                newValue ? honeySwitch.showOn("#imagery_attr_" + treeNode.gid + "_show") : honeySwitch.showOff("#imagery_attr_" + treeNode.gid + "_show")
                // 同步修改ztree的checked状态
                go.lc.checkNode(treeNode, newValue)
            });
        Cesium.knockout.getObservable(imageryLayer, "selectedSelectedOptions")
            .subscribe(function (newValue) {
                // 监听的是在setViewModel中设置的`选中的值`-selectedSelectedOptions
                // imageryLayer.splitDirection的值例如： Cesium.ImagerySplitDirection.RIGHT
                imageryLayer.splitDirection = newValue[0]
            });
    }
}