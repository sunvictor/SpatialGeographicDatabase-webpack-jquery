export default class GlobePointDrawer {
    viewer= null;
    scene= null;
    clock= null;
    canvas= null;
    camera= null;
    ellipsoid= null;
    tooltip= null;
    entity= null;
    position= null;
    drawHandler= null;
    modifyHandler= null;
    okHandler= null;
    cancelHandler= null;
    image= "../../../../img/plot/bluePoint.png";
    toolBarIndex= null;
    layerId= "globeEntityDrawerLayer";
    
    constructor(viewer) {
        this.viewer = viewer;
    }

    init(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        // _this.tooltip = new GlobeTooltip(viewer.container);
    }
    clear() {
        let _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        if (_this.toolBarIndex != null) {
            layer.close(_this.toolBarIndex);
        }
        _this.entity = null;
        _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);
    }
    showModifyPoint(position, okHandler, cancelHandler) {
        let _this = this;
        _this.position = position;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this.entity = null;
        _this._createPoint();
        _this._startModify();
    }
    start(okHandler, cancelHandler) {
        let _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this.entity = null;
        _this.position = null;
        let floatingPoint = null;
        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.drawHandler.setInputAction(function (event) {
            let wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            let ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            _this.position = cartesian;
            _this.entity.position.setValue(cartesian);
            // _this.tooltip.setVisible(false);
            _this._startModify();
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            let wp = event.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            if (_this.position == null) {
                // _this.tooltip.showAt(wp, "<p>选择位置</p>");
            }
            let ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            _this.position = cartesian;
            if (_this.entity == null) {
                _this._createPoint();
            } else {
                _this.entity.position.setValue(cartesian);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    _startModify() {
        let _this = this;
        let isMoving = false;
        let pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        _this._showToolBar();

        _this.modifyHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.modifyHandler.setInputAction(function (event) {
            let wp = event.position;
            if (!Cesium.defined(wp)) {
                return;
            }
            let ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (isMoving) {
                isMoving = false;
                pickedAnchor.position.setValue(cartesian);
                let oid = pickedAnchor.oid;
                _this.position = cartesian;
                // _this.tooltip.setVisible(false);
            } else {
                let pickedObject = _this.scene.pick(wp);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }
                if (!Cesium.defined(pickedObject.id)) {
                    return;
                }
                let entity = pickedObject.id;
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
            let wp = event.endPosition;
            if (!Cesium.defined(wp)) {
                return;
            }
            // _this.tooltip.showAt(wp, "<p>移动位置</p>");

            let ray = _this.camera.getPickRay(wp);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            pickedAnchor.position.setValue(cartesian);
            let oid = pickedAnchor.oid;
            _this.position = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    _createPoint() {
        let _this = this;
        let point = viewer.entities.add({
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
    _showToolBar() {
        let _this = this;
        _this._createToolBar();
        let width = $(window).width();
        let wTop = 60;
        let wLeft = parseInt((width - 145) / 2);
        _this.toolBarIndex = layer.open({
            title: false,
            type: 1,
            fixed: true,
            resize: false,
            shade: 0,
            content: $("#shapeEditContainer"),
            offset: [wTop + "px", wLeft + "px"],
            move: "#shapeEditRTCorner"
        });
        let cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    }
    _createToolBar() {
        let _this = this;
        let objs = $("#shapeEditContainer");
        objs.remove();
        let html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
            + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>'
            + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>'
            + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
            + '    </div>'
            + '</div>';
        $("body").append(html);

        let btnOK = $("#shapeEditContainer button[name='btnOK']");
        let btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        btnOK.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.okHandler) {
                let lonLat = _this._getLonLat(_this.position);
                _this.okHandler(_this.position, lonLat);
            }
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.cancelHandler) {
                _this.cancelHandler();
            }
        });
    }
    _getLonLat(cartesian) {
        let _this = this;
        let cartographic = _this.ellipsoid.cartesianToCartographic(cartesian);
        cartographic.height = _this.viewer.scene.globe.getHeight(cartographic);
        let pos = {
            lon: cartographic.longitude,
            lat: cartographic.latitude,
            alt: cartographic.height,
            height: cartographic.height
        };
        pos.lon = Cesium.Math.toDegrees(pos.lon);
        pos.lat = Cesium.Math.toDegrees(pos.lat);
        return pos;
    }
    _clearMarkers(layerName) {
        let _this = this;
        let viewer = _this.viewer;
        let entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1)
            return;
        for (let i = 0; i < entityList.length; i++) {
            let entity = entityList[i];
            if (entity.layerId == layerName) {
                viewer.entities.remove(entity);
                i--;
            }
        }
    }
}