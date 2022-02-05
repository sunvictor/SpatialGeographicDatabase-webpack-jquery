import {bindBtnImg} from "../html/bindBtnImg";
import LayerControl from "./layerControl";
import LayerMap from "./layerMap"
import imageryProvider from "@/js/cesium/imageryProvider";
let _viewer;
export const go = {}; // 封装所有的类对象

export function globals(viewer) {
    _viewer = viewer;
    createObjs(viewer);
}

/**
 * 创建类对象
 * @param viewer
 */
function createObjs(viewer) {
    go.bbi = new bindBtnImg(viewer)
    go.lc = new LayerControl(viewer)
    go.lm = new LayerMap(viewer)
    go.ip = new imageryProvider(viewer);
}

export function getViewer() {
    return new Promise((resolve, reject) => {
        if (typeof _viewer != "undefined" && _viewer) {
            resolve(_viewer)
        } else {
            reject(_viewer)
        }
    })
}

/**
 * 传入值获取数组下标
 * @param val
 * @returns {number}
 */
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

/**
 * 在数组中移除相同值的数据
 * @param val
 */
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

/**
 * 通过下标移除值
 * @param index
 */
Array.prototype.removeByIndex = function (index) {
    if (index > -1) {
        this.splice(index, 1);
    }
};