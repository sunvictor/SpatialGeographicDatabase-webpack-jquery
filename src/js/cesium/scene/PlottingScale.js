export default class PlottingScale {
    cameraHeight = 0;
    barWidth = undefined;
    distanceLabel = undefined;
    distances = [
        1,
        2,
        3,
        5,
        10,
        20,
        30,
        50,
        100,
        200,
        300,
        500,
        1000,
        2000,
        3000,
        5000,
        10000,
        20000,
        30000,
        50000,
        100000,
        200000,
        300000,
        500000,
        1000000,
        2000000,
        3000000,
        5000000,
        10000000,
        20000000,
        30000000,
        50000000
    ]

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.viewer.scene.postRender.addEventListener(function () {
            let geodesic = new Cesium.EllipsoidGeodesic();

            // Find the distance between two pixels at the bottom center of the screen.
            let scene = _this.viewer.scene;
            let width = scene.canvas.clientWidth;
            let height = scene.canvas.clientHeight;
            let left = scene.camera.getPickRay(
                new Cesium.Cartesian2((width / 2) | 0, height - 1)
            );
            let right = scene.camera.getPickRay(
                new Cesium.Cartesian2((1 + width / 2) | 0, height - 1)
            );
            let globe = scene.globe;
            let leftPosition = globe.pick(left, scene);
            let rightPosition = globe.pick(right, scene);
            if (!Cesium.defined(leftPosition) || !Cesium.defined(rightPosition)) {
                _this.barWidth = undefined;
                _this.distanceLabel = undefined;
                return;
            }
            let leftCartographic = globe.ellipsoid.cartesianToCartographic(
                leftPosition
            );
            let rightCartographic = globe.ellipsoid.cartesianToCartographic(
                rightPosition
            );
            geodesic.setEndPoints(leftCartographic, rightCartographic);
            let pixelDistance = geodesic.surfaceDistance;
            // Find the first distance that makes the scale bar less than 100 pixels.
            let maxBarWidth = 100;
            let distance;
            for (
                let i = _this.distances.length - 1; !Cesium.defined(distance) && i >= 0;
                --i
            ) {
                if (_this.distances[i] / pixelDistance < maxBarWidth) {
                    distance = _this.distances[i];
                }
            }
            if (Cesium.defined(distance)) {
                // let label =
                //     distance >= 1000 ?
                //     (distance / 1000).toString() + " km" :
                //     distance.toString() + " m";
                // let label = distance >= 1000 ? (distance / 1000).toString() + " km" :distance.toString() + " m";
                let label = "1:" + distance * 50;
                _this.barWidth = (distance / pixelDistance) | 0;
                // _this.distanceLabel = label;
                $("#customerPlottingScaleText").text(label)
            } else {
                _this.barWidth = undefined;
                // _this.distanceLabel = undefined;
                $("#customerPlottingScaleText").text("")
            }
        });
    }
}