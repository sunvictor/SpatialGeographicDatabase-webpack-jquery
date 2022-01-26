import layerMap from "./layerMap";
import gykjPanel from "../plugins/panel";

const mapConfig = {
    baseLayerPicker: false,
    homeButton: false,
    animation: true,
    timeline: true,
    geocoder: false,
    infoBox: false,
    selectionIndicator: false,
    sceneModePicker: false,
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
    const lm = new layerMap(viewer);
    let newSatellite = lm.add({
        name: "新卫星图",
        url: "http://183.230.114.154:9010/Satellite/{z}/{x}/{y}.png",
        type: "cesiumlab",
        options: {
            saturation: 1.7
        }
    })
    let oldStreet = lm.add({
        name: "旧街道图",
        url: "http://222.178.182.14:9010/dataserver?x={x}&y={y}&l={z}&t=cva_c",
        type: "origin",
        providerProp: {
            tilingScheme: new Cesium.GeographicTilingScheme(),
            maximumLevel: 20,
            format: "image/png",
        }
    })

    let layerPanel = new gykjPanel({
        title: "图层管理",
        show: true,
        width: 400,
        height: 470,
        content: `<h1>Hello</h1>`
    })
    let layerPanel2 = new gykjPanel({
        title: "图层管理2",
        show: true,
        width: 400,
        height: 470,
        left: 500,
        content: `<h1>Hello</h1>`
    })
}

function defaultCOnfig(viewer) {
    // 解决infobox报‘allow-scripts’问题
    if (typeof viewer.infoBox != "undefined") {
        viewer.infoBox.frame.removeAttribute("sandbox");
        viewer.infoBox.frame.src = "about:blank";
    }
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
    initScene(viewer);
    defaultCOnfig(viewer);
}

export function startUpEarth() {
    const earth = new XE.Earth("cesiumContainer", mapConfig);
    window._earth = earth;
    commonCofig(earth.czm.viewer);
    viewer.sceneMode = Cesium.SceneMode.SCENE3D;
}

export function startUpCesium() {
    const viewer = new Cesium.Viewer('cesiumContainer', mapConfig);
    commonCofig(viewer);
}