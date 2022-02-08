import pointGraphics from "./pointGraphics";
import polylineGraphics from "./polylineGraphics";


export default class plotGlobeTracker {
    viewer = null;
    ctrArr = [];
    pointDrawer = null;
    polylineDrawer = null;
    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.pointDrawer = new pointGraphics(viewer)
    }

    trackUninterruptedPoint(okCallback,cancelCallback){
        let _this = this;
        // _this.clear();
        if (_this.pointDrawer == null) {
            _this.pointDrawer = new pointGraphics(_this.viewer);
            _this.ctrArr.push(_this.pointDrawer);
        }
        _this.pointDrawer.start(okCallback,cancelCallback);
    }
    trackPolyline(okHandler, cancelHandler) {
        var _this = this;
        // _this.clear();
        if (_this.polylineDrawer == null) {
            _this.polylineDrawer = new polylineGraphics(_this.viewer);
            _this.ctrArr.push(_this.polylineDrawer);
        }
        _this.polylineDrawer.start(okHandler, cancelHandler);
    }
}