export default class DblClickRotate {

    constructor(viewer) {
        this.viewer = viewer;
        this.dblClickEvent = this.viewer.cesiumWidget.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    }

    start(enabled) {
        if (enabled) {
            this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        } else {
            this.viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(this.dblClickEvent, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
        }
    }
}