import $ from "jquery";
import drawPoint from "./edit/GlobeUninterruptedBillboardDrawer";
import {go} from "../../globalObject";

export default class drawShape {
    draw = {
        flag: 0,
        layerId: "globeDrawerDemoLayer",
        shape: [],
        shapeDic: {}
    }

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.clickEvents();
    }

    clickEvents() {
        let _this = this;
        $("#drawBillboard").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.billboardDrawer.viewModel.enabled) {
                go.plot.billboardDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackUninterruptedBillboard(function (positions) {
                for (let i = 0; i < positions.length; i++) {
                    let objId = (new Date()).getTime() + i;
                    _this.draw.shapeDic[objId] = positions[i];
                    go.plot.billboardDrawer.showBillboard(objId, positions[i]);
                }
            }, function (positions) {
                console.log(positions)
            })
        })
        $("#drawPolyline").on('click', function () {
            _this.draw.flag = 0;
            go.plot.trackPolyline(function (positions, lonlats, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = positions;
                go.plot.polylineDrawer.showPolyline(objId, positions, params,false);
            }, function (positions) {
                console.log(positions)
            })
        })
    }

    clearEntityById(objId) {
        var _this = this;
        var entityList = _this.viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return;
        }
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId === _this.draw.layerId && entity.objId === objId) {
                _this.viewer.entities.remove(entity);
                i--;
            }
        }
    }

    getParams(objId) {
        let _this = this;
        let entityList = _this.viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return;
        }
        for (let i = 0; i < entityList.length; i++) {
            let entity = entityList[i];
            if (entity.layerId === _this.draw.layerId && entity.objId === objId) {
                i--;
                return entity;
            }
        }
    }
}