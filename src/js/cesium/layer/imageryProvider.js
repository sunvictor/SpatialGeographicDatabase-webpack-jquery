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
                    <select data-bind="options: splitDirections, value: bindModelSplitDirections"></select>
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
                hidePanel: function () {
                    imageryLayer.customProp.isAttrPanelOpen = false;
                    _this.imageryLayerAttrPanel.destroy();
                }
            }
        })
        Cesium.knockout.track(imageryLayer);
        let toolbar = document.getElementById("imagery_attr_" + treeNode.gid);
        Cesium.knockout.applyBindings(imageryLayer, toolbar);
        Cesium.knockout.getObservable(imageryLayer, "show")
            .subscribe(function (newValue) {
                // 监听到imageryLayer.show变化时 同步更改开关按钮的状态
                // 如果是在下面的switchEvent中修改开关状态时，也会修改imageryLayer.show，这里也会执行，再一次的修改开关状态，不过没什么问题
                if (manualSwitch){
                    manualSwitch = false;
                    return;
                }
                newValue ? honeySwitch.showOn("#imagery_attr_" + treeNode.gid + "_show") : honeySwitch.showOff("#imagery_attr_" + treeNode.gid + "_show")
                // 同步修改ztree的checked状态
                go.lc.checkNode(treeNode, newValue)
            });
        // Cesium.knockout.getObservable(imageryLayer, "bindModelSplitDirections")
        //     .subscribe(function (newValue) {
        //         // 监听的是在layerMap.js中自定义的参数bindModelSplitDirections
        //         // imageryLayer.splitDirection的值例如： Cesium.ImagerySplitDirection.RIGHT
        //         imageryLayer.splitDirection = eval("Cesium." + newValue)
        //     });
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
        $("#imagery_attr_" + treeNode.gid + "_show").css({
            zoom: '70%'
        })
        $("#imagery_attr_" + treeNode.gid + "_show span").css({
            zoom: '93%'
        })
    }
}