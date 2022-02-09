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
        _this.ctrArr.push(_this.billboardDrawer);
    }

    clear() {
        let _this = this;
        for (let i = 0; i < _this.ctrArr.length; i++) {
            try {
                let ctr = _this.ctrArr[i];
                if (ctr.clear) {
                    ctr.clear();
                }
            } catch (err) {
                console.log("发生未知出错：GlobeTracker.clear");
            }
        }
    }

    clearOthers(nowPlot) {
        let _this = this;
        for (let i = 0; i < _this.ctrArr.length; i++) {
            try {
                let ctr = _this.ctrArr[i];
                if (ctr.plotType == nowPlot) {
                    continue;
                }
                ctr.viewModel.enabled = false;
            } catch (err) {
                console.log("发生未知出错：GlobeTracker.clearOthers");
            }
        }
    }

    trackUninterruptedBillboard(okCallback, cancelCallback) {
        let _this = this;
        _this.clear();
        if (_this.billboardDrawer == null) {
            _this.billboardDrawer = new billboardGraphics(_this.viewer);
            _this.ctrArr.push(_this.billboardDrawer);
        }
        _this.clearOthers(_this.billboardDrawer.plotType)
        _this.billboardDrawer.start(okCallback, cancelCallback);
    }

    trackPolyline(okHandler, cancelHandler) {
        let _this = this;
        _this.clear();
        if (_this.polylineDrawer == null) {
            _this.polylineDrawer = new polylineGraphics(_this.viewer);
            _this.ctrArr.push(_this.polylineDrawer);
        }
        _this.clearOthers(_this.polylineDrawer.plotType)
        _this.polylineDrawer.start(okHandler, cancelHandler);
    }
}