import {bindBtnImg} from "../html/BindBtnImg";
import LayerControl from "./layer/LayerControl";
import LayerMap from "./layer/LayerMap"
import imageryProvider from "@/js/cesium/layer/ImageryProvider";
import entityControl from "@/js/cesium/entity/EntityControl";
import plotGlobeTracker from "./entity/plot/PlotGlobeTracker";
import drawShape from "./entity/plot/Draw";
import MeasureTools from "@/js/cesium/measure/MeasureTools";
import TerrainControl from "@/js/cesium/terrain/TerrainControl";
import Weather from "@/js/cesium/weather/Weather";
import Floodlight from "@/js/cesium/effect/Floodlight";
import HeatMap from "@/js/cesium/effect/HeatMap";
import ModelControl from "@/js/cesium/model/ModelControl";
import EarthRotation from "@/js/cesium/effect/EarthRotation";
import DataSourceControl from "@/js/cesium/entity/kml/DataSourceControl";
import PanoramicView from "@/js/cesium/effect/PanoramicView";
import DynamicWall from "./effect/DynamicWall";
import PlottingScale from "./scene/PlottingScale";
import HomeView from "./scene/HomeView";
import DblClickRotate from "@/js/cesium/scene/DblClickRotate";
import Water from "./entity/kml/water/Water";

let _viewer;
export const go = {}; // 封装所有的类对象

export function globals(viewer) {
    _viewer = viewer;
    createObjs(viewer);
}

/**
 * 创建类对象
 * @param viewer
 */
function createObjs(viewer) {
    go.bbi = new bindBtnImg(viewer)
    go.lc = new LayerControl(viewer)
    go.lm = new LayerMap(viewer)
    go.ip = new imageryProvider(viewer);
    go.ec = new entityControl(viewer);
    go.plot = new plotGlobeTracker(viewer);
    go.draw = new drawShape(viewer);
    go.measure = new MeasureTools(viewer);
    go.terrain = new TerrainControl(viewer);
    go.weather = new Weather(viewer);
    go.fl = new Floodlight(viewer);
    go.dw = new DynamicWall(viewer);
    go.heatmap = new HeatMap(viewer);
    go.model = new ModelControl(viewer);
    go.er = new EarthRotation(viewer);
    go.ds = new DataSourceControl(viewer);
    go.pc = new PanoramicView(viewer);
    go.plottingScale = new PlottingScale(viewer);
    go.hv = new HomeView(viewer);
    go.dblc = new DblClickRotate(viewer);
    go.water = new Water(viewer);
}

function publicEvents(viewer){

}

export function getViewer() {
    return new Promise((resolve, reject) => {
        if (typeof _viewer != "undefined" && _viewer) {
            resolve(_viewer)
        } else {
            reject(_viewer)
        }
    })
}

/**
 * 传入值获取数组下标
 * @param val
 * @returns {number}
 */
Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

/**
 * 在数组中移除相同值的数据
 * @param val
 */
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

/**
 * 通过下标移除值
 * @param index
 */
Array.prototype.removeByIndex = function (index) {
    if (index > -1) {
        this.splice(index, 1);
    }
};