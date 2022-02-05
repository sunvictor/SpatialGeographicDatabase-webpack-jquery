import pm from "../plugins/publicMethod";
import {go} from "@/js/cesium/globalObject";

const LayerMap = (function () {
    class LayerMap {
        labCoordTypeDict = { // 图层坐标系转换字典
            BD09: "BD09",
            WGS84: "WGS84",
            GCJ02: "GCJ02",
            GSC2000: "GCS_China_Geodetic_Coordinate_System_2000"
        }

        constructor(viewer) {
            this.viewer = viewer;
        }

        /**
         * 添加图层
         * @param options 参见addMap注释
         * @returns {Cesium.ImageryLayer}
         */
        add(options) {
            let map = this.addMap(options);
            if (typeof options.show == "undefined") {
                map.show = true;
            } else {
                map.show = options.show;
            }
            let newNode = {
                name: map.name,
                checked: map.show
                // data: JSON.stringify(map)
            }
            go.lc.addNode(-1, newNode, map)
            return map;
        }

        /**
         * 移除图层
         * @param layer 参见viewer.imageryLayers.remove
         * @param destroy viewer.imageryLayers.remove
         * @returns {boolean}
         */
        remove(layer, destroy = true) {
            let _this = this;
            return _this.viewer.imageryLayers.remove(layer, destroy);
        }

        /**
         * 降低图层层级
         * @param layer Cesium.ImageryLayer
         */
        lower(layer) {
            let _this = this;
            _this.viewer.imageryLayers.lower(layer);
        }

        /**
         * 提高图层层级
         * @param layer Cesium.ImageryLayer
         */
        raise(layer) {
            let _this = this;
            _this.viewer.imageryLayers.raise(layer);
        }

        /**
         * 传入的参数是一个json格式的
         * name 图层名称 必填项*
         * url 图层地址 必填项*
         * type 加载图层的方式 origin或cesiumlab, 默认为origin
         * coordType 图层数据类型 当type='cesiumlab'时有效 数组格式,第一个参数为数据坐标,第二个参数为加载坐标
         * providerProp 图层加载时所需要的参数 当type="origin"时有效
         * options 图层参数 json格式 对图层属性进行设置的一些参数
         * @param {object} params 传入的参数
         */
        addMap(params) {
            let _this = this;
            if (!params.name) {
                cocoMessage.error("请输入图层名称");
                return;
            }
            if (!params.url) {
                cocoMessage.error("请输入图层地址");
                return;
            }
            let map = null;
            if (params.type == "origin") {
                map = _this.addMapByOriginFunc(params);
            } else if ("cesiumlab") {
                map = _this.addMapByCesiumLab(params);
            } else {
                map = _this.addMapByOriginFunc(params);
            }
            map.customProp = params;
            // 定义一个额外的参数，是为了在imageryProvider.js中绑定属性使用
            // 因为是直接监听的map，所以需要定义一个单独的参数，否则就会重复调用导致堆溢出，所以其实不应该监听map
            // 通常是监听一个自定义的viewModel对象，通过改变viewModel里的值，在回调函数中再去改变map的值
            // 监听map是因为会在其他地方调用例如 map.show = true 如果监听viewModel的话，其他地方就需要调用 viewModel.show = true 才能实现
            // 但这也不合理，所以就直接监听map了
            map.bindModelSplitDirections = map.splitDirections;
            map.splitDirections = ["ImagerySplitDirection.NONE","ImagerySplitDirection.LEFT","ImagerySplitDirection.RIGHT"]
            // =============
            return map;
        }

        /**
         * 传入的参数是一个json格式的
         * name 图层名称 必填项*
         * url 图层地址 必填项*
         * type 加载图层的方式 origin或cesiumlab, 默认为origin
         * coordType 图层数据类型 当type='cesiumlab'时有效 数组格式,第一个参数为数据坐标,第二个参数为加载坐标
         * providerProp 图层加载时所需要的参数 当type="origin"时有效
         * options 图层参数 json格式 对图层属性进行设置的一些参数
         * @param {object} params 传入的参数
         */
        addMapByOriginFunc(params) {
            let _this = this;
            if (!params.providerProp) {
                params.providerProp = {};
            }
            let json = {
                url: params.url,
            }
            pm.setOptions(json, params.providerProp);
            let provider = new Cesium.UrlTemplateImageryProvider(json);
            let map = _this.viewer.imageryLayers.addImageryProvider(provider);
            map.name = params.name;
            pm.setOptions(map, params.options);
            return map;
        }

        /**
         * 传入的参数是一个json格式的
         * name 图层名称 必填项*
         * url 图层地址 必填项*
         * type 加载图层的方式 origin或cesiumlab, 默认为origin
         * coordType 图层数据类型 当type='cesiumlab'时有效 数组格式,第一个参数为数据坐标,第二个参数为加载坐标
         * providerProp 图层加载时所需要的参数 当type="origin"时有效
         * options 图层参数 json格式 对图层属性进行设置的一些参数
         * @param {object} params 传入的参数
         */
        addMapByCesiumLab(params) {
            let _this = this;
            if (!window.XE || !window._earth) {
                alert("请使用earthSDK加载图层");
                return false;
            }
            if (!params.coordType) {
                params.coordType = [_this.labCoordTypeDict.WGS84, _this.labCoordTypeDict.WGS84]
            }
            let XbsjImageryProvider = {
                "url": params.url,
                "srcCoordType": params.coordType[0],
            }
            // 当加载坐标不为 wgs84 时,才添加"dstCoordType"属性, 因为默认加载坐标就是wgs84
            if (params.coordType[1] == !_this.labCoordTypeDict.WGS84) {
                XbsjImageryProvider["dstCoordType"] = coordType[1];
            }
            let json = {
                "czmObject": {
                    "xbsjType": "Imagery",
                    "name": params.name,
                    "xbsjImageryProvider": {
                        "XbsjImageryProvider": XbsjImageryProvider,
                        "UrlTemplateImageryProvider": {},
                        "WebMapServiceImageryProvider": {},
                        "WebMapTileServiceImageryProvider": {},
                        "ArcGisMapServerImageryProvider": {},
                        "createTileMapServiceImageryProvider": {}
                    }
                }
            }
            try {
                window._earth.sceneTree.root.children.push(json);
            } catch (e) {
                console.error("请使用earthSDK加载图层");
                console.error(e);
            }
            let map = _this.viewer.imageryLayers._layers[_this.viewer.imageryLayers._layers.length - 1];
            map.name = params.name;
            pm.setOptions(map, params.options);
            return map;
        }
    }

    return LayerMap;
})()

export default LayerMap