import layerMap from "./layer/LayerMap";
import gykjPanel from "../plugins/panel";
import {go, globals} from "./globalObject"
import CesiumZh from "../plugins/CesiumZh"

const mapConfig = {
    baseLayerPicker: false,
    homeButton: false,
    animation: true,
    timeline: true,
    geocoder: false,
    infoBox: false,
    selectionIndicator: false,
    sceneModePicker: true,
    // sceneMode: Cesium.SceneMode.SCENE3D, //使用earthsdk切换3d视角要加上这句
    scene3DOnly: false,
    shouldAnimate: true,
    fullscreenButton: false,
    orderIndependentTranslucency: false,
    contextOptions: {
        webgl: {
            alpha: true, // 这个属性如果设置为true,图形在地下部分会更亮，开启地表透明时会特别亮,找了好久这个问题,痛苦😭
            depth: true,
            stencil: true,
            antialias: true,
            premultipliedAlpha: true,
            //通过canvas.toDataURL()实现截图需要将该项设置为true
            preserveDrawingBuffer: true,
            failIfMajorPerformanceCaveat: true
        }
    },
}

function initScene(viewer) {
    // const lm = new layerMap(viewer);
    let oldSatellite = go.lm.add({
        name: "旧卫星图",
        url: "http://222.178.182.14:9010/wmts",
        type: "origin",
        providerType: "WMTS",
        providerProp: {
            tilingScheme: new Cesium.GeographicTilingScheme(),
            format: "image/jpeg",
            style: "default",
            layer: "img",
            tileMatrixSetID: "c",
            tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'],
            maximumLevel: 20,
        }
    })
    let newSatellite = go.lm.add({
        name: "新卫星图",
        url: "http://183.230.114.154:9010/Satellite/{z}/{x}/{y}.png",
        type: "cesiumlab",
        options: {
            saturation: 1.7
        }
    })
    let oldStreet = go.lm.add({
        name: "旧街道图",
        url: "http://222.178.182.14:9010/dataserver?x={x}&y={y}&l={z}&t=cva_c",
        type: "origin",
        providerProp: {
            tilingScheme: new Cesium.GeographicTilingScheme(),
            maximumLevel: 20,
            format: "image/png",
        }
    })
    let trafficMap = go.lm.add({
        name: "腾讯实时路况",
        show: false,
        url: "https://rtt2b.map.qq.com/rtt/?z={z}&x={x}&y={reverseY}&times=1&time=",
        type: "cesiumlab",
        coordType: [go.lm.labCoordTypeDict.GCJ02, go.lm.labCoordTypeDict.WGS84]
    })
    trafficMap.alpha = 0.7

    go.terrain.add({
        name: "中国14级（测试）",
        show: false,
        url: "https://lab.earthsdk.com/terrain/577fd5b0ac1f11e99dbd8fd044883638",
        terrainProp: {
            requestWaterMask: true,
            requestVertexNormals: true,
        }
    })

    go.terrain.add({
        name: "地形",
        url: "http://183.230.114.154:9010/terrain",
        type: "origin",
        terrainProp: {
            maxiumLevel: 20,
            requestWaterMask: false,
            requestVertexNormals: false,
        }
    })

    go.ec.add({
        position: Cesium.Cartesian3.fromDegrees(106.3931931565161, 29.805810956616792, 2.61),
        point: {
            color: Cesium.Color.RED,    //点位颜色
            pixelSize: 10                //像素点大小
        },
        label: {
            text: '测试名称',
            font: '14pt Source Han Sans CN',    //字体样式
            fillColor: Cesium.Color.BLACK,        //字体颜色
            backgroundColor: Cesium.Color.AQUA,    //背景颜色
            showBackground: true,                //是否显示背景颜色
            style: Cesium.LabelStyle.FILL,        //label样式
            outlineWidth: 2,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,//垂直位置
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,//水平位置
            pixelOffset: new Cesium.Cartesian2(10, 0)            //偏移
        }
    });
    go.ec.add({
        name: "黄色点",
        position: Cesium.Cartesian3.fromDegrees(106.394, 29.81, 2.61),
        point: {
            color: Cesium.Color.YELLOW,    //点位颜色
            pixelSize: 15                //像素点大小
        }
    });

    go.model.add({
        // lon: 106.4044164,
        // lat: 29.8292394,
        name: "未命名瓦片1",
        url: "http://183.230.114.154:9010/newsmap202201/zsyc1/tileset.json"
    })

    go.ds.add({
        url: "https://cesium-1301474191.cos.ap-nanjing.myqcloud.com/map%20(2).kml",
        type: "kml"
    })
    go.water.start("../../data/kml/water.kml", true)
}

function defaultCOnfig(viewer) {
    Cesium.Ion.defaultAccessToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0YWJlYzNkNS0yY2M0LTQxZWQtOGZhNi05MjEzYmVmZGVkNTkiLCJpZCI6MzU1NTEsImlhdCI6MTYwNDYyNzY2NH0.JxhQQxEvJTrmeARILcywKaPoPEPjO1RlqL28CRjktx8';
    CesiumZh.load(); // 汉化
    // 解决infobox报‘allow-scripts’问题
    if (typeof viewer.infoBox != "undefined") {
        viewer.infoBox.frame.removeAttribute("sandbox");
        viewer.infoBox.frame.src = "about:blank";
    }
    viewer.sceneMode = Cesium.SceneMode.SCENE3D
    // 开启深度检测
    viewer.scene.globe.depthTestAgainstTerrain = true;
    // 自动调整分辨率
    var supportsImageRenderingPixelated = viewer.cesiumWidget._supportsImageRenderingPixelated;
    if (supportsImageRenderingPixelated) {
        var vtxf_dpr = window.devicePixelRatio;
        while (vtxf_dpr >= 2.0) {
            vtxf_dpr /= 2.0;
        }
        viewer.resolutionScale = vtxf_dpr;
    }
    // 保存默认无地形的地形对象，defaultTerrainProvider为自定义的参数
    viewer.defaultTerrainProvider = viewer.terrainProvider;
    //隐藏版权信息
    viewer._cesiumWidget._creditContainer.style.display = "none";
    // 设置相机初始化显示视角
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(106.3931931565161, 29.805810956616792, 1100),
        orientation: {
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-90),
            roll: Cesium.Math.toRadians(0)
        }
    });
    // 关闭阴影
    viewer.shadows = false;
    // 关闭雾效
    viewer.scene.fog.density = 0;
}


function commonCofig(viewer) {
    window.viewer = viewer;
    globals(viewer);
    initScene(viewer);
    defaultCOnfig(viewer);
}

export function startUpEarth() {
    const earth = new XE.Earth("cesiumContainer", mapConfig);
    window._earth = earth;
    commonCofig(earth.czm.viewer);
    earth.czm.viewer.sceneMode = Cesium.SceneMode.SCENE3D;
}

export function startUpCesium() {
    const viewer = new Cesium.Viewer('cesiumContainer', mapConfig);
    commonCofig(viewer);
}