import billboardGraphics from "./BillboardGraphics";
import polylineGraphics from "./PolylineGraphics";
import $ from 'jquery'
import pointGraphics from "@/js/cesium/entity/plot/PointGraphics";
import polygonGraphics from "@/js/cesium/entity/plot/PolygonGraphics";
import rectangleGraphics from "@/js/cesium/entity/plot/RectangleGraphics";
import circleGraphics from "@/js/cesium/entity/plot/CircleGraphics";
import bufferLineGraphics from "@/js/cesium/entity/plot/BufferLineGraphics";
import attackArrowGraphics from "@/js/cesium/entity/plot/AttackArrowGraphics";
import straightArrowGraphics from "@/js/cesium/entity/plot/StraightArrowGraphics";

export default class plotGlobeTracker {
    viewer = null;
    ctrArr = [];
    billboardDrawer = null;
    singleBillboardDrawer = null;
    polylineDrawer = null;
    polygonDrawer = null;
    rectangleDrawer = null;
    circleDrawer = null;
    bufferLineDrawer = null;
    attackArrowDrawer = null;
    straightArrowDrawer = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.billboardDrawer = new billboardGraphics(viewer)
        _this.singleBillboardDrawer = new pointGraphics(viewer)
        _this.polylineDrawer = new polylineGraphics(viewer)
        _this.polygonDrawer = new polygonGraphics(viewer)
        _this.rectangleDrawer = new rectangleGraphics(viewer)
        _this.circleDrawer = new circleGraphics(viewer)
        _this.bufferLineDrawer = new bufferLineGraphics(viewer)
        _this.attackArrowDrawer = new attackArrowGraphics(viewer)
        _this.straightArrowDrawer = new straightArrowGraphics(viewer)
        _this.ctrArr.push(_this.billboardDrawer);
        _this.ctrArr.push(_this.singleBillboardDrawer);
        _this.ctrArr.push(_this.polylineDrawer);
        _this.ctrArr.push(_this.polygonDrawer);
        _this.ctrArr.push(_this.rectangleDrawer);
        _this.ctrArr.push(_this.circleDrawer);
        _this.ctrArr.push(_this.bufferLineDrawer);
        _this.ctrArr.push(_this.attackArrowDrawer);
        _this.ctrArr.push(_this.straightArrowDrawer);
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
    trackCircle(okHandler, cancelHandler) {
        let _this = this;
        _this.clear();
        if (_this.circleDrawer == null) {
            _this.circleDrawer = new circleGraphics(_this.viewer);
            _this.ctrArr.push(_this.circleDrawer);
        }
        _this.clearOthers(_this.circleDrawer.plotType)
        _this.circleDrawer.start(okHandler, cancelHandler);
    }
    trackBufferLine(okHandler, cancelHandler) {
        let _this = this;
        _this.clear();
        if (_this.bufferLineDrawer == null) {
            _this.bufferLineDrawer = new bufferLineGraphics(_this.viewer);
            _this.ctrArr.push(_this.bufferLineDrawer);
        }
        _this.clearOthers(_this.bufferLineDrawer.plotType)
        _this.bufferLineDrawer.start(okHandler, cancelHandler);
    }
    trackAttackArrow(okHandler, cancelHandler) {
        let _this = this;
        _this.clear();
        if (_this.attackArrowDrawer == null) {
            _this.attackArrowDrawer = new attackArrowGraphics(_this.viewer);
            _this.ctrArr.push(_this.attackArrowDrawer);
        }
        _this.clearOthers(_this.attackArrowDrawer.plotType)
        _this.attackArrowDrawer.start(okHandler, cancelHandler);
    }
    trackStraightArrow(okHandler, cancelHandler) {
        let _this = this;
        _this.clear();
        if (_this.straightArrowDrawer == null) {
            _this.straightArrowDrawer = new straightArrowGraphics(_this.viewer);
            _this.ctrArr.push(_this.straightArrowDrawer);
        }
        _this.clearOthers(_this.straightArrowDrawer.plotType)
        _this.straightArrowDrawer.start(okHandler, cancelHandler);
    }
}