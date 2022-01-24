export function startUpEarth() {
    var earth = new XE.Earth("cesiumContainer");
    commonCofig(earth.czm.viewer);
}

export function startUpCesium() {
    const viewer = new Cesium.Viewer('cesiumContainer',{
        // infoBox: false
    });
    commonCofig(viewer);
}

function commonCofig(viewer) {
    // 解决infobox报‘allow-scripts’问题
    viewer.infoBox.frame.removeAttribute("sandbox");
    viewer.infoBox.frame.src = "about:blank";
}