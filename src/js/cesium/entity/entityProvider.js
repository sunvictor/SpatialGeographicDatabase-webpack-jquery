import gykjPanel from "@/js/plugins/panel";
import $ from 'jquery'
import {honeySwitch} from "@/js/plugins/honeySwitch";
import {go} from "@/js/cesium/globalObject";

export default class entityProvider {
    attrDict = ["id", "name", "show", "description", "position", "orientation"] // 图层属性字典
    attrZhDict = {
        "id": "ID",
        "name": "名称",
        "show": "显示",
        "description": "描述",
        "position": "位置",
        "orientation": "方向",
    }
    entityCollection = ["billboard", "box", "corridor", "cylinder", "ellipse", "ellipsoid", "label", "model", "tileset", "path", "plane", "point", "polygon", "polyline", "properties", "polylineVolume", "rectangle", "wall"]

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
    }

    /**
     * 显示图层属性面板
     * @param treeNode 节点数据
     * @param entity 图形数据
     */
    showAttrPanel(treeNode, entity) {
        let _this = this;
        let div = _this.resoleAttr(treeNode, entity)
        _this.entityAttrPanel = new gykjPanel({
            title: entity.name,
            show: true,
            width: 400,
            height: 470,
            left: 640,
            content: div,
            callback: {
                hidePanel: function () {
                    entity.customProp.isAttrPanelOpen = false;
                    _this.entityAttrPanel.destroy();
                }
            }
        })
        _this.clickEvents(treeNode, entity);
        honeySwitch.init($("#entity_attr_" + treeNode.gid + "_show")) // 重新初始化开关按钮
        let manualSwitch = false;
        switchEvent("#entity_attr_" + treeNode.gid + "_show", function () { // 切换开关按钮的回调函数
            // 修改开关状态，同步更改图层状态和ztree的checked状态
            manualSwitch = true;
            entity.show = true;
            go.ec.checkNode(treeNode, true)
        }, function () {
            manualSwitch = true;
            entity.show = false;
            go.ec.checkNode(treeNode, false)
        });
        $("#entity_attr_" + treeNode.gid + "_show").css({
            zoom: '70%'
        })
        $("#entity_attr_" + treeNode.gid + "_show span").css({
            zoom: '93%'
        })

        Cesium.knockout.track(entity);
        let toolbar = document.getElementById("entity_attr_" + treeNode.gid);
        Cesium.knockout.applyBindings(entity, toolbar);
        Cesium.knockout.getObservable(entity, "_show")
            .subscribe(function (newValue) {
                // entity.show变化时 同步更改开关按钮的状态
                // 如果是在下面的switchEvent中修改开关状态时，entity.show，这里也会执行，再一次的修改开关状态，不过没什么问题
                if (manualSwitch) {
                    manualSwitch = false;
                    return;
                }
                newValue ? honeySwitch.showOn("#entity_attr_" + treeNode.gid + "_show") : honeySwitch.showOff("#entity_attr_" + treeNode.gid + "_show")
                // 同步修改ztree的checked状态
                go.ec.checkNode(treeNode, newValue)
            });

    }

    resoleAttr(treeNode, entity) {
        let _this = this;
        let div = document.createElement('div');
        div.setAttribute("id", "entity_attr_" + treeNode.gid)
        let html = "<table>";
        for (let i = 0; i < _this.attrDict.length; i++) {
            const element = _this.attrDict[i]
            if (element == "show") {
                let className = entity[element] ? "switch-on" : "switch-off"
                html += `<tr><td>${element}</td><td><span data-bind="value: show" class="${className}" id="entity_attr_${treeNode.gid}_show"></span></td></tr>`
            }
        }
        for (let i = 0; i < _this.entityCollection.length; i++) {
            const element = _this.entityCollection[i];
            if (entity[element]) {
                html += `<tr><td><span>${element}</span></td><td><button data-type="${element}" name="entityType">属性</button></td></tr>`
            }
        }
        html += `</table>`
        $(div).append(html)
        return div;

        // go.plot.
    }

    clickEvents(treeNode, entity) {
        $("button[name='entityType']").off('click').on("click", function () {
            let entityType = $(this).data("type")
            // alert(entityType)
            go.plot[entityType + "Drawer"].showDetailPanel(treeNode, entity);
        })
    }
}