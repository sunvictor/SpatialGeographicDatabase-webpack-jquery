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
            case "图层管理":
                imgUrl = enabled ? "./img/icon/layerManageSelected.png" : "./img/icon/layerManage.png"
                break;
            default:
                break;
        }
        $("#" + btnIdName).data("enabled",enabled);
        $("#" + btnIdName).find("img")[0].src = imgUrl;
    }
}