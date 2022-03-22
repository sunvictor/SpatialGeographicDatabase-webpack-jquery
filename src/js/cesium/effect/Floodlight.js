import {go} from "@/js/cesium/globalObject";
import gykjAlert from "@/js/plugins/alert";
let _btnName = "路灯"
let _btnIdName = "floodLight"
export default class Floodlight {
    wall = null;
    green_polyline = null;
    blue_polyline = null;
    viewModel = {
        show: false,
        glowOnly: false,
        contrast: 120,
        brightness: -0.3,
        delta: 0.0,
        sigma: 3.78,
        stepSize: 5.0
    };
    temp = 0;
    dataSource = null;

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer
        _this.entities = _this.viewer.entities
        _this.positions1 = [
            1.857079752836525, 0.5204453345269348, 240,
            1.8570862452713601, 0.5204491774343244, 240,
            1.8570927377354658, 0.5204530203237925, 240,
            1.8570970221659693, 0.5204560490581336, 240,
            1.8571013066108253, 0.5204590777841174, 240,
            1.857105591070034, 0.5204621065017438, 240,
            1.8571101320723449, 0.5204661476502503, 240,
            1.8571146730955863, 0.5204701887896733, 240,
            1.8571192141397586, 0.520474229920013, 240,
            1.8571234955941902, 0.5204781667105726, 240,
            1.8571277770673105, 0.5204821034925526, 240,
            1.8571320585591196, 0.5204860402659535, 240,
            1.8571363400696175, 0.5204899770307744, 240,
            1.857140621598804, 0.5204939137870151, 240,
            1.8571451187838344, 0.5204987079761825, 240,
            1.8571496159917051, 0.5205035021545023, 240,
            1.8571540462968736, 0.5205079827081459, 240,
            1.8571584766244484, 0.5205124632528633, 240,
            1.8571629069744298, 0.5205169437886542, 240,
            1.8571673066676835, 0.5205212916585832, 240,
            1.8571717063824147, 0.5205256395196121, 240,
            1.857176106118623, 0.5205299873717402, 240,
            1.8571805058763082, 0.5205343352149673, 240,
            1.8571873635101428, 0.5205403482521727, 240,
            1.857192922889045, 0.5205438411434723, 240,
            1.8571984822906795, 0.5205473340216292, 240,
            1.8572040417150466, 0.5205508268866433, 240,
            1.8572087003247957, 0.5205542896360039, 240,
            1.8572129569504834, 0.5205579036005723, 240,
            1.8572172135950547, 0.5205615175583075, 240,
            1.8572214702585093, 0.5205651315092095, 240,
            1.8572255761263154, 0.5205687710745356, 240,
            1.8572296820117706, 0.5205724106329706, 240,
            1.857233787914875, 0.5205760501845146, 240,
            1.8572378938356284, 0.5205796897291671, 240,
            1.8572419997740308, 0.5205833292669281, 240,
            1.8572461057300822, 0.520586968797797, 240,
            1.8572505352685442, 0.5205908670910653, 240,
            1.8572549648274015, 0.5205947653763067, 240,
            1.8572593944066542, 0.5205986636535206, 240,
            1.857263824006302, 0.5206025619227067, 240,
            1.857268253626345, 0.5206064601838648, 240,
            1.857272683266783, 0.5206103584369945, 240,
        ];
        _this.positions_0 = [
            1.857079752836525, 0.5204453345269348, 0,
            1.8570862452713601, 0.5204491774343244, 0,
            1.8570927377354658, 0.5204530203237925, 0,
            1.8570970221659693, 0.5204560490581336, 0,
            1.8571013066108253, 0.5204590777841174, 0,
            1.857105591070034, 0.5204621065017438, 0,
            1.8571101320723449, 0.5204661476502503, 0,
            1.8571146730955863, 0.5204701887896733, 0,
            1.8571192141397586, 0.520474229920013, 0,
            1.8571234955941902, 0.5204781667105726, 0,
            1.8571277770673105, 0.5204821034925526, 0,
            1.8571320585591196, 0.5204860402659535, 0,
            1.8571363400696175, 0.5204899770307744, 0,
            1.857140621598804, 0.5204939137870151, 0,
            1.8571451187838344, 0.5204987079761825, 0,
            1.8571496159917051, 0.5205035021545023, 0,
            1.8571540462968736, 0.5205079827081459, 0,
            1.8571584766244484, 0.5205124632528633, 0,
            1.8571629069744298, 0.5205169437886542, 0,
            1.8571673066676835, 0.5205212916585832, 0,
            1.8571717063824147, 0.5205256395196121, 0,
            1.857176106118623, 0.5205299873717402, 0,
            1.8571805058763082, 0.5205343352149673, 0,
            1.8571873635101428, 0.5205403482521727, 0,
            1.857192922889045, 0.5205438411434723, 0,
            1.8571984822906795, 0.5205473340216292, 0,
            1.8572040417150466, 0.5205508268866433, 0,
            1.8572087003247957, 0.5205542896360039, 0,
            1.8572129569504834, 0.5205579036005723, 0,
            1.8572172135950547, 0.5205615175583075, 0,
            1.8572214702585093, 0.5205651315092095, 0,
            1.8572255761263154, 0.5205687710745356, 0,
            1.8572296820117706, 0.5205724106329706, 0,
            1.857233787914875, 0.5205760501845146, 0,
            1.8572378938356284, 0.5205796897291671, 0,
            1.8572419997740308, 0.5205833292669281, 0,
            1.8572461057300822, 0.520586968797797, 0,
            1.8572505352685442, 0.5205908670910653, 0,
            1.8572549648274015, 0.5205947653763067, 0,
            1.8572593944066542, 0.5205986636535206, 0,
            1.857263824006302, 0.5206025619227067, 0,
            1.857268253626345, 0.5206064601838648, 0,
            1.857272683266783, 0.5206103584369945, 0,
        ];
        let options = {
            btn: $("#"+ _btnIdName).next(),
            content: `<div id='floodlight_config'>
    <div><span>亮度</span></div>
    <div><input type='range' min="0" max="1" step="0.01" data-bind="value: delta, valueUpdate: 'input'"></div></div>`
        }
        console.log(3)
        let lightAlert = new gykjAlert(options)
        _this.bindModel();
    }

    clear() {
        let _this = this;
        if (_this.green_polyline != null) {
            _this.entities.remove(_this.green_polyline);
            _this.green_polyline = null;
        }
        if (_this.blue_polyline != null) {
            _this.entities.remove(_this.blue_polyline);
            _this.blue_polyline = null;
        }
        if (_this.dataSource != null) {
            _this.viewer.dataSources.remove(_this.dataSource);
            _this.dataSource = null;
        }
        _this.viewer.scene.postProcessStages.bloom.enabled = false;
    }

    start() {
        let _this = this;
        let position_430 = Cesium.Cartesian3.fromRadiansArrayHeights(_this.positions1)
        let position_0 = Cesium.Cartesian3.fromRadiansArrayHeights(_this.positions_0)
        _this.dataSource = new Cesium.CustomDataSource("路灯");
        _this.viewer.dataSources.add(_this.dataSource);
        for (let i = 0; i < position_0.length; i++) {
            _this.dataSource.entities.add(new Cesium.Entity({
                polyline: {
                    positions: [position_430[i], position_0[i]],
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.3,
                        color: Cesium.Color.WHITE.withAlpha(0.9),
                    }),
                    width: 5
                }
            }));
        }
        // _this.light("路灯");
        _this.updatePostProcess();
    }

    bloom() {
        this.light("灯光");
    }

    light(name) {
        let _this = this;
        _this.viewModel.delta = $("#light").val()
        _this.updatePostProcess(_this.viewModel);
        $("#light").on("input propertychange", function () {
            _this.viewModel.delta = $("#light").val()
            _this.updatePostProcess();
        });
    }

    updatePostProcess() {
        let _this = this;
        let bloom = _this.viewer.scene.postProcessStages.bloom;
        let delta = Number(_this.viewModel.delta);
        // if (delta == 0) {
        //     bloom.enabled = false;
        // } else {
        //     bloom.enabled = true;
        // }
        bloom.uniforms.glowOnly = Boolean(_this.viewModel.glowOnly);
        bloom.uniforms.contrast = Number(_this.viewModel.contrast);
        bloom.uniforms.brightness = Number(_this.viewModel.brightness);
        bloom.uniforms.delta = 1 - Number(_this.viewModel.delta);
        bloom.uniforms.sigma = Number(_this.viewModel.sigma);
        bloom.uniforms.stepSize = Number(_this.viewModel.stepSize);
    }

    getColorRamp(elevationRamp, isVertical = true) {
        let ramp = document.createElement('canvas');
        ramp.width = isVertical ? 1 : 100;
        ramp.height = isVertical ? 100 : 1;
        let ctx = ramp.getContext('2d');

        let values = elevationRamp;
        let grd = isVertical ? ctx.createLinearGradient(0, 0, 0, 100) : ctx.createLinearGradient(0, 0, 100, 0);
        let v = 0.2
        let letr = 0
        for (let i = 0; i < 20; i++) {
            v = v - 0.01
            letr = letr + 0.025
            // console.log(letr,v)
            grd.addColorStop(letr, 'rgba(137,242,245,' + v + ')'); //white
        }

        for (let i = 0; i < 19; i++) {
            v = v + 0.01
            letr = letr + 0.025
            grd.addColorStop(letr, 'rgba(137,242,245,' + v + ')'); //white
        }


        ctx.globalAlpha = 0.3;
        ctx.fillStyle = grd;
        if (isVertical)
            ctx.fillRect(0, 0, 1, 100);
        else
            ctx.fillRect(0, 0, 100, 1);

        return ramp;
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById("floodlight_config"); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'show').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue) // 切换是否选中图片
                if (newValue){
                    _this.start();
                }else{
                    _this.clear();
                }
                _this.viewer.scene.postProcessStages.bloom.enabled = newValue
            }
        );
        Cesium.knockout.getObservable(_this.viewModel, 'delta').subscribe(
            function (newValue) {
                _this.updatePostProcess();
            }
        );
    }
}