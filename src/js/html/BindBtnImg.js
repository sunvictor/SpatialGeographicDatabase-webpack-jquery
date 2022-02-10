// const $ = require("jQuery");
import $ from "jquery";

export function bindBtnImg() {
    this.init.apply(this, arguments);
}

bindBtnImg.prototype = {
    viewer: null,
    init(viewer) {
        let _this = this;
        _this.viewer = viewer;
    },
    bindImg(btnName, btnIdName, enabled) {
        let imgUrl = null;
        switch (btnName) {
            case "位置测量":
                imgUrl = enabled ? "./img/icon/measurePointSelected.png" : "./img/icon/measurePoint.png"
                break;
            case "距离测量":
                imgUrl = enabled ? "./img/icon/measureDistanceSelected.png" : "./img/icon/measureDistance.png"
                break;
            case "面积测量":
                imgUrl = enabled ? "./img/icon/measureAreaSelected.png" : "./img/icon/measureArea.png"
                break;
            case "高度测量":
                imgUrl = enabled ? "./img/icon/measureHeightSelected.png" : "./img/icon/measureHeight.png"
                break;
            case "图层管理":
                imgUrl = enabled ? "./img/icon/layerManageSelected.png" : "./img/icon/layerManage.png"
                break;
            case "图形管理":
                imgUrl = enabled ? "./img/icon/layerManageSelected.png" : "./img/icon/layerManage.png"
                break;
            case "点":
                imgUrl = enabled ? "./img/icon/drawBillboardSelected.png" : "./img/icon/drawBillboard.png"
                break;
            case "折线":
                imgUrl = enabled ? "./img/icon/drawPolylineSelected.png" : "./img/icon/drawPolyline.png"
                break;
            default:
                break;
        }
        $("#" + btnIdName).data("enabled", enabled);
        $("#" + btnIdName).find("img")[0].src = imgUrl;
    }
}