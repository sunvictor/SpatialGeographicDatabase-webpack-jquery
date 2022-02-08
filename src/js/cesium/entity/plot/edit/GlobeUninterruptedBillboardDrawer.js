export default class GlobeUninterruptedBillboardDrawer {
    constructor() {
        this.init.apply(this, arguments);
    }

    viewer = null;
    scene = null;
    clock = null;
    canvas = null;
    camera = null;
    ellipsoid = null;
    tooltip = null;
    entity = null;
    position = null;
    positions = [];
    drawHandler = null;
    modifyHandler = null;
    okHandler = null;
    cancelHandler = null;
    image = "../../../../img/plot/bluePoint.png";
    toolBarIndex = null;
    layerId = "globeEntityDrawerLayer";
    activeShapePoints = [];
    floatingPoint = null;
    getPointBy3DModel = null;

    init(viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        // _this.tooltip = new GlobeTooltip(viewer.container);
    }

    clear() {
        var _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        if (_this.getPointBy3DModel) {
            _this.getPointBy3DModel.destroy();
            _this.getPointBy3DModel = null;
        }
        if (_this.toolBarIndex != null) {
            layer.close(_this.toolBarIndex);
        }
        _this.position = null;
        _this.positions = [];
        _this.activeShapePoints = [];
        _this.floatingPoint = undefined;
        _this.entity = null;
        _this.clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);
    }

    createPoint() {
        var _this = this;
        var point = _this.viewer.entities.add({
            position: _this.position,
            billboard: {
                image: _this.image,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //元素在正上方
            }
        });
        point.oid = 0;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.entity = point;
        return point;
    }

    modifyPoint() {
        var _this = this;
        var point = _this.viewer.entities.add({
            position: new Cesium.CallbackProperty(function () {
                return _this.position;
            }, false),
            billboard: {
                image: _this.image,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //元素在正上方
            }
        });
        point.oid = 0;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.entity = point;
        return point;
    }

    start(okHandler, cancelHandler) {
        var _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this.getPointBy3DModel = new Cesium.ScreenSpaceEventHandler(_this.canvas);
        _this.getPointBy3DModel.setInputAction(function (event) {
            var wp = event.position;
            if (!Cesium.defined(wp)) {
                return
            }
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return
            }
            if (cartesian) {
                _this.position = cartesian;
                _this.positions.push(cartesian);
                if (_this.activeShapePoints.length === 0) {
                    _this.floatingPoint = _this.createPoint();
                    _this.activeShapePoints.push(cartesian);
                }
                _this.activeShapePoints.push(cartesian);
                _this.floatingPoint = _this.createPoint();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.getPointBy3DModel.setInputAction(function (movement) {
            // _this.createPoint();
            var wp = movement.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            // _this.tooltip.showAt(wp, "<p>选择位置</p>");
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (Cesium.defined(_this.floatingPoint)) {
                // var newPosition = _this.viewer.scene.pickPosition(movement.endPosition);
                _this.floatingPoint.position.setValue(cartesian);
                _this.activeShapePoints.pop();
                _this.activeShapePoints.push(cartesian);
            } else {
                _this.position = cartesian;
                _this.floatingPoint = _this.createPoint();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        _this.getPointBy3DModel.setInputAction(function (event) {
            _this.activeShapePoints.pop(); //去除最后一个动态点
            _this.viewer.entities.remove(_this.floatingPoint); //去除动态点图形（当前鼠标点）
            _this.floatingPoint = undefined;
            _this.activeShapePoints = [];
            // layer.close(_this.toolBarIndex);
            if (_this.okHandler) {
                var lonLat = _this.getLonLat(_this.position);
                _this.okHandler(_this.positions, lonLat);
                _this.clear();
            }
            _this.positions = [];
            // _this.getPointBy3DModel.destroy();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    }

    getLonLat(cartesian) {
        var _this = this;
        var cartographic = _this.ellipsoid.cartesianToCartographic(cartesian);
        cartographic.height = _this.viewer.scene.globe.getHeight(cartographic);
        var pos = {
            lon: cartographic.longitude,
            lat: cartographic.latitude,
            alt: cartographic.height,
            height: cartographic.height
        };
        pos.lon = Cesium.Math.toDegrees(pos.lon);
        pos.lat = Cesium.Math.toDegrees(pos.lat);
        return pos;
    }

    showModifyPoint(position, okHandler, cancelHandler) {
        var _this = this;
        _this.position = position;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this.entity = null;
        // _this.createPoint();
        _this.modifyPoint();
        _this.startModify();
    }

    startModify() {
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        _this.showToolBar();
        _this.modifyHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);
        _this.modifyHandler.setInputAction(function (event) {
            var wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (isMoving) {
                isMoving = false;
                // pickedAnchor.position.setValue(cartesian);
                var oid = pickedAnchor.oid;
                _this.position = cartesian;
                // _this.tooltip.setVisible(false);
            } else {
                var pickedObject = _this.scene.pick(wp);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }
                if (!Cesium.defined(pickedObject.id)) {
                    return;
                }
                var entity = pickedObject.id;
                if (entity.layerId != _this.layerId || entity.flag != "anchor") {
                    return;
                }
                pickedAnchor = entity;
                isMoving = true;
                // _this.tooltip.showAt(wp, "<p>移动位置</p>");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            var wp = event.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            // _this.tooltip.showAt(wp, "<p>移动位置</p>");

            var ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            // pickedAnchor.position.setValue(cartesian);
            var oid = pickedAnchor.oid;
            _this.position = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // 按下鼠标拖动逻辑
        // _this.modifyHandler.setInputAction(function (event) {
        //     var wp = event.position;
        //     if (!Cesium.defined(wp)) {
        //         return;
        //     }
        //     var ray = _this.camera.getPickRay(wp);
        //     if (!Cesium.defined(ray)) {
        //         return;
        //     }
        //     var cartesian = _this.scene.globe.pick(ray, _this.scene);
        //     if (!Cesium.defined(cartesian)) {
        //         return;
        //     }
        //     if (!isMoving) {
        //         var pickedObject = _this.scene.pick(wp);
        //         if (!Cesium.defined(pickedObject)) {
        //             return;
        //         }
        //         if (!Cesium.defined(pickedObject.id)) {
        //             return;
        //         }
        //         var entity = pickedObject.id;
        //         if (entity.layerId != _this.layerId || entity.flag != "anchor") {
        //             return;
        //         }
        //         viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
        //         pickedAnchor = entity;
        //         isMoving = true;
        //         _this.tooltip.showAt(wp, "<p>移动位置</p>");
        //     }
        // }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

        // _this.modifyHandler.setInputAction(function (event) {
        //     if (!isMoving) {
        //         return;
        //     }
        //     var wp = event.endPosition;
        //     if (!Cesium.defined(wp)) {
        //         return;
        //     }
        //     _this.tooltip.showAt(wp, "<p>移动位置</p>");

        //     var ray = _this.camera.getPickRay(wp);
        //     if (!Cesium.defined(ray)) {
        //         return;
        //     }
        //     var cartesian = _this.scene.globe.pick(ray, _this.scene);
        //     if (!Cesium.defined(cartesian)) {
        //         return;
        //     }
        //     // pickedAnchor.position.setValue(cartesian);
        //     var oid = pickedAnchor.oid;
        //     _this.position = cartesian;
        // }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        // _this.modifyHandler.setInputAction(function (event) {
        //     var wp = event.position;
        //     if (!Cesium.defined(wp)) {
        //         return;
        //     }
        //     var ray = _this.camera.getPickRay(wp);
        //     if (!Cesium.defined(ray)) {
        //         return;
        //     }
        //     var cartesian = _this.scene.globe.pick(ray, _this.scene);
        //     if (!Cesium.defined(cartesian)) {
        //         return;
        //     }
        //     if (isMoving) {
        //         viewer.scene.screenSpaceCameraController.enableRotate = true; //解锁相机
        //         isMoving = false;
        //         // pickedAnchor.position.setValue(cartesian);
        //         var oid = pickedAnchor.oid;
        //         _this.position = cartesian;
        //         _this.tooltip.setVisible(false);
        //     }
        // }, Cesium.ScreenSpaceEventType.LEFT_UP)

    }

    showToolBar() {
        var _this = this;
        _this.createToolBar();
        var width = $(window).width();
        var wTop = 160;
        var wLeft = parseInt((width - 145) / 2);
        _this.toolBarIndex = layer.open({
            title: false,
            type: 1,
            fixed: true,
            resize: false,
            shade: 0,
            content: $("#shapeEditPoint"),
            offset: [wTop + "px", wLeft + "px"],
            move: "#shapeEditRTCorner"
        });
        var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    }

    createToolBar() {
        var _this = this;
        var objs = $("#shapeEditPoint");
        objs.remove();
        var html = '<div id="shapeEditPoint" style="padding: 10px 10px;background: rgb(57 57 57 / 86%);">' +
            '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>' +
            '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>' +
            // '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">' +
            '    </div>' +
            '</div>';
        $("body").append(html);
        var btnOK = $("#shapeEditPoint button[name='btnOK']");
        var btnCancel = $("#shapeEditPoint button[name='btnCancel']");
        btnOK.unbind("click").bind("click", function () {
            layer.close(_this.toolBarIndex);
            if (_this.okHandler) {
                var lonLat = _this.getLonLat(_this.position);
                _this.okHandler(_this.position, lonLat);
            }
            _this.clear();
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.cancelHandler) {
                _this.cancelHandler();
            }
        });
    }

    clearMarkers(layerName) {
        var _this = this;
        var viewer = _this.viewer;
        var entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1)
            return;
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId == layerName) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    }
}
