import {bindBtnImg} from "../html/bindBtnImg";
import LayerControl from "./layerControl"
let _viewer;
export const go = {};

export function globals(viewer) {
    _viewer = viewer;
    createObjs(viewer);
}

function createObjs(viewer) {
    go.bbi = new bindBtnImg(viewer)
    go.lc = new LayerControl(viewer)
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