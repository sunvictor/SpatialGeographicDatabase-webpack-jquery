import gykjPanel from "@/js/plugins/panel";
import {go} from "@/js/cesium/globalObject";
import pm from "@/js/plugins/publicMethod";
import cm from "@/js/plugins/CesiumMethod";

let _btnName = "添加模型"
let _btnIdName = "addModel"
export default class ModelControl {
    viewModel = {
        enabled: false
    };

    constructor(viewer) {
        this.viewer = viewer;
        this.init();
        this.bindModel();
    }

    init() {
        let _this = this;
        let html = `<div><input type="text" id="modelUrl">
                    <button id="addModelBtn">确定</button>
                    </div>`
        _this.modelPanel = new gykjPanel({
            title: "添加模型",
            show: false,
            width: 400,
            height: 200,
            left: 550,
            content: html,
            closeType: "hide",
            callback: {
                closePanel: closeLayerPanel
            }
        })

        function closeLayerPanel() {
            _this.viewModel.enabled = false
        }

        _this.addPanelEvents();
    }

    add(options, params) {
        let _this = this;
        if (!options) {
            return;
        }
        let o = {
            scale: 1,
            color: "color()",
            name: "3D模型",
            lon: 0,
            lat: 0,
            rotation: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        pm.setOptions(o, options);
        if (!params) {
            params = {}
        }
        let show = true;
        if (typeof options.show != "undefined") {
            show = options.show
        }
        let tileParams = {
            url: o.url,
            show: show,
            maximumScreenSpaceError: 19.698310613518657, //最大屏幕空间误差
            maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
        }
        pm.setOptions(tileParams, params);
        let tileset = new Cesium.Cesium3DTileset(tileParams);
        let tileId = (new Date()).getTime();
        tileset.name = o.name ? o.name : "3D模型";
        tileset.coordinate = [o.lon, o.lat]; // 将模型的经纬度保存起来
        tileset.tileId = tileId;
        tileset.scale = o.scale ? o.scale : 1; // 保存模型的缩放级别
        tileset.rotation = o.rotation;
        tileset.originParams = {};
        tileset.originParams.url = o.url;
        tileset.originParams.coordinate = [o.lon, o.lat];
        tileset.originParams.scale = o.scale;
        tileset.originParams.rotation = o.rotation;
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: o.color,
        });
        // console.log(tileset.boundingSphere.center)
        // let coordinate = cm.cartesianToCoordinate(tileset.boundingSphere.center);
        // console.log(coordinate)
        let newNode = {
            name: tileset.name,
            checked: tileset.show
        }
        let node = go.ec.addNode(-1, newNode, tileset)
        tileset.readyPromise.then(function (tileset) {
            var positions = [
                Cesium.Cartographic.fromDegrees(o.lon, o.lat),
            ];
            let terrain = _this.viewer.scene.terrainProvider;
            // let terrainHeight = 300;
            //     let customShaderCode = `
            //     float stc_pl = fract(czm_frameNumber / 70.0) * 3.14159265 * 0.4\n;
            //     float stc_sd = v_stcVertex.z / 15.0 + sin(stc_pl) * 1.5\n;
            //     gl_FragColor *= vec4(stc_sd, stc_sd, stc_sd, 0.4)\n;
            //   `;
            //     cesiumTilesEffect.updateShader(Cesium, customShaderCode);
            if (!o.lon || !o.lat) {
                console.log("无坐标添加模型")
                _this.viewer.scene.primitives.add(tileset);
                let coordinate = cm.cartesianToCoordinate(tileset.boundingSphere.center);
                tileset.coordinate = coordinate;
                tileset.originParams.coordinate = coordinate;
                return;
            }
            let promise = Cesium.sampleTerrainMostDetailed(terrain, positions);

            Cesium.when(promise, function (updatedPositions) {
                let terrainHeight = updatedPositions[0].height;
                tileset.coordinate.push(terrainHeight) // 保存模型的高度
                //跳转到设定的经纬度，地形高度
                let mat = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(o.lon, o.lat, 0));
                tileset._root.transform = mat;
                _this.viewer.scene.primitives.add(tileset)
                //处理当前3D模型的偏移
                let cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center); //获取到倾斜数据中心点的经纬度坐标（弧度）
                let surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height); //534.1134033203125为加载的模型json数据设置的高度
                let position = Cesium.Cartesian3.fromDegrees(o.lon, o.lat, terrainHeight); //正确位置
                let translation = Cesium.Cartesian3.subtract(position, surface, new Cesium.Cartesian3()); //偏移的多少
                tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation); //完成偏移
                tileset.m = Cesium.Matrix4.fromTranslation(translation); //保存模型缩放等级为1的矩阵
                tileset.originPosition = Cesium.Matrix4.fromTranslation(translation); //保存模型的原始矩阵
                // 缩放
                var m1 = Cesium.Matrix3.fromScale(new Cesium.Cartesian3(o.scale, o.scale, o.scale));
                // 再次变换矩阵
                _this.trasnlate(tileset, m1);
                // 设置旋转角度
                _this.rotate(o.rotation.x, o.rotation.y, o.rotation.z, o.scale, tileset);
                // var strMatrix = JSON.stringify(tileset.modelMatrix);
                // tileset.originParams.modelMatrix = JSON.parse(strMatrix);
                var bcenter = JSON.stringify(tileset.boundingSphere.center);
                tileset.originParams.boundingSphereCenter = JSON.parse(bcenter);
                tileset.originParams.modelMatrix = Cesium.Matrix4.clone(tileset.modelMatrix);
            }).otherwise(function (error) {
                console.log(error);
                _this.addModelWithEarthSDK(options, params)
            });
        }).otherwise(function (error) {
            console.log(error);
        })
    }

    addModelWithEarthSDK(options, params) {
        let show = true;
        if (typeof options.show != "undefined") {
            show = options.show
        }
        let o = {
            scale: 1,
            color: "color()",
            name: "3D模型",
            lon: 0,
            lat: 0,
            rotation: {
                x: 0,
                y: 0,
                z: 0
            }
        }
        pm.setOptions(o, options);
        let tileParams = {
            url: o.url,
            show: show,
            maximumScreenSpaceError: 19.698310613518657, //最大屏幕空间误差
            maximumNumberOfLoadedTiles: 1000, //最大加载瓦片个数
        }
        pm.setOptions(tileParams, params);
        let czmObject = {
            "xbsjType": "Tileset",
            "xbsjGuid": "75debf82-c7ef-4eee-aa81-7395e3f306b9",
            "name": o.name ? o.name : "3D模型",
            "url": o.url,
            "enabled": false,
            "xbsjUseOriginTransform": false,
            "xbsjClippingPlanes": {},
            "xbsjCustomShader": {}
        }
        pm.setOptions(czmObject, tileParams)
        let json = {
            "czmObject": czmObject
        }
        _earth.sceneTree.root.children.push(json)
        let index = _this.viewer.scene.primitives._primitives.length - 1
        if (index < 0) index = 0;
        let tileset = _this.viewer.scene.primitives._primitives[index];
        let tileId = (new Date()).getTime();
        tileset.name = o.name ? o.name : "3D模型";
        tileset.coordinate = [o.lon, o.lat]; // 将模型的经纬度保存起来
        tileset.tileId = tileId;
        tileset.scale = o.scale ? o.scale : 1; // 保存模型的缩放级别
        tileset.rotation = o.rotation;
        tileset.originParams = {};
        tileset.originParams.url = o.url;
        tileset.originParams.coordinate = [o.lon, o.lat];
        tileset.originParams.scale = o.scale;
        tileset.originParams.rotation = o.rotation;
        tileset.style = new Cesium.Cesium3DTileStyle({
            color: o.color,
        });
        let newNode = {
            name: o.name,
            checked: tileset.show
        }
        console.log(tileset)
        let node = go.ec.addNode(-1, newNode, tileset)
    }

    trasnlate(tileset, transform) {
        let m = Cesium.Matrix4.clone(tileset.modelMatrix);
        var transformMat = Cesium.Matrix4.fromArray(m);
        var matRotation = Cesium.Matrix4.getMatrix3(transformMat, new Cesium.Matrix3());
        var inverseMatRotation = Cesium.Matrix3.inverse(matRotation, new Cesium.Matrix3());
        var matTranslation = Cesium.Matrix4.getTranslation(transformMat, new Cesium.Cartesian3());

        var transformation = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center);
        var transformRotation = Cesium.Matrix4.getMatrix3(transformation, new Cesium.Matrix3());
        var transformTranslation = Cesium.Matrix4.getTranslation(transformation, new Cesium.Cartesian3());

        var matToTranslation = Cesium.Cartesian3.subtract(matTranslation, transformTranslation, new Cesium.Cartesian3());
        matToTranslation = Cesium.Matrix4.fromTranslation(matToTranslation, new Cesium.Matrix4());

        var matToTransformation = Cesium.Matrix3.multiply(inverseMatRotation, transformRotation, new Cesium.Matrix3());
        matToTransformation = Cesium.Matrix3.inverse(matToTransformation, new Cesium.Matrix3());
        matToTransformation = Cesium.Matrix4.fromRotationTranslation(matToTransformation);

        var rotationTranslation = Cesium.Matrix4.fromRotationTranslation(transform);

        Cesium.Matrix4.multiply(transformation, rotationTranslation, transformation);
        Cesium.Matrix4.multiply(transformation, matToTransformation, transformation);
        Cesium.Matrix4.multiply(transformation, matToTranslation, transformation);
        tileset.modelMatrix = transformation;
        // selectedTile = undefined;
    }

    trasnlate2(tileset, transformin) {
        let m = Cesium.Matrix4.clone(tileset.m);
        var transformMat = Cesium.Matrix4.fromArray(m);
        var matRotation = Cesium.Matrix4.getMatrix3(transformMat, new Cesium.Matrix3());
        var inverseMatRotation = Cesium.Matrix3.inverse(matRotation, new Cesium.Matrix3());
        var matTranslation = Cesium.Matrix4.getTranslation(transformMat, new Cesium.Cartesian3());

        var transformation = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center);
        var transformRotation = Cesium.Matrix4.getMatrix3(transformation, new Cesium.Matrix3());
        var transformTranslation = Cesium.Matrix4.getTranslation(transformation, new Cesium.Cartesian3());

        var matToTranslation = Cesium.Cartesian3.subtract(matTranslation, transformTranslation, new Cesium.Cartesian3());
        matToTranslation = Cesium.Matrix4.fromTranslation(matToTranslation, new Cesium.Matrix4());

        var matToTransformation = Cesium.Matrix3.multiply(inverseMatRotation, transformRotation, new Cesium.Matrix3());
        matToTransformation = Cesium.Matrix3.inverse(matToTransformation, new Cesium.Matrix3());
        matToTransformation = Cesium.Matrix4.fromRotationTranslation(matToTransformation);

        var rotationTranslation = Cesium.Matrix4.fromRotationTranslation(transformin);

        Cesium.Matrix4.multiply(transformation, rotationTranslation, transformation);
        Cesium.Matrix4.multiply(transformation, matToTransformation, transformation);
        Cesium.Matrix4.multiply(transformation, matToTranslation, transformation);
        tileset.modelMatrix = transformation;
    }

    rotate(x, y, z, scale, tileset) {
        var _this = this;
        x = Number(x);
        y = Number(y);
        z = Number(z);
        let anglex = Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(x));
        let angley = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(y));
        let anglez = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(z));

        var m1 = Cesium.Matrix3.fromScale(new Cesium.Cartesian3(scale, scale, scale));

        Cesium.Matrix3.multiply(angley, anglez, angley);
        Cesium.Matrix3.multiply(anglex, angley, anglex);
        Cesium.Matrix3.multiply(anglex, anglez, anglex);
        Cesium.Matrix3.multiply(anglex, m1, anglex);

        _this.trasnlate2(tileset, anglex);
    }

    addPanelEvents() {
        $("#addModelBtn").off('click').on('click', function () {
            let modelUrl = $("#modelUrl").val();
            go.model.add({
                // lon: 106.4140714,
                // lat: 29.8108571,
                url: modelUrl,
                name: "未命名瓦片2"
            })
        })
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById(_btnIdName); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue) // 切换是否选中图片
                _this.modelPanel.show = newValue; // 控制面板显示隐藏
            }
        );
    }
}