import {go} from "../../globalObject";

let _btnName = "点";
let _btnIdName = "drawPoint";
export default class pointGraphics{
    viewModel = {
        enabled: false
    }
    pointDrawer = null;
    plotType = "point";
    layerId = "globeDrawerDemoLayer"
    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
    }



}