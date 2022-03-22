import cm from "../../plugins/CesiumMethod";
import {go} from "@/js/cesium/globalObject";
import gykjAlert from "@/js/plugins/alert";
let _btnIdName = "proliferation"
export default class CircleScan {
    viewer = null;
    center = null;
    color = null;
    duration = null;
    circleStage = null;
    entity = null;
    centerPointImage = '../../img/plot/circle_center.png';
    viewModel = {
        enabled: false,
        radius: 200,
        color: "",
        duration: 3000,
    }

    constructor(viewer) {
        this.init(viewer)
    }

    /**
     * 初始化
     * @param {*} viewer 添加扩散效果扫描线
     * @param {Cartesian3} cartographicCenter 扫描中心
     * @param {Nunber} maxRadius  半径 米
     * @param {Color} scanColor  扫描颜色
     * @param {Nunber} duration 持续时间 毫秒

     * @version 2.0
     */
    init(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.circleStage = null;
        let options = {
            btn: $("#" + _btnIdName).next(),
            content: `<div id='radarScan_config'>
<!--    <div><span>半径</span><input type='range' min="1" max="1000" step="0.1" data-bind="value: radius, valueUpdate: 'input'"></div>-->
    <div><span>颜色</span><input type='text' data-bind="value: color, valueUpdate: 'input'"></div>
    <div><span>速度</span><input type='range' min="1000" max="10000" step="1" data-bind="value: duration, valueUpdate: 'input'"></div>
    </div>`
        }
        console.log(1)
        let lightAlert = new gykjAlert(options);
        _this.bindModel();
    }

    /**
     * 清除

     * @version 2.0
     */
    clear() {
        let _this = this;
        if (!_this.circleStage) {
            console.log("未加载动态圆")
        }
        if (_this.circleStage) {
            _this.viewer.scene.postProcessStages.remove(_this.circleStage);
            _this.circleStage = null;
        }
        if (_this.entity) {
            _this.viewer.entities.remove(_this.entity);
            _this.circleStage = null;
        }
    }

    /**
     * 中心点

     * @version 2.0
     */
    start() {
        let _this = this;
        if (!_this.viewModel.color) _this.viewModel.color = new Cesium.Color(0, 1.0, 0.0, 1);
        go.plot.trackCircle(function (positions, params) {
            let dis = go.plot.circleDrawer.circleDrawer._computeCircleRadius3D(positions);
            let center = positions[0];
            let cartographic = Cesium.Cartographic.fromCartesian(center);
            cm.getTerrainHeight([cartographic], (cartographics) => {
                cartographic.height = cartographics[0].height;
                _this.entity = _this.viewer.entities.add({
                    name: '扫描圆',
                    position: center,
                    billboard: {
                        image: _this.centerPointImage,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
                        clampToGround: true,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
                    }
                });
                let cartographicCenter = Cesium.Cartographic.fromCartesian(center);
                _this.circleStage = _this.addCircleScan(
                    _this.viewer,
                    cartographicCenter,
                    dis,
                    _this.viewModel.color,
                    _this.viewModel.duration
                );
                _this.viewModel.enabled = false;
                let newNode = {
                    name: "扩散圆",
                    checked: true
                }
                let node = go.ec.addNode(-1, newNode, [_this.circleStage, _this.entity])
            });
        });
    }

    /**
     * 生成动态圆

     * @version 2.0
     */
    addCircleScan(viewer, cartographicCenter, maxRadius, scanColor, duration) {
        let _this = this;

        let _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        let _Cartesian4Center = new Cesium.Cartesian4(
            _Cartesian3Center.x,
            _Cartesian3Center.y,
            _Cartesian3Center.z,
            1
        );

        let _CartograhpicCenter1 = new Cesium.Cartographic(
            cartographicCenter.longitude,
            cartographicCenter.latitude,
            cartographicCenter.height + 1
        );
        let _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartograhpicCenter1);
        let _Cartesian4Center1 = new Cesium.Cartesian4(
            _Cartesian3Center1.x,
            _Cartesian3Center1.y,
            _Cartesian3Center1.z,
            1
        );

        let _time = new Date().getTime();

        let _scratchCartesian4Center = new Cesium.Cartesian4();
        let _scratchCartesian4Center1 = new Cesium.Cartesian4();
        let _scratchCartesian3Normal = new Cesium.Cartesian3();

        let ScanPostStage = new Cesium.PostProcessStage({
            fragmentShader: _this.shader(),
            uniforms: {
                u_scanCenterEC() {
                    let temp = Cesium.Matrix4.multiplyByVector(
                        viewer.camera._viewMatrix,
                        _Cartesian4Center,
                        _scratchCartesian4Center
                    );
                    return temp;
                },
                u_scanPlaneNormalEC() {
                    let temp = Cesium.Matrix4.multiplyByVector(
                        viewer.camera._viewMatrix,
                        _Cartesian4Center,
                        _scratchCartesian4Center
                    );
                    let temp1 = Cesium.Matrix4.multiplyByVector(
                        viewer.camera._viewMatrix,
                        _Cartesian4Center1,
                        _scratchCartesian4Center1
                    );

                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

                    return _scratchCartesian3Normal;
                },
                u_radius() {
                    return maxRadius * ((new Date().getTime() - _time) % duration) / duration;
                },
                u_scanColor: scanColor
            }
        });

        viewer.scene.postProcessStages.add(ScanPostStage);
        return ScanPostStage;
    }

    shader() {
        return '\n\
                uniform sampler2D colorTexture;\n\
                uniform sampler2D depthTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                uniform vec4 u_scanCenterEC;\n\
                uniform vec3 u_scanPlaneNormalEC;\n\
                uniform float u_radius;\n\
                uniform vec4 u_scanColor;\n\
                \n\
                vec4 toEye(in vec2 uv,in float depth)\n\
                {\n\
                            vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n\
                            vec4 posIncamera = czm_inverseProjection * vec4(xy,depth,1.0);\n\
                            posIncamera = posIncamera/posIncamera.w;\n\
                            return posIncamera;\n\
                }\n\
                \n\
                vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point)\n\
                {\n\
                            vec3 v01 = point - planeOrigin;\n\
                            float d = dot(planeNormal,v01);\n\
                            return (point-planeNormal * d);\n\
                }\n\
                float getDepth(in vec4 depth)\n\
                {\n\
                            float z_window = czm_unpackDepth(depth);\n\
                            z_window = czm_reverseLogDepth(z_window);\n\
                            float n_range = czm_depthRange.near;\n\
                            float f_range = czm_depthRange.far;\n\
                            return (2.0 * z_window - n_range - f_range)/(f_range-n_range);\n\
                } \n\
                void main()\n\
                {\n\
                            gl_FragColor = texture2D(colorTexture,v_textureCoordinates);\n\
                            float depth = getDepth(texture2D(depthTexture,v_textureCoordinates));\n\
                            vec4 viewPos = toEye(v_textureCoordinates,depth);\n\
                            vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz,u_scanCenterEC.xyz,viewPos.xyz);\n\
                            float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n\
                            if(dis<u_radius)\n\
                            {\n\
                                float f = 1.0-abs(u_radius - dis )/ u_radius;\n\
                                f = pow(f,4.0);\n\
                                gl_FragColor = mix(gl_FragColor,u_scanColor,f);\n\
                            }\n\
                } \n ';
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById(_btnIdName ); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                if (newValue) {
                    _this.start();
                }
                go.bbi.bindImg("扩散", "proliferation", !newValue)
            }
        );
    }
}