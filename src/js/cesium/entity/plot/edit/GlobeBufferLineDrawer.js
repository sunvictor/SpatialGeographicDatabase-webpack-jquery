export default class GlobeBufferLineDrawer {
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
    dragIcon = "./images/circle_gray.png";
    dragIconLight = "./images/circle_red.png";
    material = null;
    lineMaterial = null;
    fill = true;
    line = true;
    lineWidth = 2;
    extrudedHeight = 0;
    radius = 300;
    toolBarIndex = null;
    markers = {};
    layerId = "globeDrawerLayer";
    params = {}; // 封装需要传递的参数
    ground = true; // 图形是否贴地
    shapeColor = null;
    speed = null;
    shapeName = null;
    scope = null;
    animate = true;
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

    clear(){
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
    showModifyBufferLine(positions, radius, oldParams, okHandler, cancelHandler) {
        let _this = this;
        _this.positions = positions;
        _this.radius = radius;
        _this.params = oldParams; // 关于该图形的参数
        _this.shapeColor = _this.params.color;
        _this.shapeName = _this.params.name;
        _this.radius = _this.params.scope;
        _this.speed = _this.params.speed;
        _this.animate = _this.params.animate;
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

        let definedColor = $("#paigusu").data("color2");
        if (definedColor) {
            _this.shapeColor = "rgba(" + definedColor + ")"; // 设置自定义的绘图颜色
        }
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
            let num = _this.positions.length;
            let tip = "<p>点击添加下一个点</p>";
            if (num > 2) {
                tip += "<p>右键结束绘制</p>";
            }
            // _this.tooltip.showAt(position, tip);

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
            if (_this.positions.length < 3) {
                return;
            }
            _this.positions.pop();
            _this.viewer.entities.remove(floatingPoint);
            // _this.tooltip.setVisible(false);
            document.oncontextmenu = function () {  // 禁止右键菜单
                return false;
            }
            layer.prompt({
                title: '请输入缓冲半径（单位m）'
            }, function (value, index, elem) {
                layer.close(index);
                if (value == "" || value == null) {
                    _this.radius = 300;
                } else {
                    _this.radius = value;
                }
                // let value = prompt("请输入缓冲半径（单位米）", 300); // 弹出input框
                // if (value == "" || value == null) {
                //     _this.radius = 300;
                // } else {
                //     _this.radius = value;
                // }
                //进入编辑状态
                _this.clear();
                _this._showModifyRegion2Map();
                document.oncontextmenu = function () {  // 打开右键菜单
                    return true;
                }
            });
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    }
    _startModify(){
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
                _this.tempPositions[oid] = cartesian;
                // _this.tooltip.setVisible(false);
                if (pickedAnchor.flag == "mid_anchor") {
                    _this._updateModifyAnchors(oid);
                }
            } else {
                let pickedObject = _this.scene.pick(position);
                if (!Cesium.defined(pickedObject)) {
                    return;
                }
                if (!Cesium.defined(pickedObject.id)) {
                    return;
                }
                let entity = pickedObject.id;
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
            let oid = pickedAnchor.oid;
            if (pickedAnchor.flag == "anchor") {
                pickedAnchor.position.setValue(cartesian);
                _this.tempPositions[oid] = cartesian;
                //左右两个中点
                _this._updateNewMidAnchors(oid);
            } else if (pickedAnchor.flag == "mid_anchor") {
                pickedAnchor.position.setValue(cartesian);
                _this.tempPositions[oid] = cartesian;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    _showRegion2Map(){
        let _this = this;
        // if (_this.lineMaterial == null) {
        _this.lineMaterial = new Cesium.PolylineGlowMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString('#00f').withAlpha(0.5)
        });
        // }
        let dynamicPositions = new Cesium.CallbackProperty(function () {
            return _this.positions;
        }, false);
        let bData = {
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: _this.lineWidth || 2,
                material: _this.lineMaterial
            }
        };
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    }
    _showModifyRegion2Map(){
        let _this = this;

        _this._startModify();
        _this._computeTempPositions();

        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        // if (_this.lineMaterial == null) {
        // _this.lineMaterial = new Cesium.PolylineDashMaterialProperty({
        //     dashLength: 16,
        //     color: Cesium.Color.fromCssColorString(_this.outlineColor),
        // });
        // }

        let linePositions = new Cesium.CallbackProperty(function () {
            return _this.tempPositions;
        }, false);
        let dynamicHierarchy = new Cesium.CallbackProperty(function () {
            let pnts = _this.computeBufferLine(_this.tempPositions, _this.radius || 1000);
            let pHierarchy = new Cesium.PolygonHierarchy(pnts);
            return pHierarchy;
        }, false);

        let bData = {
            polygon: new Cesium.PolygonGraphics({
                hierarchy: dynamicHierarchy,
                material: _this.material,
                show: _this.fill
            }),
            polyline: {
                positions: linePositions,
                clampToGround: true,
                width: _this.lineWidth || 2,
                material: _this.lineMaterial,
                show: _this.line
            }
        };
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        let positions = _this.tempPositions;
        for (let i = 0; i < positions.length; i++) {
            let ys = i % 2;
            if (ys == 0) {
                _this._createPoint(positions[i], i);
            } else {
                _this._createMidPoint(positions[i], i);
            }
        }
    }
    _updateModifyAnchors(oid) {
        let _this = this;
        let num = _this.tempPositions.length;
        if (oid == 0 || oid == num - 1) {
            return;
        }
        //重新计算tempPositions
        let p = _this.tempPositions[oid];
        let p1 = _this.tempPositions[oid - 1];
        let p2 = _this.tempPositions[oid + 1];

        //计算中心
        let cp1 = _this._computeCenterPotition(p1, p);
        let cp2 = _this._computeCenterPotition(p, p2);

        //插入点
        let arr = [cp1, p, cp2];
        _this.tempPositions.splice(oid, 1, cp1, p, cp2);

        //重新加载锚点
        _this._clearAnchors(_this.layerId);
        let positions = _this.tempPositions;
        for (let i = 0; i < positions.length; i++) {
            let ys = i % 2;
            if (ys == 0) {
                _this._createPoint(positions[i], i);
            } else {
                _this._createMidPoint(positions[i], i);
            }
        }
    }
    _updateNewMidAnchors(oid) {
        let _this = this;
        if (oid == null || oid == undefined) {
            return;
        }
        //左边两个中点，oid2为临时中间点
        let oid1 = null;
        let oid2 = null;
        //右边两个中点，oid3为临时中间点
        let oid3 = null;
        let oid4 = null;

        let num = _this.tempPositions.length;
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

        let c1 = _this.tempPositions[oid1];
        let c = _this.tempPositions[oid];
        let c4 = _this.tempPositions[oid4];

        if (oid == 0) {
            let c3 = _this._computeCenterPotition(c4, c);
            _this.tempPositions[oid3] = c3;
            _this.markers[oid3].position.setValue(c3);
        } else if (oid == num - 1) {
            let c2 = _this._computeCenterPotition(c1, c);
            _this.tempPositions[oid2] = c2;
            _this.markers[oid2].position.setValue(c2);
        } else {
            let c2 = _this._computeCenterPotition(c1, c);
            let c3 = _this._computeCenterPotition(c4, c);
            _this.tempPositions[oid2] = c2;
            _this.tempPositions[oid3] = c3;
            _this.markers[oid2].position.setValue(c2);
            _this.markers[oid3].position.setValue(c3);
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
        point.sid = cartesian.sid; //记录原始序号
        point.layerId = _this.layerId;
        point.flag = "anchor";
        _this.markers[oid] = point;
        return point;
    }
    _createMidPoint(cartesian, oid) {
        let _this = this;
        let point = viewer.entities.add({
            position: cartesian,
            billboard: {
                image: _this.dragIcon,
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, -500)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
            }
        });
        point.oid = oid;
        point.layerId = _this.layerId;
        point.flag = "mid_anchor";
        _this.markers[oid] = point;
        return point;
    }
    _computeTempPositions(){
        let _this = this;

        let pnts = [].concat(_this.positions);
        let num = pnts.length;
        _this.tempPositions = [];
        for (let i = 1; i < num; i++) {
            let p1 = pnts[i - 1];
            let p2 = pnts[i];
            p1.sid = i - 1;
            p2.sid = i;
            let cp = _this._computeCenterPotition(p1, p2);
            _this.tempPositions.push(p1);
            _this.tempPositions.push(cp);
        }
        let last = pnts[num - 1];
        _this.tempPositions.push(last);
    }
    _computeCenterPotition(p1, p2) {
        let _this = this;
        let c1 = _this.ellipsoid.cartesianToCartographic(p1);
        let c2 = _this.ellipsoid.cartesianToCartographic(p2);
        let cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        let cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
    }
    _showToolBar(){
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
    _createToolBar(){
        let _this = this;
        let objs = $("#shapeEditContainer");
        objs.remove();
        // let html = '<div id="shapeEditContainer" style="padding: 10px 10px;">' +
        //     '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>' +
        //     '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger">  取消 </button>' +
        //     '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">' +
        //     '    </div>' +
        //     '</div>';
//         let html = `<div id="shapeEditContainer" style="color:black; height:300px;width:350px">
//         <div id="shapeEditRTCorner">缓冲区</div>
//         <hr>
//         <div>
//             <label>名称:</label><input id="bufferlineName" type="text" value="缓冲区"/>
//             </div>
//           <div>
//           <!-- <label>贴地</label>
//             <input id="clamp" type="checkbox" name="clamp" checked> -->
//             <label>动画</label>
//             <input id="animate" type="checkbox" name="animate" checked>
//             </div>
//             <div>
//             <label>范围</label>
//             <input type="number" style="width:100px" id="scope">
//             <label>米</label> 
//             <label>颜色</label>
//             <span class="bufferline-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;margin:0;"></span>
//            <!-- <label>边框颜色</label>
//             <span class="bufferline-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;margin:0;"></span> -->
//             </div>
//             <div><label>速度</label><input id="speed" type="range" min="1" max="10" step="1"/></div>
//         <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
//         <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
//         <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
//         </div>
//         </div>
// </div>
// `
        let html = `<div id="shapeEditContainer" style="color:#ffffff; height:300px;width:400px">
<div id="shapeEditRTCorner">缓冲区</div>

<div style="margin-left: 10%; margin-top: 5%;">
    <label>名称:</label><input input style="background: rgba(30,32,45,0.9);    margin-left: 4%; color: #ffffff;    font-size: 14px;
    width: 200px;
    height: 25px;
    text-indent: 10px;outline:none; border:none;" id="bufferlineName" type="text" value="缓冲区"/>
    </div>
  <div style="margin-left: 10%; margin-top: 5%;">
  <!-- <label>贴地：</label>
    <input id="clamp" type="checkbox" name="clamp" checked> -->
    <label>动画：</label>
    <input style="    margin-left: 3%;
    position: absolute;" id="animate" type="checkbox" name="animate" checked>
    </div>
    <div style="margin-left: 10%; margin-top: 5%;">
    <label>范围：</label>
    <input input style="background: rgba(30,32,45,0.9);    margin-left: 1%; color: #ffffff;    font-size: 14px;
    width: 200px;
    height: 25px;
    text-indent: 10px;outline:none; border:none;" type="number" style="width:100px" id="scope">
    <label>米</label> </div>
    <div style="margin-left: 10%; margin-top: 5%;">
    <label style="position: relative; top: 65.5%;">颜色：</label>
    <span class="bufferline-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;"></span>
    </div>
   <!-- <label>边框颜色</label>
    <span class="bufferline-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;margin:0;"></span> -->
    
    <div style="margin-left: 10%; margin-top: 5%;"><label>速度：</label><input style="  width: 200px; margin-left: 1.4%;position: absolute;" id="speed" type="range" min="1" max="10" step="1"/></div>
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
            layer.close(_this.toolBarIndex);
            if (_this.okHandler) {
                let positions = [];
                for (let i = 0; i < _this.tempPositions.length; i += 2) {
                    let p = _this.tempPositions[i];
                    positions.push(p);
                }
                _this.params.color = _this.shapeColor;
                _this.params.name = _this.shapeName;
                _this.params.speed = _this.speed;
                _this.params.scope = _this.radius;
                _this.params.animate = _this.animate;
                _this.positions = positions;
                _this.okHandler(positions, _this.radius, _this.params);
                _this.resetParams();
            }
        });
        btnCancel.unbind("click").bind("click", function () {
            _this.clear();
            layer.close(_this.toolBarIndex);
            if (_this.cancelHandler) {
                _this.cancelHandler();
                _this.resetParams();
            }
        });
    }
    computeBufferLine(positions, radius) {
        let _this = this;
        let arr = [];
        let first = positions[0];
        let num = positions.length;
        for (let i = 0; i < num; i++) {
            let p = _this._cartesian2LonLat(positions[i]);
            if (i == num - 1 && first == p) {
                break;
            }
            arr.push([p.lon, p.lat]);
        }

        let line = turf.lineString(arr);
        let feature = turf.buffer(line, radius * 1, {
            units: 'meters'
        });
        let coordinates = feature.geometry.coordinates;
        if (!coordinates || coordinates.length < 1) {
            return null;
        }
        let pnts = coordinates[0];
        if (!pnts || pnts.length < 3) {
            return null;
        }

        let linePositions = [];
        for (let j = 0; j < pnts.length; j++) {
            let p = pnts[j];
            let c = Cesium.Cartesian3.fromDegrees(p[0], p[1]);
            linePositions.push(c);
        }

        return linePositions;
    }
    _cartesian2LonLat(cartesian) {
        let _this = this;
        //将笛卡尔坐标转换为地理坐标
        let cartographic = _this.ellipsoid.cartesianToCartographic(cartesian);
        //将弧度转为度的十进制度表示
        let pos = {
            lon: Cesium.Math.toDegrees(cartographic.longitude),
            lat: Cesium.Math.toDegrees(cartographic.latitude),
            alt: Math.ceil(cartographic.height)
        };
        return pos;
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
    _getLonLats(positions) {
        let _this = this;
        let arr = [];
        for (let i = 0; i < positions.length; i++) {
            let c = positions[i];
            let p = _this._getLonLat(c);
            p.sid = c.sid;
            p.oid = c.oid;
            arr.push(p);
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
    _clearAnchors(){
        let _this = this;
        for (let key in _this.markers) {
            let m = _this.markers[key];
            _this.viewer.entities.remove(m);
        }
        _this.markers = {};
    }
    setAttribute(){
        let _this = this;
        // 设置图形颜色
        $(".bufferline-shapecolor-paigusu").paigusu({
            color: "228,235,41,0.6", //初始色  支持两种配置方案
        }, function (event, obj) {
            // console.log(event);
            // console.log(obj);
            $(event).data('color', "rgba(" + obj.rgba + ")"); // 用于changeColor.js使用，格式 rgba(25,38,220,0.1);
            $(event).data('color2', obj.rgba); // 用于paigusu.min.js使用，获取当前颜色 格式 25,38,220,1
            $(event).css('background', "rgba(" + obj.rgb + ")"); // 设置页面盒子的背景颜色
            // color = "rgba("+obj.rgba+")";
            _this.shapeColor = "rgba(" + obj.rgba + ")";
            _this.entity.polygon.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
                _this.material = Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")");
                return _this.material;
            }, false));
        });

        // 修改图形名称
        $('#bufferlineName').bind('input propertychange', function () {
            let val = $("#bufferlineName").val();
            _this.shapeName = val;
        })
        // 修改缓冲速度
        $('#speed').bind('input propertychange', function () {
            let val = $("#speed").val();
            _this.speed = val;
        })
        // 修改缓冲范围
        $('#scope').bind('input propertychange', function () {
            let val = $("#scope").val();
            if(Number(val) == 0){
                return;
            }
            _this.radius = val;
        })

        // 设置是否开启动画
        let checked = true;
        $("#animate").click(function () {
            if (checked) {
                _this.animate = false;
                checked = false;
            }
            $('input[name="animate"]:checked').each(function () {
                _this.animate = true;
                checked = true;
            });
        })

    }
    initPanelData(){
        let _this = this;
        $("#bufferlineName").val(_this.shapeName); // 设置面板中的图形名称

        $(".bufferline-shapecolor-paigusu").css("background", _this.shapeColor); //  设置图形颜色span的背景色
        $("#speed").val(_this.speed);
        $("#scope").val(_this.radius);

        if (_this.animate) { // 设置边框显示按钮是否选中
            $("#animate").prop("checked", true);
        } else {
            $("#animate").prop("checked", false);
        }
    }
    resetParams(){
        let _this = this;
        _this.params = {
            color: "rgba(228,235,41,0.5)",
            scope: 300,
            name: '缓冲区',
            speed: 2,
            animate: true,
        };
        _this.shapeColor = "rgba(228,235,41,0.5)";
        _this.shapeName = "缓冲区";
        _this.speed = 2;
        _this.radius = 300;
        _this.animate = true;
    }
}