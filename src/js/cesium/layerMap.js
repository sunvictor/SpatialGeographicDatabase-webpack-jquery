import pm from "../plugins/publicMethod";

const LayerMap = (function () {
    let labCoordTypeDict = {
        BD09: "BD09",
        WGS84: "WGS84",
        GCJ02: "GCJ02",
        GSC2000: "GCS_China_Geodetic_Coordinate_System_2000"
    }
    class LayerMap {
        constructor(viewer) {
            this.viewer = viewer;
        }

        add(options) {
            let map = this.addMap(options);
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
                params.coordType = [labCoordTypeDict.WGS84, labCoordTypeDict.WGS84]
            }
            let XbsjImageryProvider = {
                "url": params.url,
                "srcCoordType": params.coordType[0],
            }
            // 当加载坐标不为 wgs84 时,才添加"dstCoordType"属性, 因为默认加载坐标就是wgs84
            if (params.coordType[1] == !labCoordTypeDict.WGS84) {
                XbsjImageryProvider["dstCoordType"] = coordType[1];
            }
            let json = {
                "czmObject": {
                    "xbsjType": "Imagery",
                    "xbsjGuid": "7d91e26a-3f31-438b-8175-be8b276a63f8",
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
            var index;
            try {
                index = window._earth.sceneTree.root.children.push(json);
            } catch (e) {
                console.error("请使用earthSDK加载图层");
                console.error(e);
            }
            let map = _this.viewer.imageryLayers._layers[index - 1];
            map.name = params.name;
            pm.setOptions(map, params.options);
            return map;
        }
    }

    return LayerMap;
})()

export default LayerMap