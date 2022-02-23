export default class GlobePolygonDrawer {
    viewer = null;
    scene = null;
    clock = null;
    canvas = null;
    camera = null;
    ellipsoid = null;
    tooltip = null;
    entity = null;
    positions = [];
    tempPositions = [];
    drawHandler = null;
    modifyHandler = null;
    okHandler = null;
    cancelHandler = null;
    dragIcon = "../../../../img/plot/tempMidPoint.png";
    dragIconLight = "../../../../img/plot/editPoint.png";
    material = null;
    outlineMaterial = null;
    fill = true;
    outline = true;
    outlineWidth = 2;
    extrudedHeight = 0;
    toolBarIndex = null;
    markers = {};
    layerId = "globeDrawerLayer";
    params = {}; // 封装需要传递的参数
    ground = true; // 图形是否贴地
    shapeColor = null;
    outlineColor = null;
    shapeName = null;
    terrainHeight = null;

    constructor(viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        // _this.tooltip = new GlobeTooltip(viewer.container);

        _this.params = {
            color: "rgba(228,235,41,0.6)",
            outline: true,
            extrudedHeight: undefined,
            ground: true,
            outlineColor: "#00f",
            name: '多边形',
            outlineWidth: 2,
        };
        _this.shapeColor = "rgba(228,235,41,0.6)";
        _this.outline = true;
        _this.extrudedHeight = undefined;
        _this.ground = true;
        _this.outlineColor = "#00f";
        _this.shapeName = "多边形";
        _this.outlineWidth = 2;
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
        if (_this.toolBarIndex != null) {
            layer.close(_this.toolBarIndex);
            _this.toolBarIndex = null;
        }
        _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);

        $("#shapeEditContainer").hide(); // 设置确定按钮隐藏
        _this.extrudedHeight = 0;
        _this.material == null;

    }

    showModifyPolygon(positions, readonlyParams, okHandler, cancelHandler) {
        var _this = this;
        _this.positions = positions;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this.params = readonlyParams; // 关于该图形的参数
        _this.extrudedHeight = _this.params.extrudedHeight; // 更新数据
        _this.shapeColor = _this.params.color;
        _this.ground = _this.params.ground;
        _this.shapeName = _this.params.name;
        _this.outline = _this.params.outline;
        _this.outlineColor = _this.params.outlineColor;
        _this.outlineWidth = _this.params.outlineWidth;
        _this._showModifyRegion2Map();
    }

    start(okHandler, cancelHandler) {
        var _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;

        _this.positions = [];
        var floatingPoint = null;
        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        var definedColor = $("#paigusu").data("color2");
        if (definedColor) {
            _this.shapeColor = "rgba(" + definedColor + ")"; // 设置自定义的绘图颜色
        }
        _this.drawHandler.setInputAction(function (event) {
            viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            var num = _this.positions.length;

            if (num == 0) {
                _this.positions.push(cartesian);
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
            }

            _this.positions.push(cartesian);
            var oid = _this.positions.length - 2;
            _this._createPoint(cartesian, oid);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            if (_this.positions.length < 1) {
                // _this.tooltip.showAt(position, "<p>选择起点</p>");

                return;
            }
            var num = _this.positions.length;
            // var tip = "<p>点击添加下一个点</p>";
            if (num > 3) {
                // tip += "<p>右键结束绘制</p>";
                // layer.msg("右键结束绘制")
            }
            //_this.tooltip.showAt(position, tip);
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            floatingPoint.position.setValue(cartesian);
            _this.positions.pop();
            _this.positions.push(cartesian);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        _this.drawHandler.setInputAction(function (movement) {
            viewer.scene.screenSpaceCameraController.enableRotate = true; //锁定相机
            if (_this.positions.length < 4) {
                return;
            }
            _this.positions.pop();
            _this.viewer.entities.remove(floatingPoint);
            // _this.tooltip.setVisible(false);

            //进入编辑状态
            _this.clear();
            _this._showModifyRegion2Map();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    _startMovePolygon() {
    }

    _startModify() {
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.toolBarIndex == null) {
            _this._showToolBar();
        }

        _this.modifyHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.modifyHandler.setInputAction(function (event) {
            var position = event.position;
            if (!Cesium.defined(position)) {
                return;
            }
            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (isMoving) {
                isMoving = false;
                pickedAnchor.position.setValue(cartesian);
                var oid = pickedAnchor.oid;
                _this.tempPositions[oid] = cartesian;
                // _this.tooltip.setVisible(false);
                if (pickedAnchor.flag == "mid_anchor") {
                    _this._updateModifyAnchors(oid);
                }
            } else {
                var pickedObject = _this.scene.pick(position);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }
                if (!Cesium.defined(pickedObject.id)) {
                    return;
                }
                var entity = pickedObject.id;
                if (entity.layerId != _this.layerId) {
                    return;
                }
                if (entity.flag != "anchor" && entity.flag != "mid_anchor") {
                    return;
                }
                pickedAnchor = entity;
                isMoving = true;
                if (entity.flag == "anchor") {
                    // _this.tooltip.showAt(position, "<p>移动控制点</p>");
                }
                if (entity.flag == "mid_anchor") {
                    // _this.tooltip.showAt(position, "<p>移动创建新的控制点</p>");
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.modifyHandler.setInputAction(function (event) {
            if (!isMoving) {
                return;
            }
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            //  _this.tooltip.showAt(position, "<p>移动控制点</p>");

            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            var oid = pickedAnchor.oid;
            if (pickedAnchor.flag == "anchor") {
                pickedAnchor.position.setValue(cartesian);
                _this.tempPositions[oid] = cartesian;
                //左右两个中点
                _this._updateNewMidAnchors(oid);
            } else if (pickedAnchor.flag == "mid_anchor") {
                pickedAnchor.position.setValue(cartesian);
                _this.tempPositions[oid] = cartesian;
            }
            // console.log(_this.tempPositions);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    _showRegion2Map() {
        var _this = this;
        // if (_this.material == null) {
        // 临时图
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        //_this.material = getColor(viewModel.color, viewModel.alpha),
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(_this.outlineColor),
        });
        // }
        var dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 2) {
                var pHierarchy = new Cesium.PolygonHierarchy(_this.positions);
                return pHierarchy;
            } else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var arr = [].concat(_this.positions);
                var first = _this.positions[0];
                arr.push(first);
                return arr;
            } else {
                return null;
            }
        }, false);
        var bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                show: _this.fill,
            }),
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (_this.extrudedHeight > 0) {
            bData.polygon.extrudedHeight = _this.extrudedHeight;
            bData.polygon.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    }

    _showModifyRegion2Map() {
        var _this = this;
        _this._startModify();
        _this._computeTempPositions();

        var dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 2) {
                var pHierarchy = new Cesium.PolygonHierarchy(_this.tempPositions);
                return pHierarchy;
            } else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.tempPositions.length > 1) {
                var arr = [].concat(_this.tempPositions);
                var first = _this.tempPositions[0];
                arr.push(first);
                return arr;
            } else {
                return null;
            }
        }, false);
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(_this.outlineColor),
        });
        // }
        var bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                show: _this.fill,
            }),
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline,
            }
        };
        if (!_this.ground && _this.extrudedHeight > 0) { // 当贴地属性为false并且拉伸高度大于0时，拉伸
            bData.polygon.extrudedHeight = _this.extrudedHeight;
            bData.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            // bData.polygon.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        var positions = _this.tempPositions;
        for (var i = 0; i < positions.length; i++) {
            var ys = i % 2;
            if (ys == 0) {
                _this._createPoint(positions[i], i);
            } else {
                _this._createMidPoint(positions[i], i);
            }
        }
    }

    _updateModifyAnchors(oid) {
        var _this = this;

        //重新计算tempPositions
        var p = _this.tempPositions[oid];
        var p1 = null;
        var p2 = null;
        var num = _this.tempPositions.length;
        if (oid == 0) {
            p1 = _this.tempPositions[num - 1];
            p2 = _this.tempPositions[oid + 1];
        } else if (oid == num - 1) {
            p1 = _this.tempPositions[oid - 1];
            p2 = _this.tempPositions[0];
        } else {
            p1 = _this.tempPositions[oid - 1];
            p2 = _this.tempPositions[oid + 1];
        }
        //计算中心
        var cp1 = _this._computeCenterPotition(p1, p);
        var cp2 = _this._computeCenterPotition(p, p2);

        //插入点
        var arr = [cp1, p, cp2];
        _this.tempPositions.splice(oid, 1, cp1, p, cp2);

        //重新加载锚点
        _this._clearAnchors(_this.layerId);
        var positions = _this.tempPositions;
        for (var i = 0; i < positions.length; i++) {
            var ys = i % 2;
            if (ys == 0) {
                _this._createPoint(positions[i], i);
            } else {
                _this._createMidPoint(positions[i], i);
            }
        }
    }

    _updateNewMidAnchors(oid) {
        var _this = this;
        if (oid == null || oid == undefined) {
            return;
        }
        //左边两个中点，oid2为临时中间点
        var oid1 = null;
        var oid2 = null;

        //右边两个中点，oid3为临时中间点
        var oid3 = null;
        var oid4 = null;
        var num = _this.tempPositions.length;
        if (oid == 0) {
            oid1 = num - 2;
            oid2 = num - 1;
            oid3 = oid + 1;
            oid4 = oid + 2;
        } else if (oid == num - 2) {
            oid1 = oid - 2;
            oid2 = oid - 1;
            oid3 = num - 1;
            oid4 = 0;
        } else {
            oid1 = oid - 2;
            oid2 = oid - 1;
            oid3 = oid + 1;
            oid4 = oid + 2;
        }

        var c1 = _this.tempPositions[oid1];
        var c = _this.tempPositions[oid];
        var c4 = _this.tempPositions[oid4];

        var c2 = _this._computeCenterPotition(c1, c);
        var c3 = _this._computeCenterPotition(c4, c);

        _this.tempPositions[oid2] = c2;
        _this.tempPositions[oid3] = c3;

        _this.markers[oid2].position.setValue(c2);
        _this.markers[oid3].position.setValue(c3);
    }

    _createPoint(cartesian, oid) {
        var _this = this;
        var point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //元素在正上方
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.markers[oid] = point;
        return point;
    }

    _createMidPoint(cartesian, oid) {
        var _this = this;
        var point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIcon,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //元素在正上方
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "mid_anchor";
        _this.markers[oid] = point;
        return point;
    }

    _computeTempPositions() {
        var _this = this;

        var pnts = [].concat(_this.positions);
        var num = pnts.length;
        var first = pnts[0];
        var last = pnts[num - 1];
        if (_this._isSimpleXYZ(first, last) == false) {
            pnts.push(first);
            num += 1;
        }
        _this.tempPositions = [];
        for (var i = 1; i < num; i++) {
            var p1 = pnts[i - 1];
            var p2 = pnts[i];
            var cp = _this._computeCenterPotition(p1, p2);
            _this.tempPositions.push(p1);
            _this.tempPositions.push(cp);
        }
    }

    _computeCenterPotition(p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        var cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
    }

    _showToolBar() {
        var _this = this;
        _this._createToolBar();
        var width = $(window).width();
        var wTop = 300;
        // var wLeft = parseInt((width - 145) / 2);
        var wLeft = 600;
        // _this.toolBarIndex = layer.open({
        //     title: false,
        //     type: 1,
        //     fixed: true,
        //     resize: false,
        //     shade: 0,
        //     content: $("#shapeEditContainer"),
        //     offset: [wTop + "px", wLeft + "px"],
        //     move: "#shapeEditRTCorner",
        //     area: ['400px','300px'],
        //     skin: 'layui-draw-alert',
        // });
        // var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        // $(cssSel).hide();
    }

    _createToolBar() {
        var _this = this;
        var objs = $("#shapeEditContainer");
        objs.remove();
        setTimeout(function () {
            let isConfirm = confirm("是否创建图形");
            if (isConfirm) {
                if (_this.okHandler) {
                    var positions = [];
                    for (var i = 0; i < _this.tempPositions.length; i += 2) {
                        var p = _this.tempPositions[i];
                        positions.push(p);
                    }
                    _this.params.extrudedHeight = _this.extrudedHeight
                    _this.params.color = _this.shapeColor;
                    _this.params.ground = _this.ground;
                    _this.params.name = _this.shapeName;
                    _this.params.outline = _this.outline;
                    _this.params.outlineColor = _this.outlineColor;
                    _this.params.outlineWidth = _this.outlineWidth;
                    _this.positions = positions;
                    _this.okHandler(positions, _this.params);
                    _this.clear();
                    _this.viewer.entities.remove(_this.entity);
                    // _this.resetParams();
                }
            } else {
                _this.clear();
                _this.viewer.entities.remove(_this.entity);
                layer.close(_this.toolBarIndex);
                if (_this.cancelHandler) {
                    _this.cancelHandler();
                }
            }
        }, 2000)
        // var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">' +
        //     '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>' +
        //     '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>' +
        //     '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">' +
        //     '    </div>' +
        //     '</div>';
        // var html = '<div id="shapeEditContainer" style="padding: 10px 10px; height:200px;">' +
        //     '    <h2 style="color:black">多边形</h2>'+
        //     '    <span style="color:black">名称:</span><input id="polygonName" type="text" value="多边形"/>'+
        //     '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>' +
        //     '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>' +
        //     '    <div id="shapeEditRTCorner" style="position: absolute; right: 0px; top: 0px; bottom: 0px">' +
        //     '    </div>' +
        //     '</div>';
        // var html = `<div id="shapeEditContainer" style="color:black; height:300px;width:350px">
        //                 <div id="shapeEditRTCorner">多边形</div>
        //                 <hr>
        //                 <div>
        //                     <label>名称:</label><input id="polygonName" type="text" value="多边形"/>
        //                     </div>
        //                     <div>
        //                     <label>贴地</label>
        //                     <input id="clamp" type="checkbox" name="clamp" checked>
        //                     <label>边框</label>
        //                     <input id="outline" type="checkbox" name="outline" checked>
        //                     </div>
        //                     <div>
        //                     <label>拉伸</label>
        //                     <input type="number" style="width:100px" id="pullHeight">
        //                     <label>米</label>
        //                     <label>颜色</label>
        //                     <span class="polygon-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;margin:0;"></span>
        //                     <label>边框颜色</label>
        //                     <span class="polygon-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;margin:0;"></span>
        //                     </div>
        //                    <!-- <div><label>边框宽度</label><input id="outlineWidth" type="range" min="1" max="100" step="1"/></div> -->
        //                 <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
        //                 <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
        //                 <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
        //                 </div>
        //                 </div>
        // </div>
        // `
        var html = `<div id="shapeEditContainer" style="color:#ffffff; height:300px;width:400px">
        <div id="shapeEditRTCorner">多边形</div>
     
        <div  style="margin-left: 10%; margin-top: 5%;">
            <label>名称:</label><input style="background: rgba(30,32,45,0.9);    margin-left: 3%; color: #ffffff;    font-size: 14px;
            width: 200px;
            height: 25px;
            text-indent: 10px;outline:none; border:none;" id="polygonName" type="text" value="多边形"/>
            </div>
            <div  style="margin-left: 10%; margin-top: 5%;">
            <label>贴地：</label>
            <input id="clamp" type="checkbox" name="clamp" checked>
            <label  style="display: inline-block;
            margin-left: 5%;">边框：</label>
            <input id="outline" type="checkbox" name="outline" checked>
            </div>
            <div  style="margin-left: 10%; margin-top: 5%;">
            <label>拉伸：</label>
            <input style="background: rgba(30,32,45,0.9); color: #ffffff;    font-size: 14px;
            width: 200px;
            height: 25px;
            text-indent: 10px;outline:none; border:none;" type="number" style="width:100px" id="pullHeight">
            <label>米</label>
            <div  style="margin-left: 1%; margin-top: 5%;">
            <label  style="    position: relative; top: 64.5%;">颜色：</label>
            <span class="polygon-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;"></span>
            <label style="top: 64.5%; left: 32%;">边框颜色：</label>
            <span class="polygon-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;"></span>
            </div>
            </div>
           <!-- <div><label>边框宽度</label><input id="outlineWidth" type="range" min="1" max="100" step="1"/></div> -->
        <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
        <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
        <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
        </div>
        </div>
</div>
`

        //     var html = `<form class="layui-form" action="" id="shapeEditContainer" style="color:black; height:300px;width:350px">
        //     <div class="layui-form-item"  id="shapeEditRTCorner">多边形</div>
        //      <hr>
        //     <div class="layui-form-item" >
        //       <label class="layui-form-label">名称:</label>
        //       <div class="layui-input-block">
        //         <input type="text" name="title" required  lay-verify="required" placeholder="请输入名称" autocomplete="off" class="layui-input" value="多边形">
        //       </div>
        //     </div>
        //     <div class="layui-form-item">
        //     <label class="layui-form-label">贴地</label>
        //     <div class="layui-input-block">
        //     <input type="checkbox" name="switch" lay-skin="switch">
        //     </div>
        //     <label class="layui-form-label">边框显示</label>
        //     <div class="layui-input-block">
        //     <input type="checkbox" name="switch" lay-skin="switch">
        //     </div>
        //     </div>
        //     <div class="layui-form-item" >
        //       <label class="layui-form-label">拉伸</label>
        //       <div class="layui-input-block">
        //         <input type="number" name="title" required  lay-verify="required" placeholder="请输拉伸高度" autocomplete="off" class="layui-input">
        //       </div>
        //       <label class="layui-form-label">颜色</label>#e0e613
        //       <span style="width:25px;height:25px;background:orange;display:inline-block;margin:0;"></span>
        //       <label class="layui-form-label">边框颜色</label>
        //       <span style="width:25px;height:25px;background:orange;display:inline-block;margin:0;"></span>
        //     </div>
        //     <div class="layui-form-item">
        //       <div class="layui-input-block">
        //         <buttonname="btnOK" class="layui-btn layui-btn-xs layui-btn-normal">立即提交</buttonname=>
        //         <button name="btnCancel class="layui-btn layui-btn-xs layui-btn-danger">重置</button>
        //       </div>
        //     </div>
        //   </form>`

        // $("body").append(html);
        // _this.initPanelData();
        // _this.setAttribute();
        // var btnOK = $("#shapeEditContainer button[name='btnOK']");
        // var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        // btnOK.unbind("click").bind("click", function () {
        //     layer.close(_this.toolBarIndex);
        //     if (_this.okHandler) {
        //         var positions = [];
        //         for (var i = 0; i < _this.tempPositions.length; i += 2) {
        //             var p = _this.tempPositions[i];
        //             positions.push(p);
        //         }
        //         _this.params.extrudedHeight = _this.extrudedHeight
        //         _this.params.color = _this.shapeColor;
        //         _this.params.ground = _this.ground;
        //         _this.params.name = _this.shapeName;
        //         _this.params.outline = _this.outline;
        //         _this.params.outlineColor = _this.outlineColor;
        //         _this.params.outlineWidth = _this.outlineWidth;
        //         _this.positions = positions;
        //         _this.okHandler(positions, _this.params);
        //         _this.clear();
        //         _this.viewer.entities.remove(_this.entity);
        //         _this.resetParams();
        //     }
        // });
        // btnCancel.unbind("click").bind("click", function () {
        //     _this.clear();
        //     _this.viewer.entities.remove(_this.entity);
        //     layer.close(_this.toolBarIndex);
        //     if (_this.cancelHandler) {
        //         _this.cancelHandler();
        //     }
        //     _this.resetParams();
        // });
    }

    _isSimpleXYZ(p1, p2) {
        if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
            return true;
        }
        return false;
    }

    _clearMarkers(layerName) {
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

    _clearAnchors() {
        var _this = this;
        for (var key in _this.markers) {
            var m = _this.markers[key];
            _this.viewer.entities.remove(m);
        }
        _this.markers = {};
    }

    setAttribute() {
        var _this = this;
        // 设置图形拉伸
        $('#pullHeight').bind('input propertychange', function () {
            // _this.ground = false;
            var height = $("#pullHeight").val();
            height = Number(height);
            _this.extrudedHeight = height;

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

            var positions = [];
            for (var i = 0; i < _this.tempPositions.length; i += 2) {
                var p = _this.tempPositions[i];
                positions.push(p);
            }
            _this.positions = positions;

            _this._showModifyRegion2Map();

            //  var centerPosition;
            // // var terrainHeight;
            // // 获取图形中心点
            // var polyCenter = Cesium.BoundingSphere.fromPoints(_this.positions).center;
            // centerPosition = Cesium.Ellipsoid.WGS84.scaleToGeodeticSurface(polyCenter);
            // var positions = [
            //     Cesium.Cartographic.fromCartesian(centerPosition),
            // ];
            // var terrain = _this.viewer.scene.terrainProvider;
            // var promise = Cesium.sampleTerrain(terrain, 17, positions);
            // Cesium.when(promise, function (updatedPositions) {
            //     if (updatedPositions[0].height == undefined) {
            //         _this.terrainHeight = 256;
            //         console.log("terrainHeight:" + terrainHeight)
            //     } else {
            //         _this.terrainHeight = updatedPositions[0].height; //高程
            //     }
            //     _this.extrudedHeight += _this.terrainHeight;
            //     _this._showModifyRegion2Map();
            // }).otherwise(function (error) {
            //     console.log(error);
            // })


            // _this._startModify();
            // _this._computeTempPositions();

            // var dynamicHierarchy = new Cesium.CallbackProperty(function () {
            //     if (_this.positions.length > 2) {
            //         var pHierarchy = new Cesium.PolygonHierarchy(_this.tempPositions);
            //         return pHierarchy;
            //     } else {
            //         return null;
            //     }
            // }, false);
            // var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            //     if (_this.tempPositions.length > 1) {
            //         var arr = [].concat(_this.tempPositions);
            //         var first = _this.tempPositions[0];
            //         arr.push(first);
            //         return arr;
            //     } else {
            //         return null;
            //     }
            // }, false);
            // if (_this.material == null) {
            //     _this.material = Cesium.Color.fromCssColorString(_this.params.color);
            // }
            // if (_this.outlineMaterial == null) {
            //     _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            //         dashLength: 16,
            //         color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.7)
            //     });
            // }
            // var bData = {
            //     polygon: new Cesium.PolygonGraphics({
            //         hierarchy: dynamicHierarchy,
            //         material: _this.material,
            //         show: _this.fill
            //     }),
            //     polyline: {
            //         positions: outlineDynamicPositions,
            //         clampToGround: true,
            //         width: _this.outlineWidth,
            //         material: _this.outlineMaterial,
            //         show: _this.outline
            //     }
            // };


            // _this.entity.polygon.extrudedHeight = new Cesium.CallbackProperty(function () {
            //     return Number(height);
            // }, false);
            // 地形深度检测
            // viewer.scene.globe.depthTestAgainstTerrain = false;
            // console.log(_this.entity);
            // if(!height || height <=0){
            //     _this.entity.polygon.extrudedHeight = undefined;
            // }else{
            //     _this.entity.polygon.extrudedHeight = height;
            //     _this.entity.polygon.closeTop = true;
            //     _this.entity.polygon.closeBottom = true;
            // }
            // _this.entity.polygon.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        });
        // 设置边框是否显示
        $("#outline").click(function () {
            _this.entity.polyline.show = false; // 未选中状态设置边框隐藏
            _this.outline = false;
            $('input[name="outline"]:checked').each(function () {
                _this.entity.polyline.show = true; // 选中状态显示边框
                _this.outline = true;
            });
        })

        // // 设置图形颜色
        // $(".polygon-shapecolor-paigusu").paigusu({
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
        //
        // // 设置边框颜色
        // $(".polygon-border-paigusu").paigusu({
        //     color: "38,57,167,1.0", //初始色  支持两种配置方案
        // }, function (event, obj) {
        //     // console.log(event);
        //     // console.log(obj);
        //     $(event).data('color', "rgba(" + obj.rgba + ")"); // 用于changeColor.js使用，格式 rgba(25,38,220,0.1);
        //     $(event).data('color2', obj.rgba); // 用于paigusu.min.js使用，获取当前颜色 格式 25,38,220,1
        //     $(event).css('background', "rgba(" + obj.rgb + ")"); // 设置页面盒子的背景颜色
        //     // color = "rgba("+obj.rgba+")";
        //     _this.outlineColor = "rgba(" + obj.rgba + ")";
        //     _this.entity.polyline.material = new Cesium.PolylineDashMaterialProperty({
        //         dashLength: 16,
        //         color: Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")"),
        //     });
        //     // _this.entity.polyline.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
        //     //     _this.material = Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")");
        //     //     return _this.material;
        //     // }, false));
        // });

        // 设置是否贴地
        var checked = true;
        $("#clamp").click(function () {
            if (checked) {
                _this.ground = false;
                // _this.params.ground = false;
                checked = false;
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

                var positions = [];
                for (var i = 0; i < _this.tempPositions.length; i += 2) {
                    var p = _this.tempPositions[i];
                    positions.push(p);
                }
                _this.positions = positions;

                _this._showModifyRegion2Map();
            }
            $('input[name="clamp"]:checked').each(function () {
                _this.ground = true;
                // _this.params.ground = true;
                checked = true;
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

                var positions = [];
                for (var i = 0; i < _this.tempPositions.length; i += 2) {
                    var p = _this.tempPositions[i];
                    positions.push(p);
                }
                _this.positions = positions;

                _this._showModifyRegion2Map();
            });
        })

        // 修改图形名称
        $('#polygonName').bind('input propertychange', function () {
            var val = $("#polygonName").val();
            _this.shapeName = val;
        })

        // 设置边框宽度
        $("#outlineWidth").on('input propertychange', () => {
            var val = $("#outlineWidth").val();
            _this.outlineWidth = val;
            _this.entity.polyline.width = _this.outlineWidth;
        });
    }

    initPanelData() {
        var _this = this;
        $("#polygonName").val(_this.shapeName); // 设置面板中的图形名称
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

        if (_this.extrudedHeight > 0) {
            $("#pullHeight").val(_this.extrudedHeight); // 设置拉伸输入框中的值
        }

        $(".polygon-shapecolor-paigusu").css("background", _this.shapeColor); //  设置图形颜色span的背景色
        $(".polygon-border-paigusu").css("background", _this.outlineColor); //  设置边框颜色span的背景色
    }

    resetParams() {
        var _this = this;
        _this.params = {
            color: "rgba(228,235,41,0.6)",
            outline: true,
            extrudedHeight: undefined,
            ground: true,
            outlineColor: "#00f",
            name: '多边形',
            outlineWidth: 2,
        };
        _this.shapeColor = "rgba(228,235,41,0.6)";
        _this.outline = true;
        _this.extrudedHeight = undefined;
        _this.ground = true;
        _this.outlineColor = "#00f";
        _this.shapeName = "多边形";
        _this.outlineWidth = 2;
    }
}