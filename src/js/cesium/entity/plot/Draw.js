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
        $("#drawSingleBillboard").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.singleBillboardDrawer.viewModel.enabled) {
                go.plot.singleBillboardDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.singleBillboard(function (positions) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = positions;
                go.plot.singleBillboardDrawer.showBillboard(objId, positions);
            }, function (positions) {
                console.log(positions)
            })
        })
        $("#drawPolyline").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.polylineDrawer.viewModel.enabled) {
                go.plot.polylineDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackPolyline(function (positions, lonlats, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = positions;
                go.plot.polylineDrawer.showPolyline(objId, positions, params, false);
            }, function (positions) {
                console.log(positions)
            })
        })
        $("#drawPolygon").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.polygonDrawer.viewModel.enabled) {
                go.plot.polygonDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackPolygon(function (positions, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = positions;
                go.plot.polygonDrawer.showPolygon(objId, positions, params);
            }, function (positions) {
                console.log(positions)
            })
        })
        $("#drawRectangle").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.rectangleDrawer.viewModel.enabled) {
                go.plot.rectangleDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackRectangle(function (positions, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = positions;
                go.plot.rectangleDrawer.showRectangle(objId, positions, params);
            }, function (positions) {
                console.log(positions)
            });
        })
        $("#drawCircle").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.circleDrawer.viewModel.enabled) {
                go.plot.circleDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackCircle(function (positions, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = positions;
                go.plot.circleDrawer.showCircle(objId, positions, params);
            });
        })
        $("#drawBufferLine").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.bufferLineDrawer.viewModel.enabled) {
                go.plot.bufferLineDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackBufferLine(function (positions, radius, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = {
                    positions: positions,
                    radius: radius
                };
                go.plot.bufferLineDrawer.showBufferLine(objId, positions, radius, params);
            });
        })
        $("#drawAttackArrow").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.attackArrowDrawer.viewModel.enabled) {
                go.plot.attackArrowDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackAttackArrow(function (positions, radius, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = {
                    positions: positions,
                    radius: radius
                };
                go.plot.attackArrowDrawer.showAttackArrow(objId, positions, params);
            });
        })

        $("#drawStraightArrow").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.straightArrowDrawer.viewModel.enabled) {
                go.plot.straightArrowDrawer.viewModel.enabled = false;
                return;
            }
            go.plot.trackStraightArrow(function (positions, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = positions;
                go.plot.straightArrowDrawer.showStraightArrow(objId, positions, params);
            });
        })

    }

    clearEntityById(objId) {
        let _this = this;
        let entityList = _this.viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return;
        }
        for (let i = 0; i < entityList.length; i++) {
            let entity = entityList[i];
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