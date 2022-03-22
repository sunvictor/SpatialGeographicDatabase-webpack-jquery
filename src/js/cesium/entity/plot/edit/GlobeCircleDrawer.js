import layer from "layer-src";

export default class GlobeCircleDrawer {
    viewer = null;
    scene = null;
    clock = null;
    canvas = null;
    camera = null;
    ellipsoid = null;
    tooltip = null;
    entity = null;
    outlineEntity = null;
    positions = [];
    drawHandler = null;
    modifyHandler = null;
    okHandler = null;
    cancelHandler = null;
    dragIcon = "../../../../img/plot/circle_center.png";
    dragIconLight = "../../../../img/plot/bluePoint.png";
    material = null;
    radiusLineMaterial = null;
    outlineMaterial = null;
    fill = true;
    outline = true;
    outlineWidth = 3;
    extrudedHeight = 0;
    toolBarIndex = null;
    layerId = "globeEntityDrawerLayer";
    params = {}; // 封装需要传递的参数
    ground = true; // 图形是否贴地
    shapeColor = null;
    outlineColor = null;
    shapeName = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        // _this.tooltip = new GlobeTooltip(viewer.container);
        _this.resetParams();
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
            layer.close(_this.toolBarIndex, function () {
                $("#shapeEditContainer").remove();
            });
        }
        _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);
        $("#shapeEditContainer").hide();
    }
    clear2(){
        let _this = this;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.modifyHandler) {
            _this.modifyHandler.destroy();
            _this.modifyHandler = null;
        }
        _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);

        _this.viewer.entities.remove(_this.entity);
    }
    showModifyCircle(positions,oldParams, okHandler, cancelHandler) {
        let _this = this;
        _this.positions = positions;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this.params = oldParams; // 关于该图形的参数
        _this.shapeColor = _this.params.color;
        _this.ground = _this.params.ground;
        _this.shapeName = _this.params.name;
        _this.outline = _this.params.outline;
        _this.outlineColor = _this.params.outlineColor;
        _this.outlineWidth = _this.params.outlineWidth;
        _this._showModifyRegion2Map();
        _this._showCircleOutline2Map();
        _this._startModify();
    }
    start(okHandler, cancelHandler) {
        let _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;

        _this.positions = [];
        let floatingPoint = null;

        // let definedColor = $("#paigusu").data("color2");
        // if (definedColor) {
        //     _this.shapeColor = "rgba(" + definedColor + ")"; // 设置自定义的绘图颜色
        // }

        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.drawHandler.setInputAction(function (event) {
            let position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            let ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            let num = _this.positions.length;
            if (num == 0) {
                _this.positions.push(cartesian);
                _this._createCenter(cartesian, 0);
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
                _this._showCircleOutline2Map();
            }
            _this.positions.push(cartesian);
            if (num > 0) {
                _this._createPoint(cartesian, 1);
            }
            if (num > 1) {
                _this.positions.pop();
                _this.viewer.entities.remove(floatingPoint);
                // _this.tooltip.setVisible(false);
                _this._startModify();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            let position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            if (_this.positions.length < 1) {
                //  _this.tooltip.showAt(position, "<p>选择起点</p>");
                return;
            }
            //  _this.tooltip.showAt(position, "<p>选择终点</p>");

            let ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            floatingPoint.position.setValue(cartesian);
            _this.positions.pop();
            _this.positions.push(cartesian);
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
            let position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            let ray = _this.camera.getPickRay(position);
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
                _this.positions[oid] = cartesian;
                // _this.tooltip.setVisible(false);
            } else {
                let pickedObject = _this.scene.pick(position);
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
                //  _this.tooltip.showAt(position, "<p>移动控制点</p>");
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            let position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            //  _this.tooltip.showAt(position, "<p>移动控制点</p>");

            let ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            let cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            pickedAnchor.position.setValue(cartesian);
            let oid = pickedAnchor.oid;
            _this.positions[oid] = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    _createCenter(cartesian, oid) {
        let _this = this;
        let point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIcon,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        return point;
    }
    _createPoint(cartesian, oid) {
        let _this = this;
        let point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        return point;
    }
    _showRegion2Map() {
        let _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        if (_this.radiusLineMaterial == null) {
            // _this.radiusLineMaterial = new Cesium.PolylineDashMaterialProperty({
            //     dashLength: 16,
            //     color: Cesium.Color.fromCssColorString(_this.outlineColor)
            // });
        }
        let dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                let dis = _this._computeCircleRadius3D(_this.positions);
                dis = (dis / 1000).toFixed(3);
                //  _this.entity.label.text = dis + "km";
                let pnts = _this._computeCirclePolygon(_this.positions);
                let pHierarchy = new Cesium.PolygonHierarchy(pnts);
                return pHierarchy;
            } else {
                return null;
            }
        }, false);
        let lineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                return _this.positions;
            } else {
                return null;
            }
        }, false);
        let labelDynamicPosition = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                let p1 = _this.positions[0];
                let p2 = _this.positions[1];
                let cp = _this._computeCenterPotition(p1, p2);
                return cp;
            } else {
                return null;
            }
        }, false);
        let bData = {
            position: labelDynamicPosition,
            label: {
                text: "",
                font: '14px Helvetica',
                // fillColor: Cesium.Color.SKYBLUE,
                // outlineColor: Cesium.Color.BLACK,
                // outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -9000)),
                pixelOffset: new Cesium.Cartesian2(16, 16)
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                // fill: _this.fill,
                // outline: _this.outline,
                // outlineWidth: _this.outlineWidth,
                // outlineColor: _this.outlineColor
            }),
            // polyline: {
            //     positions: lineDynamicPositions,
            //     clampToGround: true,
            //     width: 2,
            //     material: _this.radiusLineMaterial
            // }
        };
        if (_this.extrudedHeight > 0) {
            bData.polygon.extrudedHeight = _this.extrudedHeight;
            bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    }
    _showModifyRegion2Map() {
        let _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        if (_this.radiusLineMaterial == null) {
            // _this.radiusLineMaterial = new Cesium.PolylineDashMaterialProperty({
            //     dashLength: 16,
            //     color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
            // });
        }
        let dynamicHierarchy = new Cesium.CallbackProperty(function () {
            let dis = _this._computeCircleRadius3D(_this.positions);
            dis = (dis / 1000).toFixed(3);
            // _this.entity.label.text = dis + "km";
            let pnts = _this._computeCirclePolygon(_this.positions);
            let pHierarchy = new Cesium.PolygonHierarchy(pnts);
            return pHierarchy;
        }, false);
        let lineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                return _this.positions;
            } else {
                return null;
            }
        }, false);
        let labelDynamicPosition = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                let p1 = _this.positions[0];
                let p2 = _this.positions[1];
                let cp = _this._computeCenterPotition(p1, p2);
                return cp;
            } else {
                return null;
            }
        }, false);
        let dis = _this._computeCircleRadius3D(_this.positions);
        dis = (dis / 1000).toFixed(3) + "km";
        let bData = {
            position: labelDynamicPosition,
            label: {
                // text: dis,
                font: '14px Helvetica',
                // fillColor: Cesium.Color.SKYBLUE,
                // outlineColor: Cesium.Color.BLACK,
                // outlineWidth: 1,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -9000)),
                pixelOffset: new Cesium.Cartesian2(16, 16)
            },
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                // fill: _this.fill,
                // outline: _this.outline,
                // outlineWidth: _this.outlineWidth,
                // outlineColor: _this.outlineColor
            }),
            // polyline: {
            //     positions: lineDynamicPositions,
            //     clampToGround: true,
            //     width: 2,
            //     material: _this.radiusLineMaterial
            // }
        };
        if (_this.extrudedHeight > 0) {
            bData.polygon.extrudedHeight = _this.extrudedHeight;
            bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        _this._createCenter(_this.positions[0], 0);
        _this._createPoint(_this.positions[1], 1);
    }
    _showCircleOutline2Map() {
        let _this = this;
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineGlowMaterialProperty({
            color: Cesium.Color.fromCssColorString(_this.outlineColor),
        });
        // }
        let outelinePositions = new Cesium.CallbackProperty(function () {
            let pnts = _this._computeCirclePolygon(_this.positions);
            return pnts;
        }, false);
        let bData = {
            polyline: {
                positions: outelinePositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial
            }
        };
        _this.outlineEntity = _this.viewer.entities.add(bData);
        _this.outlineEntity.layerId = _this.layerId;
    }
    _computeCenterPotition(p1, p2) {
        let _this = this;
        let c1 = _this.ellipsoid.cartesianToCartographic(p1);
        let c2 = _this.ellipsoid.cartesianToCartographic(p2);
        let cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        let cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
    }
    _computeCirclePolygon(positions) {
        let _this = this;

        try {
            if (!positions || positions.length < 2) {
                return null;
            }
            let cp = positions[0];
            let r = _this._computeCircleRadius3D(positions);
            let pnts = _this._computeCirclePolygon2(cp, r);
            return pnts;
        } catch (err) {
            return null;
        }
    }
    _computeCirclePolygon2(center, radius) {
        let _this = this;

        try {
            if (!center || radius <= 0) {
                return null;
            }
            let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
                center: center,
                semiMajorAxis: radius,
                semiMinorAxis: radius,
                rotation: 0,
                granularity: 0.005
            }, false, true);
            if (!cep || !cep.outerPositions) {
                return null;
            }
            let pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions);
            let first = pnts[0];
            pnts[pnts.length] = first;
            return pnts;
        } catch (err) {
            return null;
        }
    }
    _computeCirclePolygon3(center, semiMajorAxis, semiMinorAxis, rotation) {
        let _this = this;

        try {
            if (!center || semiMajorAxis <= 0 || semiMinorAxis <= 0) {
                return null;
            }
            let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions({
                center: center,
                semiMajorAxis: semiMajorAxis,
                semiMinorAxis: semiMinorAxis,
                rotation: rotation,
                granularity: 0.005
            }, false, true);
            if (!cep || !cep.outerPositions) {
                return null;
            }
            let pnts = Cesium.Cartesian3.unpackArray(cep.outerPositions);
            let first = pnts[0];
            pnts[pnts.length] = first;
            return pnts;
        } catch (err) {
            return null;
        }
    }
    _computeCirclePolygonForDegree(positions) {
        let _this = this;
        let cp = _this.ellipsoid.cartesianToCartographic(positions[0]);
        let rp = _this.ellipsoid.cartesianToCartographic(positions[1]);
        let x0 = cp.longitude;
        let y0 = cp.latitude;
        let xr = rp.longitude;
        let yr = rp.latitude;
        let r = Math.sqrt(Math.pow((x0 - xr), 2) + Math.pow((y0 - yr), 2));

        let pnts = [];
        for (let i = 0; i < 360; i++) {
            let x1 = x0 + r * Math.cos(i * Math.PI / 180);
            let y1 = y0 + r * Math.sin(i * Math.PI / 180);
            let p1 = Cesium.Cartesian3.fromRadians(x1, y1);
            pnts.push(p1);
        }
        return pnts;
    }
    _computeCircleRadius3D(positions) {
        let distance = 0;
        let c1 = positions[0];
        let c2 = positions[1];
        let x = Math.pow(c1.x - c2.x, 2);
        let y = Math.pow(c1.y - c2.y, 2);
        let z = Math.pow(c1.z - c2.z, 2);
        let dis = Math.sqrt(x + y + z);
        return dis;
    }
    _showToolBar() {
        let _this = this;
        _this._createToolBar();
        let width = $(window).width();
        let wTop = 300;
        // let wLeft = parseInt((width - 145) / 2);
        let wLeft = 600;
        _this.toolBarIndex = layer.open({
            title: false,
            type: 1,
            fixed: true,
            resize: false,
            shade: 0,
            content: $("#shapeEditContainer"),
            offset: [wTop + "px", wLeft + "px"],
            move: "#shapeEditRTCorner",
            area: ['400px','300px'],
            skin: 'layui-draw-alert',
        });
        let cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    }
    _createToolBar() {
        let _this = this;
        let objs = $("#shapeEditContainer");
        objs.remove();
        // let html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
        //     + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>'
        //     + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>'
        //     + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
        //     + '    </div>'
        //     + '</div>';
//         let html = `<div id="shapeEditContainer" style="color:black; height:300px;width:350px">
//         <div id="shapeEditRTCorner">圆形</div>
//         <hr>
//         <div>
//             <label>名称:</label><input id="ellipseName" type="text" value="圆形"/>
//             </div>
//             <div>
//             <label>贴地</label>
//             <input id="clamp" type="checkbox" name="clamp" checked>
//             <label>边框</label>
//             <input id="outline" type="checkbox" name="outline" checked>
//             </div>
//             <div>
//          <!-- <label>拉伸</label>
//             <input type="number" style="width:100px" id="pullHeight">
//             <label>米</label> -->
//             <label>颜色</label>
//             <span class="ellipse-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;margin:0;"></span>
//             <label>边框颜色</label>
//             <span class="ellipse-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;margin:0;"></span>
//             </div>
//             <div><label>边框宽度</label><input id="outlineWidth" type="range" min="1" max="100" step="1"/></div>
//         <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
//         <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
//         <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
//         </div>
//         </div>
// </div>
// `
        let html = `<div id="shapeEditContainer" style="height:300px;width:350px">
        <div id="shapeEditRTCorner">圆形</div>
        
        <div style="margin-left: 10%; margin-top: 5%;">
            <label>名称:</label><input style="background: rgba(30,32,45,0.9);    margin-left: 3%; color: #ffffff;    font-size: 14px;
            width: 200px;
            height: 25px;
            text-indent: 10px;outline:none; border:none;" id="ellipseName" type="text" value="圆形"/>
            </div>
            <div style="margin-left: 10%; margin-top: 5%;">
           <!-- <label>贴地：</label>
            <input id="clamp" type="checkbox" name="clamp" checked> -->
            <label style="display: inline-block;
            margin-left: 5%;">边框：</label>
            <input id="outline" type="checkbox" name="outline" checked>
            </div>
            <div style="margin-left: 10%; margin-top: 5%;">
         <!-- <label>拉伸</label>
            <input type="number" style="width:100px" id="pullHeight">
            <label>米</label> -->
            <label style="    position: relative; top: 50.5%;">颜色：</label>
            <span class="ellipse-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;"></span>
            <label  style="    position: relative; top: 50.5%; left: 32%;">边框颜色：</label>
            <span class="ellipse-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;"></span>
            </div>
            <div style="margin-left: 10%; margin-top: 5%;"><label>边框宽度：</label><input style="  width: 200px; margin-left: 1%;position: absolute;" id="outlineWidth" type="range" min="1" max="100" step="1"/></div>
        <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
        <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
        <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
        </div>
        </div>
</div>
`
        $("body").append(html);
        _this.initPanelData();
        _this.setAttribute();
        let btnOK = $("#shapeEditContainer button[name='btnOK']");
        let btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        btnOK.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex, function () {
                $("#shapeEditContainer").remove();
            });
            if (_this.okHandler) {
                _this.params.color = _this.shapeColor;
                _this.params.ground = _this.ground;
                _this.params.name = _this.shapeName;
                _this.params.outline = _this.outline;
                _this.params.outlineColor = _this.outlineColor;
                _this.params.outlineWidth = _this.outlineWidth;
                _this.okHandler(_this.positions, _this.params);
                _this.resetParams();
            }
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex, function () {
                $("#shapeEditContainer").remove();
            });
            if (_this.cancelHandler) {
                _this.cancelHandler();
                _this.resetParams();
            }
        });
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
    setAttribute() {
        let _this = this;
        // 设置边框是否显示
        $("#outline").click(function () {
            _this.outlineEntity.polyline.show = false; // 未选中状态设置边框隐藏
            _this.outline = false;
            $('input[name="outline"]:checked').each(function () {
                _this.outlineEntity.polyline.show = true; // 选中状态显示边框
                _this.outline = true;
            });
        })

        // // 设置图形颜色
        // $(".ellipse-shapecolor-paigusu").paigusu({
        //     color: "228,235,41,0.6", //初始色  支持两种配置方案
        // }, function (event, obj) {
        //     // console.log(event);
        //     // console.log(obj);
        //     $(event).data('color', "rgba(" + obj.rgba + ")"); // 用于changeColor.js使用，格式 rgba(25,38,220,0.1);
        //     $(event).data('color2', obj.rgba); // 用于paigusu.min.js使用，获取当前颜色 格式 25,38,220,1
        //     $(event).css('background', "rgba(" + obj.rgb + ")"); // 设置页面盒子的背景颜色
        //     // color = "rgba("+obj.rgba+")";
        //     _this.shapeColor = "rgba(" + obj.rgba + ")";
        //     _this.entity.polygon.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
        //         _this.material = Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")");
        //         return _this.material;
        //     }, false));
        // });

        // 设置边框颜色
        // $(".ellipse-border-paigusu").paigusu({
        //     color: "38,57,167,1.0", //初始色  支持两种配置方案
        // }, function (event, obj) {
        //     // console.log(event);
        //     // console.log(obj);
        //     $(event).data('color', "rgba(" + obj.rgba + ")"); // 用于changeColor.js使用，格式 rgba(25,38,220,0.1);
        //     $(event).data('color2', obj.rgba); // 用于paigusu.min.js使用，获取当前颜色 格式 25,38,220,1
        //     $(event).css('background', "rgba(" + obj.rgb + ")"); // 设置页面盒子的背景颜色
        //     // color = "rgba("+obj.rgba+")";
        //     _this.outlineColor = "rgba(" + obj.rgba + ")";
        //     _this.outlineEntity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
        //         dashLength: 16,
        //         color: Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")"),
        //     });
        //     // _this.entity.polyline.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
        //     //     _this.material = Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")");
        //     //     return _this.material;
        //     // }, false));
        // });

        // 设置是否贴地
        let checked = true;
        $("#clamp").click(function () {
            if (checked) {
                _this.ground = false;
                // _this.params.ground = false;
                checked = false;
                _this.clear2();
                // let positions = [];
                // for (let i = 0; i < _this.tempPositions.length; i += 2) {
                //     let p = _this.tempPositions[i];
                //     positions.push(p);
                // }
                // _this.positions = positions;

                _this._showModifyRegion2Map();
            }
            $('input[name="clamp"]:checked').each(function () {
                _this.ground = true;
                // _this.params.ground = true;
                checked = true;
                _this.clear2();
                // let positions = [];
                // for (let i = 0; i < _this.tempPositions.length; i += 2) {
                //     let p = _this.tempPositions[i];
                //     positions.push(p);
                // }
                // _this.positions = positions;

                _this._showModifyRegion2Map();
            });
        })

        // 修改图形名称
        $('#ellipseName').bind('input propertychange', function () {
            let val = $("#polygonName").val();
            _this.shapeName = val;
        })

        // 设置边框宽度
        $("#outlineWidth").on('input propertychange', () => {
            let val = $("#outlineWidth").val();
            _this.outlineWidth = val;
            _this.outlineEntity.polyline.width = _this.outlineWidth;
        });
    }
    initPanelData() {
        let _this = this;
        $("#ellipseName").val(_this.shapeName); // 设置面板中的图形名称
        // $("#clamp").

        if (_this.ground) { // 设置贴地按钮是否选中
            $("#clamp").prop("checked", true);
        } else {
            $("#clamp").prop("checked", false);
        }

        if (_this.outline) { // 设置边框显示按钮是否选中
            $("#outline").prop("checked", true);
        } else {
            $("#outline").prop("checked", false);
        }

        $(".ellipse-shapecolor-paigusu").css("background", _this.shapeColor); //  设置图形颜色span的背景色
        $(".ellipse-border-paigusu").css("background", _this.outlineColor); //  设置边框颜色span的背景色

        $("#outlineWidth").val(_this.outlineWidth);
    }
    resetParams() {
        let _this = this;
        _this.params = {
            color: "rgba(228,235,41,0.5)",
            outline: true,
            ground: true,
            outlineColor: "rgba(14,17,226,0.7)",
            name: '圆形',
            outlineWidth: 3,
        };
        _this.shapeColor = "rgba(228,235,41,0.5)";
        _this.outline = true;
        _this.ground = true;
        _this.outlineColor = "rgba(14,17,226,0.7)";
        _this.shapeName = "圆形";
        _this.outlineWidth = 3;
    }
}