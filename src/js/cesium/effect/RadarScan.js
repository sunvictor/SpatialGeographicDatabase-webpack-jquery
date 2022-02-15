import cm from "../../plugins/CesiumMethod";
import {go} from "@/js/cesium/globalObject";
import gykjAlert from "@/js/plugins/alert";

let _btnIdName = "radar"
export default class RadarScan {
    viewModel = {
        enabled: false,
        radius: 20,
        color: "",
        duration: 3000,
    }

    constructor(viewer) {
        this.init(viewer)
    }

    /**
     * 初始化
     * @param {*} viewer 添加扩散效果扫描线
     * @param {Cartesian3} center 扫描中心
     * @param {Nunber} radius  半径 米
     * @param {Color} scanColor  扫描颜色
     * @param {Nunber} duration 持续时间 毫秒

     * @version 2.0
     */
    init(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.centerPointImage = '../../img/plot/circle_center.png';
        let options = {
            btn: $("#" + _btnIdName).next(),
            content: `<div id='radarScan_config'>
    <div><span>半径</span><input type='range' min="1" max="1000" step="0.1" data-bind="value: radius, valueUpdate: 'input'"></div>
    <div><span>颜色</span><input type='text' data-bind="value: color, valueUpdate: 'input'"></div>
    <div><span>速度</span><input type='range' min="1000" max="10000" step="1" data-bind="value: duration, valueUpdate: 'input'"></div>
    </div>`
        }
        let lightAlert = new gykjAlert(options)
        _this.bindModel();
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById("radarScan_config"); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                if (newValue) {
                    _this.start();
                }
                go.bbi.bindImg("雷达", "radar", !newValue)
            }
        );
    }

    /**
     * 中心点
     * @version 2.0
     */
    start() {
        let _this = this;
        let color;
        if (!_this.viewModel.color) color = new Cesium.Color(1, 0.0, 0.0, 1);
        let radius = Number(_this.viewModel.radius)
        let duration = Number(_this.viewModel.duration)
        go.plot.trackUninterruptedBillboard(function (positions) {
            for (let i = 0; i < positions.length; i++) {
                let center = positions[i];
                let cartographic = Cesium.Cartographic.fromCartesian(center);
                cm.getTerrainHeight([cartographic], (cartographics) => {
                    cartographic.height = cartographics[0].height;
                    center = Cesium.Cartographic.toCartesian(cartographic);
                    let point = _this.viewer.entities.add({
                        name: 'radar_point',
                        position: center,
                        billboard: {
                            image: _this.centerPointImage,
                            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
                            clampToGround: true,
                            disableDepthTestDistance: Number.POSITIVE_INFINITY //元素在正上方
                        }
                    });
                    let cartographicCenter = Cesium.Cartographic.fromCartesian(center);
                    let radarStage = _this.addRadarScan(
                        _this.viewer,
                        cartographicCenter,
                        radius,
                        color,
                        duration
                    );
                    window.s = radarStage;
                    let newNode = {
                        name: "雷达",
                        checked: true
                    }
                    let node = go.ec.addNode(-1, newNode, [radarStage, point])
                });
            }
        }, function (positions) {
            console.log(positions)
        })

    }

    /**
     * 生成动态圆

     * @version 2.0
     */
    addRadarScan(viewer, cartographicCenter, radius, scanColor, duration) {
        let _this = this;
        let _Cartesian3Center = Cesium.Cartographic.toCartesian(cartographicCenter);
        let _Cartesian4Center = new Cesium.Cartesian4(
            _Cartesian3Center.x,
            _Cartesian3Center.y,
            _Cartesian3Center.z,
            1
        );

        let _CartographicCenter1 = new Cesium.Cartographic(
            cartographicCenter.longitude,
            cartographicCenter.latitude,
            cartographicCenter.height + 1
        );
        let _Cartesian3Center1 = Cesium.Cartographic.toCartesian(_CartographicCenter1);
        let _Cartesian4Center1 = new Cesium.Cartesian4(
            _Cartesian3Center1.x,
            _Cartesian3Center1.y,
            _Cartesian3Center1.z,
            1
        );

        let _CartographicCenter2 = new Cesium.Cartographic(
            cartographicCenter.longitude + Cesium.Math.toRadians(0.001),
            cartographicCenter.latitude,
            cartographicCenter.height
        );
        let _Cartesian3Center2 = Cesium.Cartographic.toCartesian(_CartographicCenter2);
        let _Cartesian4Center2 = new Cesium.Cartesian4(
            _Cartesian3Center2.x,
            _Cartesian3Center2.y,
            _Cartesian3Center2.z,
            1
        );
        let _RotateQ = new Cesium.Quaternion();
        let _RotateM = new Cesium.Matrix3();

        let _time = new Date().getTime();

        let _scratchCartesian4Center = new Cesium.Cartesian4();
        let _scratchCartesian4Center1 = new Cesium.Cartesian4();
        let _scratchCartesian4Center2 = new Cesium.Cartesian4();
        let _scratchCartesian3Normal = new Cesium.Cartesian3();
        let _scratchCartesian3Normal1 = new Cesium.Cartesian3();

        let ScanPostStage = new Cesium.PostProcessStage({
            fragmentShader: _this.shader(),
            uniforms: {
                u_scanCenterEC() {
                    return Cesium.Matrix4.multiplyByVector(
                        viewer.camera._viewMatrix,
                        _Cartesian4Center,
                        _scratchCartesian4Center
                    );
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
                u_radius: radius,
                u_scanLineNormalEC() {
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
                    let temp2 = Cesium.Matrix4.multiplyByVector(
                        viewer.camera._viewMatrix,
                        _Cartesian4Center2,
                        _scratchCartesian4Center2
                    );

                    _scratchCartesian3Normal.x = temp1.x - temp.x;
                    _scratchCartesian3Normal.y = temp1.y - temp.y;
                    _scratchCartesian3Normal.z = temp1.z - temp.z;

                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal, _scratchCartesian3Normal);

                    _scratchCartesian3Normal1.x = temp2.x - temp.x;
                    _scratchCartesian3Normal1.y = temp2.y - temp.y;
                    _scratchCartesian3Normal1.z = temp2.z - temp.z;

                    let tempTime = ((new Date().getTime() - _time) % duration) / duration;
                    Cesium.Quaternion.fromAxisAngle(
                        _scratchCartesian3Normal,
                        tempTime * Cesium.Math.PI * 2,
                        _RotateQ
                    );
                    Cesium.Matrix3.fromQuaternion(_RotateQ, _RotateM);
                    Cesium.Matrix3.multiplyByVector(_RotateM, _scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    Cesium.Cartesian3.normalize(_scratchCartesian3Normal1, _scratchCartesian3Normal1);
                    return _scratchCartesian3Normal1;
                },
                u_scanColor: scanColor
            }
        });
        viewer.scene.postProcessStages.add(ScanPostStage);

        return ScanPostStage;
    }

    /**
     * @version 2.0
     */
    shader() {
        return (
            'uniform sampler2D colorTexture;\n' +
            'uniform sampler2D depthTexture;\n' +
            'varying vec2 v_textureCoordinates;\n' +
            'uniform vec4 u_scanCenterEC;\n' +
            'uniform vec3 u_scanPlaneNormalEC;\n' +
            'uniform vec3 u_scanLineNormalEC;\n' +
            'uniform float u_radius;\n' +
            'uniform vec4 u_scanColor;\n' +
            'vec4 toEye(in vec2 uv, in float depth)\n' +
            ' {\n' +
            ' vec2 xy = vec2((uv.x * 2.0 - 1.0),(uv.y * 2.0 - 1.0));\n' +
            ' vec4 posInCamera =czm_inverseProjection * vec4(xy, depth, 1.0);\n' +
            ' posInCamera =posInCamera / posInCamera.w;\n' +
            ' return posInCamera;\n' +
            ' }\n' +
            'bool isPointOnLineRight(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n' +
            '{\n' +
            'vec3 v01 = testPt - ptOnLine;\n' +
            'normalize(v01);\n' +
            'vec3 temp = cross(v01, lineNormal);\n' +
            'float d = dot(temp, u_scanPlaneNormalEC);\n' +
            'return d > 0.5;\n' +
            '}\n' +
            'vec3 pointProjectOnPlane(in vec3 planeNormal, in vec3 planeOrigin, in vec3 point)\n' +
            '{\n' +
            'vec3 v01 = point -planeOrigin;\n' +
            'float d = dot(planeNormal, v01) ;\n' +
            'return (point - planeNormal * d);\n' +
            '}\n' +
            'float distancePointToLine(in vec3 ptOnLine, in vec3 lineNormal, in vec3 testPt)\n' +
            '{\n' +
            'vec3 tempPt = pointProjectOnPlane(lineNormal, ptOnLine, testPt);\n' +
            'return length(tempPt - ptOnLine);\n' +
            '}\n' +
            'float getDepth(in vec4 depth)\n' +
            '{\n' +
            'float z_window = czm_unpackDepth(depth);\n' +
            'z_window = czm_reverseLogDepth(z_window);\n' +
            'float n_range = czm_depthRange.near;\n' +
            'float f_range = czm_depthRange.far;\n' +
            'return (2.0 * z_window - n_range - f_range) / (f_range - n_range);\n' +
            '}\n' +
            'void main()\n' +
            '{\n' +
            'gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n' +
            'float depth = getDepth( texture2D(depthTexture, v_textureCoordinates));\n' +
            'vec4 viewPos = toEye(v_textureCoordinates, depth);\n' +
            'vec3 prjOnPlane = pointProjectOnPlane(u_scanPlaneNormalEC.xyz, u_scanCenterEC.xyz, viewPos.xyz);\n' +
            'float dis = length(prjOnPlane.xyz - u_scanCenterEC.xyz);\n' +
            'float twou_radius = u_radius * 2.0;\n' +
            'if(dis < u_radius)\n' +
            '{\n' +
            'float f0 = 1.0 -abs(u_radius - dis) / u_radius;\n' +
            'f0 = pow(f0, 64.0);\n' +
            'vec3 lineEndPt = vec3(u_scanCenterEC.xyz) + u_scanLineNormalEC * u_radius;\n' +
            'float f = 0.0;\n' +
            'if(isPointOnLineRight(u_scanCenterEC.xyz, u_scanLineNormalEC.xyz, prjOnPlane.xyz))\n' +
            '{\n' +
            'float dis1= length(prjOnPlane.xyz - lineEndPt);\n' +
            'f = abs(twou_radius -dis1) / twou_radius;\n' +
            'f = pow(f, 3.0);\n' +
            '}\n' +
            'gl_FragColor = mix(gl_FragColor, u_scanColor, f + f0);\n' +
            '}\n' +
            '}\n'
        );
    }
}