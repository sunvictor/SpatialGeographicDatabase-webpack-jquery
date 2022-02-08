export default class GlobePolylineDrawer {
    viewer= null;
    scene= null;
    clock= null;
    canvas= null;
    camera= null;
    ellipsoid= null;
    tooltip= null;
    entity= null;
    positions= [];
    tempPositions= [];
    drawHandler= null;
    modifyHandler= null;
    okHandler= null;
    cancelHandler= null;
    dragIcon= "../../../../img/plot/tempMidPoint.png";
    dragIconLight= "../../../../img/plot/editPoint.png";
    material= null;
    toolBarIndex= null;
    markers= {};
    layerId= "globeDrawerLayer";
    width= 8;
    shapeColor= null;
    params= {};
    shapeName= '折线';
    floatingPoint= null;
    constructor() {
        this.init.apply(this, arguments);
    }
    init(viewer) {
        var _this = this;
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
        }
        _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);

        $("#shapeEditContainer").hide(); // 设置确定按钮隐藏
    }
    showModifyPolyline(positions, oldParams, okHandler, cancelHandler) {
        var _this = this;
        _this.positions = positions;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;
        _this.params = oldParams;
        _this.shapeColor = _this.params.color;
        _this.shapeName = _this.params.name;
        _this.width = _this.params.width;
        _this._showModifyPolyline2Map();
    }
    start(okHandler, cancelHandler) {
        var _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;

        _this.positions = [];
        // var _this.floatingPoint = null;

        // var definedColor = $("#paigusu").data("color2");
        let definedColor;
        if (definedColor) {
            _this.shapeColor = "rgba(" + definedColor + ")"; // 设置自定义的绘图颜色
        }

        _this.drawHandler = new Cesium.ScreenSpaceEventHandler(_this.canvas);

        _this.drawHandler.setInputAction(function (event) {
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
            if (num == 1) { // 原为 num == 0 因在移动事件中新增的一个点，所以等于1
                _this.positions.pop(); // 新增 将移动事件中的第一个点移除
                _this.positions.push(cartesian);
                _this.floatingPoint = _this._createPoint(cartesian, -1);
                _this._showPolyline2Map();
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
            // if (_this.positions.length < 1) {
            //     // _this.tooltip.showAt(position, "<p>选择起点</p>");
            //     return;
            // }
            var num = _this.positions.length;
            var tip = "<p>点击添加下一个点</p>";
            if (num > 2) {
                tip += "<p>右键结束绘制</p>";
            }
            //   _this.tooltip.showAt(position, tip);

            var ray = _this.camera.getPickRay(position);
            if (!Cesium.defined(ray)) {
                return;
            }
            var cartesian = _this.scene.globe.pick(ray, _this.scene);
            if (!Cesium.defined(cartesian)) {
                return;
            }
            if (_this.positions.length < 1) { //新增 让点击按钮后马上有标记点随鼠标移动
                _this.positions.push(cartesian); //新增
                _this.floatingPoint = _this._createPoint(cartesian, -1); //新增
            } else {
                _this.floatingPoint.position.setValue(cartesian);
                _this.positions.pop();
                _this.positions.push(cartesian);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        _this.drawHandler.setInputAction(function (movement) {
            if (_this.positions.length < 3) {
                return;
            }
            _this.positions.pop();
            _this.viewer.entities.remove(_this.floatingPoint);
            // _this.tooltip.setVisible(false);

            //进入编辑状态
            _this.clear();
            _this._showModifyPolyline2Map();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    }
    _startModify(){
        var _this = this;
        var isMoving = false;
        var pickedAnchor = null;
        if (_this.drawHandler) {
            _this.drawHandler.destroy();
            _this.drawHandler = null;
        }
        _this._showToolBar();

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
                    //   _this.tooltip.showAt(position, "<p>移动控制点</p>");
                }
                if (entity.flag == "mid_anchor") {
                    //   _this.tooltip.showAt(position, "<p>移动创建新的控制点</p>");
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
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    _showPolyline2Map(){
        var _this = this;
        // if (_this.material == null) {
        _this.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString(_this.shapeColor),
        });
        // }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            return _this.positions;
        }, false);
        var bData = {
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: _this.width,
                material: _this.material
            }
        };
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    }
    _showModifyPolyline2Map(){
        var _this = this;

        _this._startModify();
        _this._computeTempPositions();

        var dynamicPositions = new Cesium.CallbackProperty(function () {
            return _this.tempPositions;
        }, false);
        // if (_this.material == null) {
        _this.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString(_this.shapeColor),
        });
        // }
        var bData = {
            polyline: {
                positions: dynamicPositions,
                clampToGround: true,
                width: _this.width,
                material: _this.material
            }
        };
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
        var num = _this.tempPositions.length;
        if (oid == 0 || oid == num - 1) {
            return;
        }
        //重新计算tempPositions
        var p = _this.tempPositions[oid];
        var p1 = _this.tempPositions[oid - 1];
        var p2 = _this.tempPositions[oid + 1];

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

        if (oid == 0) {
            var c3 = _this._computeCenterPotition(c4, c);
            _this.tempPositions[oid3] = c3;
            _this.markers[oid3].position.setValue(c3);
        } else if (oid == num - 1) {
            var c2 = _this._computeCenterPotition(c1, c);
            _this.tempPositions[oid2] = c2;
            _this.markers[oid2].position.setValue(c2);
        } else {
            var c2 = _this._computeCenterPotition(c1, c);
            var c3 = _this._computeCenterPotition(c4, c);
            _this.tempPositions[oid2] = c2;
            _this.tempPositions[oid3] = c3;
            _this.markers[oid2].position.setValue(c2);
            _this.markers[oid3].position.setValue(c3);
        }
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
        point.sid = cartesian.sid; //记录原始序号
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
    _computeTempPositions(){
        var _this = this;

        var pnts = [].concat(_this.positions);
        var num = pnts.length;
        _this.tempPositions = [];
        for (var i = 1; i < num; i++) {
            var p1 = pnts[i - 1];
            var p2 = pnts[i];
            p1.sid = i - 1;
            p2.sid = i;
            var cp = _this._computeCenterPotition(p1, p2);
            _this.tempPositions.push(p1);
            _this.tempPositions.push(cp);
        }
        var last = pnts[num - 1];
        _this.tempPositions.push(last);
    }
    _computeCenterPotition(p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var cm = new Cesium.EllipsoidGeodesic(c1, c2).interpolateUsingFraction(0.5);
        var cp = _this.ellipsoid.cartographicToCartesian(cm);
        return cp;
    }
    _showToolBar(){
        var _this = this;
        _this._createToolBar();
        var width = $(window).width();
        var wTop = 300;
        // var wLeft = parseInt((width - 145) / 2);
        var wLeft = 600;
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
        var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    }
    _createToolBar(){
        var _this = this;
        var objs = $("#shapeEditContainer");
        objs.remove();
        // var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
        //          + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>'
        //          + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>'
        //          + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
        //          + '    </div>'
        //          + '</div>';
//         var html = `<div id="shapeEditContainer" style="color:black; height:300px;width:350px">
//         <div id="shapeEditRTCorner">折线</div>
//         <hr>
//         <div>
//             <label>名称:</label><input id="polylineName" type="text" value="折线"/>
//             </div>
//             <div>
//           <!--  <label>贴地</label>
//             <input id="clamp" type="checkbox" name="clamp" checked> -->
//             <div>
//             <label>颜色</label>
//             <span class="polyline-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;margin:0;"></span>
//             </div>
//            <div><label>宽度</label><input id="polylineWidth" type="range" min="1" max="100" step="1"/></div>
//         <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
//         <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
//         <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
//         </div>
//         </div>
// </div>
// `
        var html = `<div id="shapeEditContainer" >
<div id="shapeEditRTCorner">折线</div>

<div style="margin-left: 10%; margin-top: 5%;">
    <label>名称:</label><input style="background: rgba(30,32,45,0.9);    margin-left: 3%; color: #ffffff;    font-size: 14px;
    width: 200px;
    height: 25px;
    text-indent: 10px;outline:none; border:none;" id="polylineName" type="text" value="折线"/>
    </div>
    <div style="margin-top: 5%;">
  <!--  <label style="font-size: 14px;
  margin-left: 10%;">贴地</label>
    <input id="clamp" type="checkbox" name="clamp" checked> -->
    <div style="margin-left: 10%;">
    <label style="    position: relative; top: 38%;">颜色：</label>
    <span class="polyline-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;"></span>
    </div>
   <div style="margin-left: 10%; margin-top: 5%;"><label>宽度：</label><input style="  width: 200px; margin-left: 1%;position: absolute;" id="polylineWidth" type="range" min="1" max="100" step="1"/></div>
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
        var btnOK = $("#shapeEditContainer button[name='btnOK']");
        var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
        btnOK.unbind("click").bind("click", function () {
            if (_this.okHandler) {
                //var positions = [];
                //for (var i = 0; i < _this.tempPositions.length; i += 2) {
                //    var p = _this.tempPositions[i];
                //    positions.push(p);
                //}
                var positions = _this._getPositionsWithSid();
                var lonLats = _this._getLonLats(positions);
                _this.positions = positions;
                _this.params.color = _this.shapeColor;
                _this.params.width = _this.width;
                _this.params.name = _this.shapeName;
                _this.okHandler(positions, lonLats, _this.params);
                _this.clear();
                layer.close(_this.toolBarIndex);
                _this.resetParams();
            } else {
                _this.clear();
                layer.close(_this.toolBarIndex);
                _this.resetParams();
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
    _getPositionsWithSid(){
        var _this = this;
        var viewer = _this.viewer;
        var rlt = [];
        var entityList = viewer.entities.values;
        if (entityList == null || entityList.length < 1) {
            return rlt;
        }
        for (var i = 0; i < entityList.length; i++) {
            var entity = entityList[i];
            if (entity.layerId != _this.layerId) {
                continue;
            }
            if (entity.flag != "anchor") {
                continue;
            }
            var p = entity.position.getValue(new Date().getTime());
            p.sid = entity.sid;
            p.oid = entity.oid;
            rlt.push(p);
        }
        //排序
        rlt.sort(function (obj1, obj2) {
            if (obj1.oid > obj2.oid) {
                return 1;
            } else if (obj1.oid == obj2.oid) {
                return 0;
            } else {
                return -1;
            }
        });
        return rlt;
    }
    _getLonLat(cartesian) {
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
    _getLonLats(positions) {
        var _this = this;
        var arr = [];
        for (var i = 0; i < positions.length; i++) {
            var c = positions[i];
            var p = _this._getLonLat(c);
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
    _clearAnchors(){
        var _this = this;
        for (var key in _this.markers) {
            var m = _this.markers[key];
            _this.viewer.entities.remove(m);
        }
        _this.markers = {};
    }
    setAttribute(){
        var _this = this;
        // 设置图形颜色
        $(".polyline-shapecolor-paigusu").paigusu({
            color: "228,235,41,0.6", //初始色  支持两种配置方案
        }, function (event, obj) {
            // console.log(event);
            // console.log(obj);
            $(event).data('color', "rgba(" + obj.rgba + ")"); // 用于changeColor.js使用，格式 rgba(25,38,220,0.1);
            $(event).data('color2', obj.rgba); // 用于paigusu.min.js使用，获取当前颜色 格式 25,38,220,1
            $(event).css('background', "rgba(" + obj.rgb + ")"); // 设置页面盒子的背景颜色
            // color = "rgba("+obj.rgba+")";
            _this.shapeColor = "rgba(" + obj.rgba + ")";
            // _this.entity.polyline.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
            //     _this.material = Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")");
            //     return _this.material;
            // }, false));
            _this.entity.polyline.material = new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.25,
                color: Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")"),
            });
        });
        // 设置边框宽度
        $("#polylineWidth").on('input propertychange', () => {
            var val = $("#polylineWidth").val();
            _this.width = val;
            _this.entity.polyline.width = _this.width;
        });

        // 修改图形名称
        $('#polylineName').bind('input propertychange', function () {
            var val = $("#polylineName").val();
            _this.shapeName = val;
        })
    }
    initPanelData(){
        var _this = this;
        $("#polylineName").val(_this.shapeName); // 设置面板中的图形名称
        // $("#clamp").

        $(".polyline-shapecolor-paigusu").css("background", _this.shapeColor); //  设置图形颜色span的背景色
        $("#polylineWidth").val(_this.width); //设置折线宽度
    }
    resetParams(){
        var _this = this;
        _this.params = {
            color: "rgba(228,235,41,0.6)",
            name: '折线',
            width: 8,
        };
        _this.shapeColor = "rgba(228,235,41,0.6)";
        _this.shapeName = "折线";
        _this.width = 8;
    }
}