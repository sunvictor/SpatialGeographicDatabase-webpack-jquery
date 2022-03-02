import billboardGraphics from "./BillboardGraphics";
import polylineGraphics from "./PolylineGraphics";
import $ from 'jquery'
import pointGraphics from "@/js/cesium/entity/plot/PointGraphics";
import polygonGraphics from "@/js/cesium/entity/plot/PolygonGraphics";
import rectangleGraphics from "@/js/cesium/entity/plot/RectangleGraphics";

export default class plotGlobeTracker {
    viewer = null;
    ctrArr = [];
    billboardDrawer = null;
    singleBillboardDrawer = null;
    polylineDrawer = null;
    polygonDrawer = null;
    rectangleDrawer = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.billboardDrawer = new billboardGraphics(viewer)
        _this.singleBillboardDrawer = new pointGraphics(viewer)
        _this.ctrArr.push(_this.billboardDrawer);
        _this.ctrArr.push(_this.singleBillboardDrawer);
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
    singleBillboard(okCallback, cancelCallback) {
        let _this = this;
        _this.clear();
        if (_this.singleBillboardDrawer == null) {
            _this.singleBillboardDrawer = new pointGraphics(_this.viewer);
            _this.ctrArr.push(_this.singleBillboardDrawer);
        }
        _this.clearOthers(_this.singleBillboardDrawer.plotType)
        _this.singleBillboardDrawer.start(okCallback, cancelCallback);
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
    trackPolygon(okHandler, cancelHandler) {
        let _this = this;
        _this.clear();
        if (_this.polygonDrawer == null) {
            _this.polygonDrawer = new polygonGraphics(_this.viewer);
            _this.ctrArr.push(_this.polygonDrawer);
        }
        _this.clearOthers(_this.polygonDrawer.plotType)
        _this.polygonDrawer.start(okHandler, cancelHandler);
    }
    trackRectangle(okHandler, cancelHandler) {
        let _this = this;
        _this.clear();
        if (_this.rectangleDrawer == null) {
            _this.rectangleDrawer = new rectangleGraphics(_this.viewer);
            _this.ctrArr.push(_this.rectangleDrawer);
        }
        _this.clearOthers(_this.rectangleDrawer.plotType)
        _this.rectangleDrawer.start(okHandler, cancelHandler);
    }
}