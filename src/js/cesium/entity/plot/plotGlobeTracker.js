import billboardGraphics from "./billboardGraphics";
import polylineGraphics from "./polylineGraphics";
import $ from 'jquery'

export default class plotGlobeTracker {
    viewer = null;
    ctrArr = [];
    billboardDrawer = null;
    polylineDrawer = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.billboardDrawer = new billboardGraphics(viewer)
    }

    trackUninterruptedBillboard(okCallback, cancelCallback) {
        let _this = this;
        // _this.clear();
        if (_this.billboardDrawer == null) {
            _this.billboardDrawer = new billboardGraphics(_this.viewer);
            _this.ctrArr.push(_this.billboardDrawer);
        }
        _this.billboardDrawer.start(okCallback, cancelCallback);
    }

    trackPolyline(okHandler, cancelHandler) {
        let _this = this;
        // _this.clear();
        if (_this.polylineDrawer == null) {
            _this.polylineDrawer = new polylineGraphics(_this.viewer);
            _this.ctrArr.push(_this.polylineDrawer);
        }
        _this.polylineDrawer.start(okHandler, cancelHandler);
    }
}