import {go} from "../globalObject";
import "../../../css/weather/raindrop.css"

let darkTime = null;
export default class Weather {
    viewer = null;
    stage = null;
    sign = false;
    snowLayer = "";
    snowPolygon = null;
    viewModel = {
        lightRainEnabled: false,
        midRainEnabled: false,
        heavyRainEnabled: false,
        raindropEnabled: false,
        thunderEnabled: false,
        snowEnabled: false,
        overcastEnabled: false,
        cloudyEnabled: false,
        sunnyEnabled: false,
        nightViewEnabled: false,
        snowMountainEnabled: false,
        screenFogEnabled: false
    };
    showStatus = {
        cloud: false,
        sun: false,
    };
    stages = {
        "小雨": null,
        "中雨": null,
        "大雨": null,
        "下雪": null,
        "雨滴": null,
        "闪电": null,
        "多云": null,
        "晴天": null,
        "阴天": null,
        "雪山": null,
        "雾": null,
    }

    constructor(viewer) {
        this.init(viewer);
        this.bindModel();
    }

    init(viewer) {
        var _this = this;
        _this.viewer = viewer;
        _this.stage = null;
        _this.sign = false;
        _this.postProcessStages = viewer.scene.postProcessStages;
        _this.skyAtmosphere = viewer.scene.skyAtmosphere;
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById("weatherBtns"); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'lightRainEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("小雨", "lightRain", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("小雨")
                    return;
                }
                _this.lightRain();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'midRainEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("中雨", "midRain", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("中雨")
                    return;
                }
                _this.midRain();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'heavyRainEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("大雨", "heavyRain", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("大雨")
                    return;
                }
                _this.heavyRain();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'raindropEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("雨滴", "raindropFunc", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("雨滴")
                    return;
                }
                _this.raindrop();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'thunderEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("闪电", "thunder", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("闪电")
                    return;
                }
                _this.thunderstorm();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'snowEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("下雪", "snow", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("下雪")
                    return;
                }
                _this.snow();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'overcastEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("阴天", "overcast", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("阴天")
                    return;
                }
                _this.overcast();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'cloudyEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("多云", "cloudy", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("多云")
                    return;
                }
                _this.cloudy();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'sunnyEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("晴天", "sunny", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("晴天")
                    return;
                }
                _this.sunny();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'snowMountainEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("雪山", "snowMountain", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("雪山")
                    return;
                }
                _this.snowMountain();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'nightViewEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("夜晚", "nightView", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("夜晚")
                    return;
                }
                _this.darkness();
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'screenFogEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("雾", "screenFog", newValue) // 切换是否选中图片
                if (!newValue) {
                    _this.closeFunction("雾")
                    return;
                }
                _this.fog();
            }
        );
    }

    closeFunction(funcName) {
        var _this = this;
        switch (funcName) {
            case "小雨":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.midRainEnabled && !_this.viewModel.heavyRainEnabled
                    && !_this.viewModel.snowEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.0)',
                        '-webkit-filter': 'brightness(1.0)',
                        '-mz-filter': 'brightness(1.0)',
                        '-moz-filter': 'brightness(1.0)'
                    });
                }
                break;
            case "中雨":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.heavyRainEnabled
                    && !_this.viewModel.snowEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.0)',
                        '-webkit-filter': 'brightness(1.0)',
                        '-mz-filter': 'brightness(1.0)',
                        '-moz-filter': 'brightness(1.0)'
                    });
                }
                break;
            case "大雨":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.midRainEnabled
                    && !_this.viewModel.snowEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.0)',
                        '-webkit-filter': 'brightness(1.0)',
                        '-mz-filter': 'brightness(1.0)',
                        '-moz-filter': 'brightness(1.0)'
                    });
                }
                break;
            case "下雪":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.midRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.overcastEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.0)',
                        '-webkit-filter': 'brightness(1.0)',
                        '-mz-filter': 'brightness(1.0)',
                        '-moz-filter': 'brightness(1.0)'
                    });
                }
                break;
            case "雾":
                _earth.weather.fog.enabled = false;
                break;
            case "雨滴":
                _this.removeElement();
                break;
            case "闪电":
                // _this.postProcessStages.remove(_this.stages[funcName]); // 关闭雨水
                _this.sign = true; // 关闭闪电
                break;
            case "阴天":
                _this.postProcessStages.remove(_this.stages[funcName]);
                _this.skyAtmosphere.hueShift = 0;
                _this.skyAtmosphere.saturationShift = 0;
                _this.skyAtmosphere.brightnessShift = 0;
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.midRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.snowEnabled
                    && !_this.viewModel.cloudyEnabled && !_this.viewModel.sunnyEnabled) {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.0)',
                        '-webkit-filter': 'brightness(1.0)',
                        '-mz-filter': 'brightness(1.0)',
                        '-moz-filter': 'brightness(1.0)'
                    });
                }
                break;
            case "多云":
                _this.showStatus.cloud = false;
                _this.LoadSkybox();
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.midRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.snowEnabled
                    && !_this.viewModel.overcastEnabled && !_this.viewModel.sunnyEnabled) {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.0)',
                        '-webkit-filter': 'brightness(1.0)',
                        '-mz-filter': 'brightness(1.0)',
                        '-moz-filter': 'brightness(1.0)'
                    });
                }
                break;
            case "晴天":
                _this.showStatus.sun = false;
                _this.LoadSkybox();
                if (!_this.viewModel.lightRainEnabled && !_this.viewModel.midRainEnabled
                    && !_this.viewModel.heavyRainEnabled && !_this.viewModel.snowEnabled
                    && !_this.viewModel.overcastEnabled && !_this.viewModel.cloudyEnabled) {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.0)',
                        '-webkit-filter': 'brightness(1.0)',
                        '-mz-filter': 'brightness(1.0)',
                        '-moz-filter': 'brightness(1.0)'
                    });
                }
                break;
            case "夜晚":
                let bloom = _this.viewer.scene.postProcessStages.bloom;
                clearInterval(darkTime)
                darkTime = setInterval(_this.changeToDayLight, 50);
                _this.viewer.scene.skyAtmosphere.show = true;
                break;
            case "雪山":
                _this.viewer.entities.remove(_this.snowPolygon);
                _this.snowLayer = "";
                break;
        }
        // _this.postProcessStages.remove(_this.stages[funcName]);
        // _this.skyAtmosphere.hueShift = 0;
        // _this.skyAtmosphere.saturationShift = 0;
        // _this.skyAtmosphere.brightnessShift = 0;
        // $('.cesium-viewer').css({
        //     filter: 'brightness(1.0)',
        //     '-webkit-filter': 'brightness(1.0)',
        //     '-mz-filter': 'brightness(1.0)',
        //     '-moz-filter': 'brightness(1.0)'
        // });
    }

    rain(name, shader) {
        var _this = this;
        _this.stages[name] = new Cesium.PostProcessStage({
            // _this.stage = new Cesium.PostProcessStage({
            name: name,
            fragmentShader: shader
        });
        // 设置天空气氛
        _this.postProcessStages.add(_this.stages[name]);
        _this.skyAtmosphere.hueShift = -0.8;
        _this.skyAtmosphere.saturationShift = -0.7;
        _this.skyAtmosphere.brightnessShift = -0.33;
        $('.cesium-viewer').css({
            filter: 'brightness(1.2)',
            '-webkit-filter': 'brightness(1.2)',
            '-mz-filter': 'brightness(1.2)',
            '-moz-filter': 'brightness(1.2)'
        });
    }

    raindrop() {
        let hrElement;
        let counter = 200;
        if ($('#raindrop').length === 0) {
            let div = document.createElement('div');
            div.id = 'raindrop';
            $('#cesiumContainer > div.cesium-viewer').append(div);
        }
        for (let i = 0; i < counter; i++) {
            hrElement = document.createElement('HR');
            if (i === counter - 1) {
                hrElement.className = 'raindrop';
                hrElement.style.display = "none";
            } else {
                hrElement.style.left = Math.floor(Math.random() * ($(window).width() + 120)) + 'px';
                hrElement.style.animationDuration = 0.5 + Math.random() * 0.3 + 's';
                hrElement.style.animationDelay = Math.random() * 5 + 's';
            }
            document.getElementById('raindrop').appendChild(hrElement);
        }

    }

    removeElement() {
        var _this = this;
        // _this.sign = true;
        $('#cesiumContainer > div.cesium-viewer > #raindrop').remove();
    }

    lightRain() {
        this.rain('小雨', this.shaderLight());
    }

    midRain() {
        this.rain('中雨', this.shaderMod());
    }

    heavyRain() {
        this.rain('大雨', this.shaderHeavy());
    }

    snow() {
        this.rain('下雪', this.shaderSnow());
        $('.cesium-viewer').css({
            filter: 'brightness(1.8)',
            '-webkit-filter': 'brightness(1.8)',
            '-mz-filter': 'brightness(1.8)',
            '-moz-filter': 'brightness(1.8)'
        });
    }

    overcast() {
        this.rain('阴天', this.shaderOvercast());
        // $('.cesium-viewer').css({
        //     filter: 'brightness(1.0)',
        //     '-webkit-filter': 'brightness(1.0)',
        //     '-mz-filter': 'brightness(1.0)',
        //     '-moz-filter': 'brightness(1.0)'
        // });
    }

    fog(delta) {
        var _this = this;
        var input =
            `<table>
				<tr>
					<td>强度：</td>
					<td><input id="fogInput" type="range" min="0" max="1" step="0.01"
							data-bind="value: fog, valueUpdate: 'input'" />
					</td>
				</tr>
			</table> `;
        // _this.rain(_this.shaderFog(_this.viewerModel.fog));
        // $('.cesium-viewer').css({
        // 	filter: 'brightness(1.0)',
        // 	'-webkit-filter': 'brightness(1.0)',
        // 	'-mz-filter': 'brightness(1.0)',
        // 	'-moz-filter': 'brightness(1.0)'
        // });
        _earth.weather.fog.enabled = true;
        _earth.weather.fog.density = 0.001;
        _this.fogStage = "fog";
    }

    shaderLight() {
        return 'uniform sampler2D colorTexture;\n ' +
            '   varying vec2 v_textureCoordinates;\n ' +
            ' \n ' +
            '    float hash(float x){\n ' +
            '        return fract(sin(x*133.3)*13.13);\n ' +
            ' }\n ' +
            ' \n ' +
            ' void main(void){\n ' +
            ' \n ' +
            '     float time = czm_frameNumber / 180.0;\n ' + //time:雨出现的波数   越大越密集
            ' vec2 resolution = czm_viewport.zw;\n ' +
            ' \n ' +
            //uv:雨滴的多少
            ' vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n ' +
            ' vec3 c=vec3(.4,.5,.6);\n ' + //雨的离镜头远近
            ' \n ' +
            //雨出现的角度1：中间 ；4左上到右下
            ' float a=-.1;\n ' +
            ' float si=sin(a),co=cos(a);\n ' +
            ' uv*=mat2(co,-si,si,co);\n ' +
            //屏幕刷新频率
            ' uv*=length(uv+vec2(0,4.9))*.10+3.;\n ' +
            ' \n ' +
            //100,雨滴的多少
            ' float v=1.-sin(hash(floor(uv.x*50.))*2.);\n ' +
            //雨的宽度;最后一个参数：雨的透明度
            ' float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*10.;\n ' +
            ' c*=v*b; \n ' + //雨的颜色
            ' \n ' +
            //第二参数：离镜头远近；第3参数：背景透明度
            ' gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,2), 0.2);  \n ' +
            ' }\n ';
    }

    shaderMod() {
        return "uniform sampler2D colorTexture;\n\ " +
            "   varying vec2 v_textureCoordinates;\n\ " +
            " \n\ " +
            "    float hash(float x){\n\ " +
            "        return fract(sin(x*133.3)*13.13);\n\ " +
            " }\n\ " +
            " \n\ " +
            " void main(void){\n\ " +
            " \n\ " +
            "     float time = czm_frameNumber / 120.0;\n\ " + //time:雨出现的波数   越大越密集
            " vec2 resolution = czm_viewport.zw;\n\ " +
            " \n\ " +
            //uv:雨滴的多少
            " vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\ " +
            " vec3 c=vec3(.6,.7,.8);\n\ " + //雨的离镜头远近
            " \n\ " +
            //雨出现的角度1：中间 ；4左上到右下
            " float a=-.2;\n\ " +
            " float si=sin(a),co=cos(a);\n\ " +
            " uv*=mat2(co,-si,si,co);\n\ " +
            //屏幕刷新频率
            " uv*=length(uv+vec2(0,4.9))*.10+2.;\n\ " +
            " \n\ " +
            //100,雨滴的多少
            " float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\ " +
            //雨的宽度;最后一个参数：雨的透明度
            " float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\ " +
            " c*=v*b; \n\ " + //雨的颜色
            " \n\ " +
            //第二参数：离镜头远近；第3参数：背景透明度
            " gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,2), 0.2);  \n\ " +
            " }\n\ ";
    }

    shaderHeavy() {
        return 'uniform sampler2D colorTexture;\n ' +
            '   varying vec2 v_textureCoordinates;\n ' +
            ' \n ' +
            '    float hash(float x){\n ' +
            '        return fract(sin(x*133.3)*13.13);\n ' +
            ' }\n ' +
            ' \n ' +
            ' void main(void){\n ' +
            ' \n ' +
            '     float time = czm_frameNumber / 90.0;\n ' + //time:雨出现的波数   越大越密集
            ' vec2 resolution = czm_viewport.zw;\n ' +
            ' \n ' +
            //uv:雨滴的多少
            ' vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n ' +
            ' vec3 c=vec3(.6,.7,.8);\n ' + //雨的离镜头远近
            ' \n ' +
            //雨出现的角度1：中间 ；4左上到右下
            ' float a=-.1;\n ' +
            ' float si=sin(a),co=cos(a);\n ' +
            ' uv*=mat2(co,-si,si,co);\n ' +
            //屏幕刷新频率
            ' uv*=length(uv+vec2(0,4.9))*.10+3.;\n ' +
            ' \n ' +
            //100,雨滴的多少
            ' float v=1.-sin(hash(floor(uv.x*100.))*2.);\n ' +
            //雨的宽度;最后一个参数：雨的透明度
            ' float b=clamp(abs(sin(20.*time*v+uv.y*(5./(3.+v))))-.95,0.,1.)*50.;\n ' +
            ' c*=v*b; \n ' + //雨的颜色
            ' \n ' +
            //第二参数：离镜头远近；第3参数：背景透明度
            ' gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.2);  \n ' +
            ' }\n ';
    }

    shaderSnow() {
        return 'uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                \n\
                float snow(vec2 uv,float scale)\n\
                {\n\
                    float time = czm_frameNumber / 60.0;\n\
                    float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                    uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                    uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                    p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                    k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                    return k*w;\n\
                }\n\
                \n\
                void main(void){\n\
                    vec2 resolution = czm_viewport.zw;\n\
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                    vec3 finalColor=vec3(0);\n\
                    float c = 0.0;\n\
                    c+=snow(uv,30.)*.0;\n\
                    c+=snow(uv,20.)*.0;\n\
                    c+=snow(uv,15.)*.0;\n\
                    c+=snow(uv,10.);\n\
                    c+=snow(uv,8.);\n\
                c+=snow(uv,6.);\n\
                    c+=snow(uv,5.);\n\
                    finalColor=(vec3(c)); \n\
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
                \n\
                }\n\
                ';
    }

    shaderOvercast() {
        return 'uniform sampler2D colorTexture;\n ' +
            '   varying vec2 v_textureCoordinates;\n ' +
            ' \n ' +
            '    float hash(float x){\n ' +
            '        return fract(sin(x*133.3)*13.13);\n ' +
            ' }\n ' +
            ' \n ' +
            ' void main(void){\n ' +
            ' \n ' +
            '     float time = czm_frameNumber / 180.0;\n ' + //time:雨出现的波数   越大越密集
            ' vec2 resolution = czm_viewport.zw;\n ' +
            ' \n ' +
            //uv:雨滴的多少
            ' vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n ' +
            ' vec3 c=vec3(.4,.5,.6);\n ' + //雨的离镜头远近
            ' \n ' +
            //雨出现的角度1：中间 ；4左上到右下
            ' float a=-.2;\n ' +
            ' float si=sin(a),co=cos(a);\n ' +
            ' uv*=mat2(co,-si,si,co);\n ' +
            //屏幕刷新频率
            ' uv*=length(uv+vec2(0,4.9))*.10+3.;\n ' +
            ' \n ' +
            //100,雨滴的多少
            ' float v=1.-sin(hash(floor(uv.x*50.))*2.);\n ' +
            //雨的宽度;最后一个参数：雨的透明度
            ' float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*1.;\n ' +
            ' c*=v*b; \n ' + //雨的颜色
            ' \n ' +
            //第二参数：离镜头远近；第3参数：背景透明度
            ' gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,2), 0.2);  \n ' +
            ' }\n ';
    }

    shaderFog(delta) {
        // console.log(delta);
        return 'uniform sampler2D colorTexture;\n' +
            '  uniform sampler2D depthTexture;\n' +
            '  varying vec2 v_textureCoordinates;\n' +
            '  void main(void)\n' +
            '  {\n' +
            '      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n' +
            '      vec4 fogcolor=vec4(0.5,0.5,0.5,' + delta + ');\n' +
            '      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n' +
            '      vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n' +
            '      float f=(depthcolor.r-0.7)/0.2;\n' +
            '      if(f<0.0) f=0.0;\n' +
            '      else if(f>1.0) f=1.0;\n' +
            '      gl_FragColor = mix(origcolor,fogcolor,f);\n' +
            '   }';
    }

    thunderstorm() {
        var _this = this;
        // _this.raindrop();

        // window.addEventListener('resize', load, true);

        // function load() {
        // 	if ($('#raindrop').length == 0) {
        // 		window.removeEventListener('resize', load, true);
        // 	} else {
        // 		_this.removeElement();
        // 		_this.raindrop();
        // 	}
        // }
        // _this.sign = false;
        // _this.timeout();

        _this.sign = false;
        // this.rain('闪电', this.shaderHeavy());
        _this.timeout();
    }

    timeout() {
        var _this = this;
        if (_this.sign == undefined)
            _this = this.weather.timeout
        if (_this.sign) {
            return;
        }
        setTimeout(function () {
            $('.cesium-viewer').css({
                filter: 'brightness(1.8)',
                '-webkit-filter': 'brightness(1.8)',
                '-mz-filter': 'brightness(1.8)',
                '-moz-filter': 'brightness(1.8)'
            });
            setTimeout(function () {
                $('.cesium-viewer').css({
                    filter: 'brightness(1.7)',
                    '-webkit-filter': 'brightness(1.7)',
                    '-mz-filter': 'brightness(1.7)',
                    '-moz-filter': 'brightness(1.7)'
                });
                setTimeout(function () {
                    $('.cesium-viewer').css({
                        filter: 'brightness(1.6)',
                        '-webkit-filter': 'brightness(1.6)',
                        '-mz-filter': 'brightness(1.6)',
                        '-moz-filter': 'brightness(1.6)'
                    });
                    setTimeout(function () {
                        $('.cesium-viewer').css({
                            filter: 'brightness(1.5)',
                            '-webkit-filter': 'brightness(1.5)',
                            '-mz-filter': 'brightness(1.5)',
                            '-moz-filter': 'brightness(1.5)'
                        });
                        setTimeout(function () {
                            $('.cesium-viewer').css({
                                filter: 'brightness(1.3)',
                                '-webkit-filter': 'brightness(1.3)',
                                '-mz-filter': 'brightness(1.3)',
                                '-moz-filter': 'brightness(1.3)'
                            });
                            setTimeout(function () {
                                $('.cesium-viewer').css({
                                    filter: 'brightness(1)',
                                    '-webkit-filter': 'brightness(1)',
                                    '-mz-filter': 'brightness(1)',
                                    '-moz-filter': 'brightness(1)'
                                });
                            }, 20);
                        }, 20);
                    }, 19);
                }, 12);
            }, 10);
        }, 1);
        setTimeout(() => {
            this.timeout()
        }, 4000);
        $('.cesium-viewer').css({
            filter: 'brightness(1.0)',
            '-webkit-filter': 'brightness(1.0)',
            '-mz-filter': 'brightness(1.0)',
            '-moz-filter': 'brightness(1.0)'
        });
    }

    addRainDrop() {
        var _this = this;
        _this.raindrop();
        window.addEventListener('resize', load, true);

        function load() {
            if ($('#raindrop').length == 0) {
                window.removeEventListener('resize', load, true);
            } else {
                _this.removeElement();
                _this.raindrop();
            }
        }

        _this.stage = 'addRainDrop';
        $('.cesium-viewer').css({
            filter: 'brightness(1.0)',
            '-webkit-filter': 'brightness(1.0)',
            '-mz-filter': 'brightness(1.0)',
            '-moz-filter': 'brightness(1.0)'
        });
    }

    cloudy() {
        var _this = this;
        _this.showStatus.cloud = true;
        if (_this.showStatus.sun) {
            // console.log($("#sunny"));
            $("#sunny").data("enabled", false);
            $("#sunny").find("img")[0].src = $("#sunny")[0].dataset.image + ".png";
        }
        // 关闭大气层否则近地情况下的天空是蓝色的
        _this.skyAtmosphere.show = false;
        _this.viewer.scene.skyBox = new Cesium.GroundSkyBox({
            sources: {
                positiveX: '../../img/weather/cloudy/Right.jpg',
                negativeX: '../../img/weather/cloudy/Left.jpg',
                positiveY: '../../img/weather/cloudy/Front.jpg',
                negativeY: '../../img/weather/cloudy/Back.jpg',
                positiveZ: '../../img/weather/cloudy/Up.jpg',
                negativeZ: '../../img/weather/cloudy/Down.jpg'

                // positiveX: 'images/sunny/bluesky/2/sign/right2.jpg',
                // negativeX: 'images/sunny/bluesky/2/sign/left2.jpg',
                // positiveY: 'images/sunny/bluesky/2/sign/front2.jpg',
                // negativeY: 'images/sunny/bluesky/2/sign/back2.jpg',
                // positiveZ: 'images/sunny/bluesky/2/sign/up2.jpg',
                // negativeZ: 'images/sunny/bluesky/2/sign/down.jpg'

                // positiveX: 'images/sunny/bluesky/posx.jpg',
                // negativeX: 'images/sunny/bluesky/negx.jpg',
                // positiveY: 'images/sunny/bluesky/negy.jpg',
                // negativeY: 'images/sunny/bluesky/posy.jpg',
                // positiveZ: 'images/sunny/bluesky/posz.jpg',
                // negativeZ: 'images/sunny/bluesky/negz.jpg'
            }
        });
        _this.stage = 'Cloudy';
        $('.cesium-viewer').css({
            filter: 'brightness(1.0)',
            '-webkit-filter': 'brightness(1.0)',
            '-mz-filter': 'brightness(1.0)',
            '-moz-filter': 'brightness(1.0)'
        });
    }

    sunny() {
        var _this = this;
        _this.showStatus.sun = true;
        if (_this.showStatus.cloud) {
            $("#cloudy").data("enabled", false);
            $("#cloudy").find("img")[0].src = $("#cloudy")[0].dataset.image + ".png";
        }
        _this.skyAtmosphere.show = false;
        try {
            _this.viewer.scene.skyBox = new Cesium.GroundSkyBox({
                sources: {
                    positiveX: '../../img/weather/sunny/Right.bmp',
                    negativeX: '../../img/weather/sunny/Left.bmp',
                    positiveY: '../../img/weather/sunny/Front.bmp',
                    negativeY: '../../img/weather/sunny/Back.bmp',
                    positiveZ: '../../img/weather/sunny/Up.bmp',
                    negativeZ: '../../img/weather/sunny/Down.bmp'

                    // positiveX: 'images/sunny/bluesky/right.jpg',
                    // negativeX: 'images/sunny/bluesky/left.jpg',
                    // positiveY: 'images/sunny/bluesky/front.jpg',
                    // negativeY: 'images/sunny/bluesky/back.jpg',
                    // positiveZ: 'images/sunny/bluesky/up.jpg',
                    // negativeZ: 'images/sunny/bluesky/down.jpg'

                    // positiveX: 'images/sunny/bluesky/posx.png',
                    // negativeX: 'images/sunny/bluesky/negx.png',
                    // positiveY: 'images/sunny/bluesky/negy.png',
                    // negativeY: 'images/sunny/bluesky/posy.png',
                    // positiveZ: 'images/sunny/bluesky/posz.png',
                    // negativeZ: 'images/sunny/bluesky/negz.png'
                }
            });
        } catch (error) {
            console.log(error);
        }

        _this.stage = 'sunny';
        $('.cesium-viewer').css({
            filter: 'brightness(1.3)',
            '-webkit-filter': 'brightness(1.3)',
            '-mz-filter': 'brightness(1.3)',
            '-moz-filter': 'brightness(1.3)'
        });
    }

    darkness() {
        let _this = this;
        clearInterval(darkTime)
        let bloom = _this.viewer.scene.postProcessStages.bloom;
        bloom.enabled = true;
        bloom.uniforms.glowOnly = true;
        bloom.uniforms.contrast = -11.28;
        bloom.uniforms.brightness = -0.01;
        bloom.uniforms.delta = 1;
        bloom.uniforms.sigma = 1;
        bloom.uniforms.stepSize = 0;
        darkTime = setInterval(_this.changeToDark, 50);
        _this.viewer.scene.skyAtmosphere.show = false;

    }

    changeToDark() {
        let _this = this;
        let bloom = _this.viewer.scene.postProcessStages.bloom;
        let contrast = bloom.uniforms.contrast;
        let brightness = bloom.uniforms.brightness;
        let delta = bloom.uniforms.delta;
        let sigma = bloom.uniforms.sigma;
        let stepSize = bloom.uniforms.stepSize;
        let contrastPer = (164 - (-11.28)) / 100;
        if (contrast < 164) {
            contrast += contrastPer;
            bloom.uniforms.contrast = contrast;
        }
        let brightnessPer = (-0.2 - (-0.01)) / 100;
        if (brightness > -0.2) {
            brightness += brightnessPer;
            bloom.uniforms.brightness = brightness;
        }
        let deltaPer = (1 - 0.9) / 100;
        if (delta > 0.9) {
            delta -= deltaPer;
            bloom.uniforms.delta = delta;
        }
        let sigmaPer = (1 - 0.2) / 100;
        if (sigma > 0.2) {
            sigma -= sigmaPer;
            bloom.uniforms.sigma = sigma;
        }
        let stepSizePer = (2.4 - 0) / 100;
        if (stepSize < 2.4) {
            stepSize += stepSizePer;
            bloom.uniforms.stepSize = stepSize;
        }
        if (contrast >= 164 && brightness <= -0.2 && delta <= 0.9 && sigma <= 0.2 && stepSize >= 2.4) {
            clearInterval(darkTime)
        }
    }

    changeToDayLight() {
        let _this = this;
        let bloom = _this.viewer.scene.postProcessStages.bloom;
        let contrast = bloom.uniforms.contrast;
        let brightness = bloom.uniforms.brightness;
        let delta = bloom.uniforms.delta;
        let sigma = bloom.uniforms.sigma;
        let stepSize = bloom.uniforms.stepSize;
        let contrastPer = (164 - (-11.28)) / 100;
        if (contrast > -11.28) {
            contrast -= contrastPer;
            bloom.uniforms.contrast = contrast;
        }
        let brightnessPer = (-0.2 - (-0.01)) / 100;
        if (brightness < -0.01) {
            brightness -= brightnessPer;
            bloom.uniforms.brightness = brightness;
        }
        let deltaPer = (1 - 0.9) / 100;
        if (delta < 1) {
            delta += deltaPer;
            bloom.uniforms.delta = delta;
        }
        let sigmaPer = (1 - 0.2) / 100;
        if (sigma < 1) {
            sigma += sigmaPer;
            bloom.uniforms.sigma = sigma;
        }
        let stepSizePer = (2.4 - 0) / 100;
        if (stepSize > 0) {
            stepSize -= stepSizePer;
            bloom.uniforms.stepSize = stepSize;
        }
        if (contrast <= -11.28 && brightness >= -0.01 && delta >= 1 && sigma >= 1 && stepSize <= 0) {
            clearInterval(darkTime)
            bloom.enabled = false;
        }
    }

    snowMountain() {
        var _this = this;
        var pointArray = [106.3822333081, 29.856563944917, 0, 106.37867133453, 29.854418177705, 0, 106.37489478423, 29.852615733247, 0, 106.37283484771, 29.85042705069, 0, 106.37008826568, 29.848753352265, 0, 106.36785666778, 29.847036738496, 0, 106.36455218627, 29.84536304007, 0, 106.36227767303, 29.841801066499, 0, 106.35893027618, 29.839311976533, 0, 106.35403792693, 29.834247965913, 0, 106.34863059356, 29.83047141562, 0, 106.34348075225, 29.825321574311, 0, 106.33645336463, 29.819098849398, 0, 106.32988731696, 29.810987849337, 0, 106.32817070319, 29.800044436556, 0, 106.33387844397, 29.791504283053, 0, 106.34344856574, 29.785066981417, 0, 106.35469238593, 29.783693690401, 0, 106.36173050238, 29.787341494662, 0, 106.36932651831, 29.791633029085, 0, 106.37537758185, 29.795795817476, 0, 106.38155739142, 29.79897155295, 0, 106.38537685706, 29.80180396567, 0, 106.39134208991, 29.806996722323, 0, 106.39593403174, 29.810859103304, 0, 106.40026848151, 29.817038912874, 0, 106.40310089423, 29.821030039889, 0, 106.41256372764, 29.831587214571, 0, 106.41840021446, 29.835578341585, 0, 106.42316381767, 29.83866824637, 0, 106.42097513511, 29.84210147391, 0, 106.41912977531, 29.845191378695, 0, 106.41835729912, 29.847551722628, 0, 106.41634027794, 29.849053759676, 0, 106.41445200279, 29.850341220003, 0, 106.41310016944, 29.848903555971, 0, 106.41116897895, 29.849847693544, 0, 106.40829655339, 29.849810788101, 0, 106.40567581489, 29.851049323184, 0, 106.40419523552, 29.852444071872, 0, 106.40286485984, 29.852658648593, 0, 106.40192072227, 29.853516955478, 0, 106.40037576988, 29.854160685642, 0, 106.39921705558, 29.854504008395, 0, 106.39853041008, 29.855018992526, 0, 106.39788667991, 29.855705638034, 0, 106.3975862725, 29.856263537509, 0, 106.39745752647, 29.856821436984, 0, 106.39687816932, 29.857658286197, 0, 106.39679233863, 29.858194727999, 0, 106.39655630424, 29.858623881442, 0, 106.39621298149, 29.859246153933, 0, 106.39510149123, 29.860017222505, 0, 106.3941637738, 29.861499209504, 0, 106.39291922881, 29.861327548127, 0, 106.3911596997, 29.861070056062, 0, 106.38802687957, 29.860297579865, 0, 106.38455073669, 29.859010119538, 0, 106.3822333081, 29.856563944917, 0];
        _this.snowPolygon = _this.viewer.entities.add({
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(pointArray),
                material: new Cesium.ImageMaterialProperty({
                    image: "../../img/weather/snowMountain.png",
                    // color: Cesium.Color.RED.withAlpha(0.3),
                }),
            },
        });
        this.snowLayer = "snow";
    }

    screenFog() {

        var fragmentShader = "  uniform sampler2D colorTexture;\n" +
            "  uniform sampler2D depthTexture;\n" +
            "  varying vec2 v_textureCoordinates;\n" +
            "  void main(void)\n" +
            "  {\n" +
            "      vec4 origcolor=texture2D(colorTexture, v_textureCoordinates);\n" +
            "      vec4 fogcolor=vec4(0.8,0.8,0.8," + delta + ");\n" +
            "\n" +
            "      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n" +
            "      vec4 depthcolor=texture2D(depthTexture, v_textureCoordinates);\n" +
            "\n" +
            "      float f=(depthcolor.r-0.22)/0.2;\n" +
            "      if(f<0.0) f=0.0;\n" +
            "      else if(f>1.0) f=1.0;\n" +
            "      gl_FragColor = mix(origcolor,fogcolor,f);\n" +
            "   }"
        this.FogStage = Cesium.PostProcessStageLibrary.createBrightnessStage();
        this.FogStage.uniforms.brightness = 2; //整个场景通过后期渲染变亮 1为保持不变 大于1变亮 0-1变暗 uniforms后面为对应glsl里面定义的uniform参数
        this.FogStage = new Cesium.PostProcessStage({
            "name": "self",
            //sampleMode:PostProcessStageSampleMode.LINEAR,
            fragmentShader: fragmentShader,
        });
        this.viewer.scene.postProcessStages.add(this.FogStage);
        this.FogStage.enabled = true;
        // console.log(this.FogStage);
        this.stage = "fog";
    }

    LoadSkybox() {
        var _this = this;
        _this.skyAtmosphere.show = true;
        _this.viewer.scene.skyBox = new Cesium.GroundSkyBox({
            sources: {
                negativeX: './Cesium/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_mx.jpg',
                negativeY: './Cesium/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_my.jpg',
                negativeZ: './Cesium/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_mz.jpg',
                positiveX: './Cesium/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_px.jpg',
                positiveY: './Cesium/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_py.jpg',
                positiveZ: './Cesium/Build/Cesium/Assets/Textures/SkyBox/tycho2t3_80_pz.jpg'
            }
        });
    }

    clear() {
        var _this = this;
        if (_this.stage == "sunny" || _this.stage == "Cloudy") {
            _this.LoadSkybox();
            $('.cesium-viewer').css({
                filter: 'brightness(1.0)',
                '-webkit-filter': 'brightness(1.0)',
                '-mz-filter': 'brightness(1.0)',
                '-moz-filter': 'brightness(1.0)'
            });
            _this.stage = null;
        }
        if (_this.stage == "thunderstorm" || _this.stage == "addRainDrop") {
            _this.removeElement();
            _this.stage = null;
            $('.cesium-viewer').css({
                filter: 'brightness(1.0)',
                '-webkit-filter': 'brightness(1.0)',
                '-mz-filter': 'brightness(1.0)',
                '-moz-filter': 'brightness(1.0)'
            });
        }
        if (_this.stage == "darkness") {
            _this.layer.show = false;
            _this.stage = null;
            // 关闭黑夜时，将时间重新设置为白天
            // _this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date('2021-01-01T12:00:00'));
            _this.viewer.clock.currentTime = Cesium.JulianDate.fromDate(new Date());
        }
        if (_this.snowLayer == "snow") {
            // object.water.snow.end();
            _this.viewer.entities.remove(_this.snowPolygon);
            _this.snowLayer = "";
        }
        if (_this.fogStage == "fog") {
            // this.FogStage.enabled = false;
            _earth.weather.fog.enabled = false;
        }
        if (_this.stage) {
            _this.sign = true;
            _this.postProcessStages.remove(_this.stage);
            _this.stage = null;
            _this.skyAtmosphere.hueShift = 0;
            _this.skyAtmosphere.saturationShift = 0;
            _this.skyAtmosphere.brightnessShift = 0;
            $('.cesium-viewer').css({
                filter: 'brightness(1.0)',
                '-webkit-filter': 'brightness(1.0)',
                '-mz-filter': 'brightness(1.0)',
                '-moz-filter': 'brightness(1.0)'
            });
        }
    }
}