import {xp} from "@/js/cesium/entity/plot/algorithm";
export default class PlotAttackArrowDrawer {
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
            _this.toolBarIndex = null;
        }
        _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);
        $("#shapeEditContainer").hide(); // 设置确定按钮隐藏
    }
    showModifyAttackArrow(custom, oldParams, okHandler, cancelHandler) {
        let _this = this;
        let arr = [];
        for (let i = 0; i < custom.length; i++) {
            let p = custom[i];
            let c = Cesium.Cartesian3.fromDegrees(p[0], p[1]);
            arr.push(c);
        }
        _this.positions = arr;
        _this.params = oldParams; // 关于该图形的参数
        _this.shapeColor = _this.params.color;
        _this.ground = _this.params.ground;
        _this.shapeName = _this.params.name;
        _this.outline = _this.params.outline;
        _this.outlineColor = _this.params.outlineColor;
        _this.outlineWidth = _this.params.outlineWidth;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this._showModifyRegion2Map();
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
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
            }
            _this.positions.push(cartesian);
            let oid = _this.positions.length - 2;
            _this._createPoint(cartesian, oid);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            let position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            if (_this.positions.length < 1) {
                // _this.tooltip.showAt(position, "<p>选择起点</p>");
                return;
            }
            // _this.tooltip.showAt(position, "<p>新增控制点</p><p>右键结束绘制</p>");

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

        _this.drawHandler.setInputAction(function (movement) {
            if (_this.positions.length < 2) {
                return;
            }
            _this.positions.pop();
            _this.viewer.entities.remove(floatingPoint);
            // _this.tooltip.setVisible(false);
            _this._startModify();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        _this.drawHandler.setInputAction(function (movement) {
            if (_this.positions.length < 2) {
                return;
            }
            _this.positions.pop();
            _this.viewer.entities.remove(floatingPoint);
            // _this.tooltip.setVisible(false);
            _this._startModify();
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    _startModify() {
        let _this = this;
        let isMoving = false;
        let pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        if (_this.toolBarIndex == null) {
            _this._showToolBar();
        }

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
                // _this.tooltip.showAt(position, "<p>移动控制点</p>");
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
            // _this.tooltip.showAt(position, "<p>移动控制点</p>");

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
    _showRegion2Map() {
        let _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(_this.outlineColor)
        });
        // }

        let dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                let lonLats = _this._getLonLatArr(_this.positions);
                let doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                let positions = doubleArrow.polygonalPoint;
                if (positions == null || positions.length < 3) {
                    return null;
                }
                let pHierarchy = new Cesium.PolygonHierarchy(positions);
                return pHierarchy;
            } else {
                return null;
            }
        }, false);
        let outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 2) {
                return null;
            }
            let lonLats = _this._getLonLatArr(_this.positions);
            let doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
            let positions = doubleArrow.polygonalPoint;
            if (positions == null || positions.length < 3) {
                return null;
            }
            let firstPoint = positions[0];
            positions.push(firstPoint);
            return positions;
        }, false);
        let bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                show: _this.fill
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
            bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    }
    _showModifyRegion2Map() {
        let _this = this;

        _this._startModify();
        _this._computeTempPositions();

        let dynamicHierarchy = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                let lonLats = _this._getLonLatArr(_this.positions);
                let doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                let positions = doubleArrow.polygonalPoint;
                if (positions == null || positions.length < 3) {
                    return null;
                }
                let pHierarchy = new Cesium.PolygonHierarchy(positions);
                return pHierarchy;
            } else {
                return null;
            }
        }, false);
        let outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length < 2) {
                return null;
            }
            let lonLats = _this._getLonLatArr(_this.positions);
            let doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
            let positions = doubleArrow.polygonalPoint;
            if (positions == null || positions.length < 2) {
                return null;
            }
            let firstPoint = positions[0];
            positions.push(firstPoint);
            return positions;
        }, false);

        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(_this.outlineColor)
        });
        // }
        let bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                show: _this.fill
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
            bData.polygon.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
            bData.polygon.closeTop = true;
            bData.polygon.closeBottom = true;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        let positions = _this.positions;
        for (let i = 0; i < positions.length; i++) {
            _this._createPoint(positions[i], i);
        }
    }
    _createPoint(cartesian, oid) {
        let _this = this;
        let point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIconLight,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.markers[oid] = point;
        return point;
    }
    _computeTempPositions() {
        let _this = this;

        let pnts = [].concat(_this.positions);
        let num = pnts.length;
        let first = pnts[0];
        let last = pnts[num - 1];
        if (_this._isSimpleXYZ(first, last) == false) {
            pnts.push(first);
            num += 1;
        }
        _this.tempPositions = [];
        for (let i = 1; i < num; i++) {
            let p1 = pnts[i - 1];
            let p2 = pnts[i];
            let cp = _this._computeCenterPotition(p1, p2);
            _this.tempPositions.push(p1);
            _this.tempPositions.push(cp);
        }
    }
    _computeCenterPotition(p1, p2) {
        let _this = this;
        let c1 = _this.ellipsoid.cartesianToCartographic(p1);
        let c2 = _this.ellipsoid.cartesianToCartographic(p2);
        let cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        let cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
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
        // let html = '<div id="shapeEditContainer" style="padding: 10px 10px;">' +
        //     '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>' +
        //     '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>' +
        //     '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">' +
        //     '    </div>' +
        //     '</div>';
        // let html = `<div id="shapeEditContainer" style="color:black; height:300px;width:350px">
        //                 <div id="shapeEditRTCorner">攻击箭头</div>
        //                 <hr>
        //                 <div>
        //                     <label>名称:</label><input id="attackArrowName" type="text" value="攻击箭头"/>
        //                     </div>
        //                     <div>
        //                     <!-- <label>贴地</label> -->
        //                     <!-- <input id="clamp" type="checkbox" name="clamp" checked> -->
        //                     <label>边框</label>
        //                     <input id="outline" type="checkbox" name="outline" checked>
        //                     </div>
        //                     <div>
        //                     <!-- <label>拉伸</label> -->
        //                     <!--  <input type="number" style="width:100px" id="pullHeight"> -->
        //                     <!-- <label>米</label> -->
        //                     <label>颜色</label>
        //                     <span class="attackArrow-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;margin:0;"></span>
        //                     <label>边框颜色</label>
        //                     <span class="attackArrow-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;margin:0;"></span>
        //                     </div>
        //                    <!-- <div><label>边框宽度</label><input id="outlineWidth" type="range" min="1" max="100" step="1"/></div> -->
        //                 <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
        //                 <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
        //                 <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
        //                 </div>
        //                 </div>
        // </div>
        // `
        let html = `<div id="shapeEditContainer" style="color:#ffffff; height:300px;width:400px">
        <div id="shapeEditRTCorner">攻击箭头</div>
       
        <div  style="margin-left: 10%; margin-top: 5%;">
            <label>名称:</label><input style="background: rgba(30,32,45,0.9);    margin-left: 3%; color: #ffffff;    font-size: 14px;
            width: 200px;
            height: 25px;
            text-indent: 10px;outline:none; border:none;" id="attackArrowName" type="text" value="攻击箭头"/>
            </div>
            <div  style="margin-left: 10%; margin-top: 5%;">
            <!-- <label>贴地</label> -->
            <!-- <input id="clamp" type="checkbox" name="clamp" checked> -->
            <label>边框：</label>
            <input id="outline" type="checkbox" name="outline" checked>
            </div>
            <div  style="margin-left: 10%; margin-top: 5%;">
            <!-- <label>拉伸</label> -->
            <!--  <input type="number" style="width:100px" id="pullHeight"> -->
            <!-- <label>米</label> -->
            <label style="top: 50.5%;">颜色：</label>
            <span class="attackArrow-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;"></span>
            <label style="top: 50.5%; left: 32%;">边框颜色：</label>
            <span class="attackArrow-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;"></span>
            </div>
           <!-- <div><label>边框宽度</label><input id="outlineWidth" type="range" min="1" max="100" step="1"/></div> -->
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
                let lonLats = _this._getLonLatArr(_this.positions);
                let doubleArrow = xp.algorithm.tailedAttackArrow(lonLats);
                let positions = doubleArrow.polygonalPoint;
                let custom = doubleArrow.controlPoint;
                _this.params.color = _this.shapeColor;
                _this.params.ground = _this.ground;
                _this.params.name = _this.shapeName;
                _this.params.outline = _this.outline;
                _this.params.outlineColor = _this.outlineColor;
                _this.params.outlineWidth = _this.outlineWidth;
                _this.okHandler(positions, custom,_this.params);
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
            alt: cartographic.height
        };
        pos.lon = Cesium.Math.toDegrees(pos.lon);
        pos.lat = Cesium.Math.toDegrees(pos.lat);
        return pos;
    }
    _getLonLatArr(positions) {
        let _this = this;
        let arr = [];
        for (let i = 0; i < positions.length; i++) {
            let p = _this._getLonLat(positions[i]);
            if (p != null) {
                arr.push([p.lon, p.lat]);
            }
        }
        return arr;
    }
    _isSimpleXYZ(p1, p2) {
        if (p1.x == p2.x && p1.y == p2.y && p1.z == p2.z) {
            return true;
        }
        return false;
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
    _clearAnchors() {
        let _this = this;
        for (let key in _this.markers) {
            let m = _this.markers[key];
            _this.viewer.entities.remove(m);
        }
        _this.markers = {};
    }
    setAttribute() {
        let _this = this;
        // 设置图形拉伸
        $('#pullHeight').bind('input propertychange', function () {
            // _this.ground = false;
            let height = $("#pullHeight").val();
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

            // let positions = [];
            // for (let i = 0; i < _this.tempPositions.length; i += 2) {
            //     let p = _this.tempPositions[i];
            //     positions.push(p);
            // }
            // _this.positions = positions;

            _this._showModifyRegion2Map();
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
        // $(".attackArrow-shapecolor-paigusu").paigusu({
        //     color: "228,235,41,0.8", //初始色  支持两种配置方案
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

        // // 设置边框颜色
        // $(".attackArrow-border-paigusu").paigusu({
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
        let checked = true;
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
        $('#attackArrowName').bind('input propertychange', function () {
            let val = $("#attackArrowName").val();
            _this.shapeName = val;
        })

        // 设置边框宽度
        $("#outlineWidth").on('input propertychange', () => {
            let val = $("#outlineWidth").val();
            _this.outlineWidth = val;
            _this.entity.polyline.width = _this.outlineWidth;
        });
    }
    initPanelData() {
        let _this = this;
        $("#attackArrowName").val(_this.shapeName); // 设置面板中的图形名称
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

        $(".attackArrow-shapecolor-paigusu").css("background", _this.shapeColor); //  设置图形颜色span的背景色
        $(".attackArrow-border-paigusu").css("background", _this.outlineColor); //  设置边框颜色span的背景色
    }
    resetParams() {
        let _this = this;
        _this.params = {
            color: "rgba(228,235,41,0.6)",
            outline: true,
            extrudedHeight: undefined,
            ground: true,
            outlineColor: "#00f",
            name: '攻击箭头',
            outlineWidth: 2,
        };
        _this.shapeColor = "rgba(228,235,41,0.6)";
        _this.outline = true;
        _this.extrudedHeight = undefined;
        _this.ground = true;
        _this.outlineColor = "#00f";
        _this.shapeName = "攻击箭头";
        _this.outlineWidth = 2;
    }
}