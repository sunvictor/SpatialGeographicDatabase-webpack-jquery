import $ from "jquery";
import drawPoint from "./edit/GlobeUninterruptedBillboardDrawer";
import {go} from "../../globalObject";

export default class drawShape {
    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.clickEvents();
    }
    clickEvents(){
        let _this = this;
        $("#drawBillboard").on('click',function () {
            go.plot.trackUninterruptedBillboard(function (positions) {
                for (let i = 0; i < positions.length; i++) {
                    let objId = (new Date()).getTime() + i;
                    go.plot.billboardDrawer.showBillboard(objId, positions[i]);
                }
            }, function (positions) {
                console.log(positions)
            })
        })
        $("#drawPolyline").on('click',function () {
            go.plot.trackPolyline(function (positions, lonlats, params) {
                let objId = (new Date()).getTime();
                go.plot.polylineDrawer.showPolyline(objId, positions, params);
            }, function (positions) {
                console.log(positions)
            })
        })
    }
}