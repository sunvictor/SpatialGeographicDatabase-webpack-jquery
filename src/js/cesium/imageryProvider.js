import gykjPanel from "@/js/plugins/panel";
import $ from 'jquery'
import {honeySwitch} from "@/js/plugins/honeySwitch";
import {go} from "@/js/cesium/globalObject";

export default class imageryProvider {
    attrDict = ["show", "alpha", "brightness", "contrast", "hue", "saturation", "gamma", "colorToAlphaThreshold", "splitDirection", "rectangle"]
    attrModel = {
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

    showAttrPanel(treeNode, imageryLayer) {
        let _this = this;
        console.log(treeNode)
        console.log(imageryLayer)
        let div = document.createElement('div');
        div.setAttribute("id", "imagery_attr_" + treeNode.gid)
        let html = "<table>";
        for (let i = 0; i < _this.attrDict.length; i++) {
            const element = _this.attrDict[i]
            if (element == "show") {
                let className = imageryLayer[element] ? "switch-on" : "switch-off"
                html += `<tr><td>${element}</td><td><span data-bind="value: show" class="${className}" id="show"></span></td></tr>`
            } else {
                html += `<tr><td>${element}</td><td>${imageryLayer[element]}</td></tr>`
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
            left: 150,
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
                console.log("show:" + newValue)
                newValue ? honeySwitch.showOn("#show") : honeySwitch.showOff("#show")
                go.lc.checkNode(treeNode, newValue)
            });
        honeySwitch.init()
        switchEvent("#show", function () {
            imageryLayer.show = true;
            go.lc.checkNode(treeNode, true)
        }, function () {
            imageryLayer.show = false;
            go.lc.checkNode(treeNode, false)
        });
        $("#show").css({
            zoom: '70%'
        })
        $("#show span").css({
            zoom: '93%'
        })
    }
}