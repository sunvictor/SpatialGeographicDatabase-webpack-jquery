import layer from "layer-src"

export default class GlobeRectangleDrawer {
    viewer = null;
    scene = null;
    clock = null;
    canvas = null;
    camera = null;
    ellipsoid = null;
    tooltip = null;
    entity = null;
    positions = [];
    drawHandler = null;
    modifyHandler = null;
    okHandler = null;
    cancelHandler = null;
    dragIconLight = "../../../../img/plot/bluePoint.png";
    material = null;
    outlineMaterial = null;
    fill = true;
    outline = true;
    outlineWidth = 2;
    extrudedHeight = 0;
    toolBarIndex = null;
    layerId = "globeEntityDrawerLayer";
    params = {}; // 封装需要传递的参数
    ground = true; // 图形是否贴地
    shapeColor = null;
    outlineColor = null;
    shapeName = null;

    constructor(viewer) {
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
        }
        _this._clearMarkers(_this.layerId);
        // _this.tooltip.setVisible(false);

        $("#shapeEditContainer").hide();
    }

    clear2() {
        var _this = this;
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

    showModifyRectangle(positions, oldParams, okHandler, cancelHandler) {
        var _this = this;
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
        _this._startModify();
    }

    start(okHandler, cancelHandler) {
        var _this = this;
        _this.okHandler = okHandler;
        _this.cancelHandler = cancelHandler;

        _this.positions = [];
        var floatingPoint = null;

        // var definedColor = $("#paigusu").data("color2");
        // if (definedColor) {
        //     _this.shapeColor = "rgba(" + definedColor + ")"; // 设置自定义的绘图颜色
        // }

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
            if (num == 0) {
                _this.positions.push(cartesian);
                floatingPoint = _this._createPoint(cartesian, -1);
                _this._showRegion2Map();
            }
            _this.positions.push(cartesian);
            var oid = _this.positions.length - 2;
            _this._createPoint(cartesian, oid);
            if (num > 1) {
                _this.positions.pop();
                _this.viewer.entities.remove(floatingPoint);
                // _this.tooltip.setVisible(false);
                _this._startModify();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        _this.drawHandler.setInputAction(function (event) {
            var position = event.endPosition;
            if (!Cesium.defined(position)) {
                return;
            }
            if (_this.positions.length < 1) {
                //   _this.tooltip.showAt(position, "<p>选择起点</p>");
                return;
            }
            //  _this.tooltip.showAt(position, "<p>选择终点</p>");

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
    }

    _startModify() {
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
                _this.positions[oid] = cartesian;
                // _this.tooltip.setVisible(false);
            } else {
                var pickedObject = _this.scene.pick(position);
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
                //  _this.tooltip.showAt(position, "<p>移动控制点</p>");
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
            pickedAnchor.position.setValue(cartesian);
            var oid = pickedAnchor.oid;
            _this.positions[oid] = cartesian;
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    _createPoint(cartesian, oid) {
        var _this = this;
        var point = viewer.entities.add({
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
        var _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(_this.outlineColor)
        });
        // }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                return rect;
            } else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
                var positions = Cesium.Cartesian3.fromRadiansArray(arr);
                return positions;
            } else {
                return null;
            }
        }, false);
        var bData = {
            rectangle: {
                coordinates: dynamicPositions,
                material: _this.material,
                show: _this.fill
            },
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (_this.extrudedHeight > 0) {
            bData.rectangle.extrudedHeight = _this.extrudedHeight;
            bData.rectangle.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            bData.rectangle.closeTop = true;
            bData.rectangle.closeBottom = true;
            bData.rectangle.outline = false;
            bData.rectangle.outlineWidth = 0;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
    }

    _showModifyRegion2Map() {
        var _this = this;
        // if (_this.material == null) {
        _this.material = Cesium.Color.fromCssColorString(_this.shapeColor);
        // }
        // if (_this.outlineMaterial == null) {
        _this.outlineMaterial = new Cesium.PolylineDashMaterialProperty({
            dashLength: 16,
            color: Cesium.Color.fromCssColorString(_this.outlineColor)
        });
        // }
        var dynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                return rect;
            } else {
                return null;
            }
        }, false);
        var outlineDynamicPositions = new Cesium.CallbackProperty(function () {
            if (_this.positions.length > 1) {
                var rect = Cesium.Rectangle.fromCartesianArray(_this.positions);
                var arr = [rect.west, rect.north, rect.east, rect.north, rect.east, rect.south, rect.west, rect.south, rect.west, rect.north];
                var positions = Cesium.Cartesian3.fromRadiansArray(arr);
                return positions;
            } else {
                return null;
            }
        }, false);
        var bData = {
            rectangle: {
                coordinates: dynamicPositions,
                material: _this.material,
                show: _this.fill
            },
            polyline: {
                positions: outlineDynamicPositions,
                clampToGround: true,
                width: _this.outlineWidth,
                material: _this.outlineMaterial,
                show: _this.outline
            }
        };
        if (_this.extrudedHeight > 0) {
            bData.rectangle.extrudedHeight = _this.extrudedHeight;
            bData.rectangle.extrudedHeightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            bData.rectangle.closeTop = true;
            bData.rectangle.closeBottom = true;
            bData.rectangle.outline = false;
            bData.rectangle.outlineWidth = 0;
        }

        if (!_this.ground) {
            // bData.rectangle.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            // bData.rectangle.height = 1000;
            // bData.rectangle.extrudedHeightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        }
        _this.entity = _this.viewer.entities.add(bData);
        _this.entity.layerId = _this.layerId;
        var positions = _this.positions;
        for (var i = 0; i < positions.length; i++) {
            _this._createPoint(positions[i], i);
        }
    }

    _computeRectangle(p1, p2) {
        var _this = this;
        var c1 = _this.ellipsoid.cartesianToCartographic(p1);
        var c2 = _this.ellipsoid.cartesianToCartographic(p2);
        var rect = Cesium.Rectangle.fromCartesianArray([p1, p2]);
        return rect;
    }

    _showToolBar() {
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
            area: ['400px', '300px'],
            skin: 'layui-draw-alert',
        });
        var cssSel = "#layui-layer" + _this.toolBarIndex + " .layui-layer-close2";
        $(cssSel).hide();
    }

    _createToolBar() {
        var _this = this;
        var objs = $("#shapeEditContainer");
        objs.remove();
        // var html = '<div id="shapeEditContainer" style="padding: 10px 10px;">'
        //          + '    <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal">  确定 </button>'
        //          + '    <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger">  取消 </button>'
        //          + '    <div id="shapeEditRTCorner" style="width: 16px; position: absolute; right: 0px; top: 0px; bottom: 0px">'
        //          + '    </div>'
        //          + '</div>';
//         var html = `<div id="shapeEditContainer" style="color:black; height:300px;width:350px">
//                  <div id="shapeEditRTCorner">矩形</div>
//                  <hr>
//                  <div>
//                      <label>名称:</label><input id="rectangleName" type="text" value="矩形"/>
//                      </div>
//                      <div>
//                     <!-- <label>贴地</label>
//                      <input id="clamp" type="checkbox" name="clamp" checked> -->
//                      <label>边框</label>
//                      <input id="outline" type="checkbox" name="outline" checked>
//                      </div>
//                      <div>
//                   <!-- <label>拉伸</label>
//                      <input type="number" style="width:100px" id="pullHeight">
//                      <label>米</label> -->
//                      <label>颜色</label>
//                      <span class="rectangle-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;margin:0;"></span>
//                      <label>边框颜色</label>
//                      <span class="rectangle-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;margin:0;"></span>
//                      </div>
//                      <div><label>边框宽度</label><input id="outlineWidth" type="range" min="1" max="100" step="1"/></div>
//                  <div style="position: absolute;bottom: 10px;right: 10px;" class="layerBtn">
//                  <button name="btnOK" class="layui-btn layui-btn-xs layui-btn-normal"> 确定 </button>
//                  <button name="btnCancel" class="layui-btn layui-btn-xs layui-btn-danger"> 取消 </button>
//                  </div>
//                  </div>
//  </div>
//  `
        var html = `<div id="shapeEditContainer" style="color:#ffffff; height:300px;width:400px">
<div id="shapeEditRTCorner">矩形</div>

<div style="margin-left: 10%; margin-top: 5%;">
    <label>名称:</label><input style="background: rgba(30,32,45,0.9);    margin-left: 3%; color: #ffffff;    font-size: 14px;
    width: 200px;
    height: 25px;
    text-indent: 10px;outline:none; border:none;" id="rectangleName" type="text" value="矩形"/>
    </div>
    <div  style="margin-left: 10%; margin-top: 5%;">
    <label style="display: inline-block;
    margin-left: 5%;">边框：</label>
    <input id="outline" type="checkbox" name="outline" checked>
    </div>
    <div style="margin-left: 10%; margin-top: 5%;">
    <label style="top: 50.5%;">颜色：</label>
    <span class="rectangle-shapecolor-paigusu" style="width:25px;height:25px;background:rgba(228,235,41,1.0);display:inline-block;"></span>
    <label style=" top: 50.5%; left: 32%;">边框颜色：</label>
    <span class="rectangle-border-paigusu" style="width:25px;height:25px;background:rgba(38,57,167,1.0);display:inline-block;"></span>
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
        var btnOK = $("#shapeEditContainer button[name='btnOK']");
        var btnCancel = $("#shapeEditContainer button[name='btnCancel']");
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

    setAttribute() {
        var _this = this;
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
        // $(".rectangle-shapecolor-paigusu").paigusu({
        //     color: "228,235,41,0.6", //初始色  支持两种配置方案
        // }, function (event, obj) {
        //     // console.log(event);
        //     // console.log(obj);
        //     $(event).data('color', "rgba(" + obj.rgba + ")"); // 用于changeColor.js使用，格式 rgba(25,38,220,0.1);
        //     $(event).data('color2', obj.rgba); // 用于paigusu.min.js使用，获取当前颜色 格式 25,38,220,1
        //     $(event).css('background', "rgba(" + obj.rgb + ")"); // 设置页面盒子的背景颜色
        //     // color = "rgba("+obj.rgba+")";
        //     _this.shapeColor = "rgba(" + obj.rgba + ")";
        //     _this.entity.rectangle.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function () {
        //         _this.material = Cesium.Color.fromCssColorString("rgba(" + obj.rgba + ")");
        //         return _this.material;
        //     }, false));
        // });

        // // 设置边框颜色
        // $(".rectangle-border-paigusu").paigusu({
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
                _this.clear2();
                // var positions = [];
                // for (var i = 0; i < _this.tempPositions.length; i += 2) {
                //     var p = _this.tempPositions[i];
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
                // var positions = [];
                // for (var i = 0; i < _this.tempPositions.length; i += 2) {
                //     var p = _this.tempPositions[i];
                //     positions.push(p);
                // }
                // _this.positions = positions;

                _this._showModifyRegion2Map();
            });
        })

        // 修改图形名称
        $('#rectangleName').bind('input propertychange', function () {
            var val = $("#rectangleName").val();
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
        $("#rectangleName").val(_this.shapeName); // 设置面板中的图形名称
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
        $("#outlineWidth").val(_this.outlineWidth);
        $(".rectangle-shapecolor-paigusu").css("background", _this.shapeColor); //  设置图形颜色span的背景色
        $(".rectangle-border-paigusu").css("background", _this.outlineColor); //  设置边框颜色span的背景色
    }

    resetParams() {
        var _this = this;
        _this.params = {
            color: "rgba(228,235,41,0.5)",
            outline: true,
            ground: true,
            outlineColor: "#00f",
            name: '矩形',
            outlineWidth: 2,
        };
        _this.shapeColor = "rgba(228,235,41,0.5)";
        _this.outline = true;
        _this.ground = true;
        _this.outlineColor = "#00f";
        _this.shapeName = "矩形";
        _this.outlineWidth = 2;
    }
}