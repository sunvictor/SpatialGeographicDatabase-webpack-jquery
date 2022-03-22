// import PolylineTrailLinkMaterialProperty from "../../plugins/mixin/PolylineTrailLinkMaterialProperty"
export default class DynamicWall {
    constructor(viewer) {
        this.viewer = viewer;
        this.init();
    }

    init() {
        this.wall1 = null;
        this.wall2 = null;

        this.positions1 = Cesium.Cartesian3.fromDegreesArrayHeights([
            106.39333886192763,29.805446699073283,430,
            106.39323480541461,29.805240914072673,430,
            106.39326028926978,29.80509233712171,430,
            106.39331134040468,29.8049834200215,430,
            106.39348208122794,29.804876418582797,430,
            106.39518237559467,29.8039853839415,430,
            106.39643671257913,29.803379889317686,430,
            106.39728858562195,29.802980415576734,430,
            106.39773235187796,29.802792486310647,430,
            106.39796064012761,29.802658547526544,430,
            106.39834408139869,29.802359915917926,430.,
            106.39875352921104,29.802035158769254,430.,
            106.39917435565721,29.80165860931642,430.,
            106.39965351784527,29.80114403521131,430.,
            106.39977848935226,29.80104636612915,430.,
            106.39994525834219,29.801014613940293,430,
            106.40013076851729,29.801062392793767,430,
            106.40047135252183,29.8014336059389,430,
            106.40104487035644,29.80188756252753,430,
            106.40142219913857,29.802070937832635,430,
            106.40199045928516,29.802269947845414,430,
            106.40204690657394,29.80237571057122,430,
            106.40200990734225,29.802488784021005,430,
            106.40066182635138,29.803108986855005,430,
            106.39851822688769,29.80403098708457,430,
            106.39825752160134,29.804214039842833,430,
            106.39696485154089,29.80532865124013,430,
            106.3949658364212,29.80709529238474,430,
            106.3948320139884,29.807133203017052,430,
            106.39472378868246,29.807111322844595,430,
            106.39442838289376,29.806764787130767,430,
            106.39393601720359,29.806092482252943,430,
            106.39333886192763,29.805446699073283,430,

        ]);
        this.positions2 = Cesium.Cartesian3.fromDegreesArrayHeights([
            106.38622904310917,29.809933384145932,430,
            106.38611096901575,29.80979964750139,430,
            106.38608299145977,29.809745489407057,430,
            106.38606778016636,29.809673849928966,430,
            106.38607850391911,29.809604503617244,430,
            106.38611834026236,29.809528523527792,430,
            106.38680590007415,29.809068455455062,430,
            106.38747281512514,29.808651233712464,430,
            106.38755809296272,29.808664615780735,430,
            106.38843601638628,29.809347391754407,430,
            106.38854309835952,29.809454377541865,430,
            106.38865033502442,29.80956098507345,430,
            106.38878507662902,29.80966572728171,430,
            106.38893628396916,29.809765773616885,430,
            106.38905610074701,29.809830026360775,430,
            106.38916833972009,29.809876521247954,430,
            106.38932329218675,29.809914877766122,430,
            106.38967845154356,29.809960413791803,430,
            106.38998094714928,29.809992961617596,430,
            106.3904750624119,29.810042100743985,430,
            106.39116940787876,29.810114812026733,430,
            106.39122496882918,29.81014646594761,430,
            106.39127788735743,29.81020185772939,430,
            106.39129405403112,29.81029693002155,430,
            106.3913042195131,29.81055469697938,430,
            106.39131286259969,29.810683565809057,430,
            106.3915512624964,29.811342991161684,430,
            106.39160915300639,29.811698236064878,430,
            106.39158119503553,29.812020171369234,430,
            106.39152256967563,29.81223294158425,430,
            106.39117871899319,29.813005709123235,430,
            106.3909189437637,29.813369466988945,430,
            106.39060762428171,29.81364850375772,430,
            106.39030291581484,29.81389507758804,430,
            106.39015557193797,29.813926422076367,430,
            106.38999635597818,29.813856000334773,430,
            106.38956719432493,29.8134921770933,430,
            106.38755538589486,29.81123279155282,430,
            106.38622904310917,29.809933384145932,430,
        ]);
        // this.initMaterial();
        this.initMaterial2();
    }
    initMaterial() {
        class PolylineTrailLinkMaterialProperty {
            constructor(color, duration) {
                this._definitionChanged = new Cesium.Event();
                this._color = undefined;
                this._colorSubscription = undefined;
                this.color = color;
                this.duration = duration;
                this._time = new Date().getTime();
            }
            getType(time) {
                return 'PolylineTrailLink';
            }
            getValue(time, result) {
                if (!Cesium.defined(result)) {
                    result = {};
                }
                result.color = Cesium.Property.getValueOrClonedDefault(
                    this._color,
                    time,
                    Cesium.Color.WHITE,
                    result.color
                );
                result.image = Cesium.Material.PolylineTrailLinkImage;
                result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
                return result;
            }
            equals(other) {
                return (
                    this === other ||
                    (other instanceof PolylineTrailLinkMaterialProperty && Property.equals(this._color, other._color))
                );
            }
        }
        Object.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
            isConstant: {
                get() {
                    return false;
                }
            },
            definitionChanged: {
                get() {
                    return this._definitionChanged;
                }
            },
            color: Cesium.createPropertyDescriptor('color')
        });
        Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
        Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
        Cesium.Material.PolylineTrailLinkImage = '../../img/effect/wall/colors3.png';
        Cesium.Material.PolylineTrailLinkSource =
            'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                        {\n\
                                                            czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                            vec2 st = materialInput.st;\n\
                                                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                            material.alpha = colorImage.a * color.a;\n\
                                                            material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                            return material;\n\
                                                        }';
        Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
            fabric: {
                type: Cesium.Material.PolylineTrailLinkType,
                uniforms: {
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                    image: Cesium.Material.PolylineTrailLinkImage,
                    time: 0
                },
                source: Cesium.Material.PolylineTrailLinkSource
            },
            translucent(material) {
                return true;
            }
        });
    }
    initMaterial2() {
        class PolylineTrailLinkMaterialProperty2 {
            constructor(color, duration) {
                this._definitionChanged = new Cesium.Event();
                this._color = undefined;
                this._colorSubscription = undefined;
                this.color = color;
                this.duration = duration;
                this._time = new Date().getTime();
            }
            getType(time) {
                return 'PolylineTrailLink';
            }
            getValue(time, result) {
                if (!Cesium.defined(result)) {
                    result = {};
                }
                result.color = Cesium.Property.getValueOrClonedDefault(
                    this._color,
                    time,
                    Cesium.Color.WHITE,
                    result.color
                );
                result.image = Cesium.Material.PolylineTrailLinkImage;
                result.time = ((new Date().getTime() - this._time) % this.duration) / this.duration;
                return result;
            }
            equals(other) {
                return (
                    this === other ||
                    (other instanceof PolylineTrailLinkMaterialProperty2 && Property.equals(this._color, other._color))
                );
            }
        }
        Object.defineProperties(PolylineTrailLinkMaterialProperty2.prototype, {
            isConstant: {
                get() {
                    return false;
                }
            },
            definitionChanged: {
                get() {
                    return this._definitionChanged;
                }
            },
            color: Cesium.createPropertyDescriptor('color')
        });
        Cesium.PolylineTrailLinkMaterialProperty2 = PolylineTrailLinkMaterialProperty2;
        Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
        Cesium.Material.PolylineTrailLinkImage = '../../img/effect/wall/colors3.png';
        Cesium.Material.PolylineTrailLinkSource =
            'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                        {\n\
                                                            czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                            vec2 st = materialInput.st;\n\
                                                            vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                            material.alpha = colorImage.a * color.a;\n\
                                                            material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                            return material;\n\
                                                        }';
        Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
            fabric: {
                type: Cesium.Material.PolylineTrailLinkType,
                uniforms: {
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                    image: Cesium.Material.PolylineTrailLinkImage,
                    time: 0
                },
                source: Cesium.Material.PolylineTrailLinkSource
            },
            translucent(material) {
                return true;
            }
        });
    }
    start() {
        let _this = this;
        Cesium.Material.PolylineTrailLinkImage = '../../img/effect/wall/colors1.png';
        Cesium.Material.PolylineTrailLinkSource =
            'czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                {\n\
                czm_material material = czm_getDefaultMaterial(materialInput);\n\
                vec2 st = materialInput.st;\n\
                vec4 colorImage = texture2D(image, vec2(fract(st.t - time), st.t));\n\
                material.alpha = colorImage.a * color.a;\n\
                material.diffuse = color.rgb;\n\
                return material;\n\
                }';
        Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
            fabric: {
                type: Cesium.Material.PolylineTrailLinkType,
                uniforms: {
                    color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                    image: Cesium.Material.PolylineTrailLinkImage,
                    time: 0
                },
                source: Cesium.Material.PolylineTrailLinkSource
            },
            translucent(material) {
                return true;
            }
        });
        if (_this.wall1 != null || _this.wall2 != null) {
            viewer.entities.remove(_this.wall1);
            viewer.entities.remove(_this.wall2);
        }
        _this.wall1 = viewer.entities.add({
            name: 'wall',
            wall: {
                positions: _this.positions1,
                material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.BLUE, 2000)
            }
        });
        _this.wall2 = viewer.entities.add({
            name: 'wall',
            wall: {
                positions: _this.positions2,
                material: new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.RED, 2000)
            }
        });
        viewer.camera.setView({
            destination: new Cesium.Cartesian3(-1563985.471332802,5316140.128447001,3151146.75720962),
            orientation: {
                heading: 6.264153485786127,
                pitch: -0.695556474038856,
                roll: 2.9866045903048644e-7
            }
        });
    }
    clear() {
        if (this.wall1 == null) {
            layer.msg('<span style="color:red">请先加载动态墙哟！', {
                icon: 2,
                time: 2000 //2秒关闭（如果不配置，默认是3秒）
            });
            return;
        }
        if (this.wall2 == null) {
            layer.msg('<span style="color:red">请先加载动态墙哟！', {
                icon: 2,
                time: 2000 //2秒关闭（如果不配置，默认是3秒）
            });
            return;
        }
        viewer.entities.remove(this.wall1);
        viewer.entities.remove(this.wall2);
    }
}