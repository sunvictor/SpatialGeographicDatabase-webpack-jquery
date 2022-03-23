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
        _this.bindGloveEvent();
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
        $("#drawPincerArrow").on('click', function () {
            _this.draw.flag = 0;
            if (go.plot.pincerArrowDrawer.viewModel.enabled) {
                go.plot.pincerArrowDrawer.viewModel.enabled = false;
                return;
            }
            _this.draw.flag = 0;
            go.plot.trackPincerArrow(function (positions, custom, params) {
                let objId = (new Date()).getTime();
                _this.draw.shapeDic[objId] = {
                    custom: custom,
                    positions: positions
                };
                go.plot.pincerArrowDrawer.showPincerArrow(objId, positions, params);
            });
        })
        $("#editShape").on('click', function () {
            _this.draw.flag = 1;
            //清除标绘状态
            go.plot.clear();
        })
    }

    bindGloveEvent() {
        let _this = this;
        let handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
        handler.setInputAction(function (movement) {
            let pick = _this.viewer.scene.pick(movement.position);
            if (!pick) {
                return;
            }
            let obj = pick.id;
            if (!obj || !obj.layerId || _this.draw.flag == 0) {
                return;
            }
            const tree = $.fn.zTree.getZTreeObj("entityTree")
            let node = tree.getNodeByTId(pick.id.nodeProp.tId)
            console.log(node);
            let objId = obj.objId;
            //flag为编辑或删除标识,1为编辑，2为删除
            if (_this.draw.flag === 1) {
                switch (obj.shapeType) {
                    case "Polygon":
                        _this.draw.flag = 0;
                        go.plot.polygonDrawer.editShape(node, obj);
                        break;
                    case "Polyline":
                        _this.draw.flag = 0;
                        go.plot.polylineDrawer.editShape(node, obj);
                        break;
                    case "Rectangle":
                        _this.draw.flag = 0;
                        go.plot.rectangleDrawer.editShape(node, obj);
                        break;
                    case "Circle":
                        _this.draw.flag = 0;
                        go.plot.circleDrawer.editShape(node, obj);
                        break;
                    case "Point":
                        _this.draw.flag = 0;
                        go.plot.singleBillboardDrawer.editShape(node, obj);
                        break;
                    case "Billboard":
                        _this.draw.flag = 0;
                        go.plot.billboardDrawer.editShape(node, obj);
                        break;
                    case "BufferLine":
                        _this.draw.flag = 0;
                        go.plot.bufferLineDrawer.editShape(node, obj);
                        break;
                    case "StraightArrow":
                        _this.draw.flag = 0;
                        go.plot.straightArrowDrawer.editShape(node, obj);
                        break;
                    case "AttackArrow":
                        _this.draw.flag = 0;
                        go.plot.attackArrowDrawer.editShape(node, obj);
                        break;
                    case "PincerArrow":
                        _this.draw.flag = 0;
                        go.plot.pincerArrowDrawer.editShape(node, obj);
                        break;
                    default:
                        break;
                }
            } else if (_this.draw.flag == 2) {
                _this.clearEntityById(objId);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
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