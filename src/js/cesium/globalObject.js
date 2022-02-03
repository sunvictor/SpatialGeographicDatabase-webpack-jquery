import {bindBtnImg} from "../html/bindBtnImg";
import LayerControl from "./layerControl";
import LayerMap from "./layerMap"
let _viewer;
export const go = {};

export function globals(viewer) {
    _viewer = viewer;
    createObjs(viewer);
}

function createObjs(viewer) {
    go.bbi = new bindBtnImg(viewer)
    go.lc = new LayerControl(viewer)
    go.lm = new LayerMap(viewer)
}

export function getViewer() {
    return new Promise((resolve, reject) => {
        if (typeof _viewer != "undefined" && _viewer) {
            console.log(1)
            resolve(_viewer)
        } else {
            console.log(2)
            reject(_viewer)
        }
    })
}


Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};
Array.prototype.removeByIndex = function (index) {
    if (index > -1) {
        this.splice(index, 1);
    }
};