import {go} from "@/js/cesium/globalObject";
import gykjPanel from "@/js/plugins/panel";
import panel from "@/js/plugins/panel";

let _btnName = "全景360"
let _btnIdName = "panoramicView"
export default class PanoramicView {
    panoramicHandler = null;
    viewer = null;
    dataSourceForCluster = null;
    viewModel = {
        enabled: false
    }

    constructor(viewer) {
        this.viewer = viewer;
        this.bindModel();
    }

    createPoint(lon, lat, name) {
        var _this = this;
        _this.dataSourceForCluster.entities.add({
            type: 'panoramicView',
            name: name,
            // id: "" + i,
            // position: Cesium.Cartesian3.fromDegrees(Math.random() * 360 - 180, Math.random() * 180 - 90),
            position: Cesium.Cartesian3.fromDegrees(lon, lat),
            billboard: {
                image: '../../../img/others/mark1.png',
                eyeOffset: new Cesium.ConstantProperty(new Cesium.Cartesian3(0, 0, 0)),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //绝对贴地
                clampToGround: true,
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //元素在正上方
                scale: 0.7,
                width: 20,
                height: 20,
            }
        });
    }

    clickPoint() {
        var _this = this;
        _this.panoramicHandler = new Cesium.ScreenSpaceEventHandler(_this.viewer.canvas);
        _this.panoramicHandler.setInputAction(function (event) {
            var pick = viewer.scene.pick(event.position);
            if (Cesium.defined(pick)) {
                if (pick.id.type == 'panoramicView') {
                    _this.addLayer(pick.id.name);
                } else {
                    return;
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    clear() {
        var _this = this;
        _this.viewer.dataSources.remove(_this.dataSourceForCluster);
        if (_this.panoramicHandler) {
            _this.panoramicHandler.destroy();
        }
    }

    /**
     * 弹窗
     * @param {*} name
     */
    addLayer(name) {
        // var index = layer.open({
        //     type: 2,
        //     title: name,
        //     area: ['80%', '70%'],
        //     shade: [0.8, '#393D49'],
        //     shadeClose: true,
        //     content: '../../../js/cesium/effect/HTML/360/Sphere.html?' + name, //这里content是一个普通的String
        //     closeBtn: 1,
        //     scrollbar: false,
        //     resize: false,
        //     maxmin: true,
        //     full(layero) {
        //         //点击最大化后的回调函数
        //         $('.layui-layer-content').css({
        //             width: '100%',
        //             height: '100%'
        //         });
        //         $('iframe').css({
        //             width: '100%',
        //             height: '100%'
        //         });
        //     },
        //     success(layero, index) {
        //         layero.find('.layui-layer-min').remove();
        //     }
        // });
        this.panel = new gykjPanel({
            title: "全景360",
            show: true,
            width: 1000,
            height: 600,
            type: 2,
            top: 100,
            left: 300,
            // left: 900,
            content: '../../../js/cesium/effect/HTML/360/Sphere.html?' + name,
        })
    }

    start() {
        var _this = this;
        _this.dataSourceForCluster = new Cesium.CustomDataSource('cluster');
        var count = 1000;
        var position = Cesium.Cartesian3.fromDegrees(106.39072410965629, 29.838028890418204, 500);
        var pointArray = [106.39329457675916, 29.839602419438034,
            106.39319184450478, 29.83978500106265,
            106.393142601819, 29.840834615922326,
            106.39191486930582, 29.841411141696334,
            106.39234950540896, 29.841390087402694,
            106.39122883649434, 29.840878208349835,
            106.39085910111285, 29.840971259628894,
            106.38988507560128, 29.841537494754284,
            106.39236373080706, 29.83911227372327,
            106.39166125577658, 29.83868618138927,
            106.39146979739363, 29.838802612510733,
            106.38945992825899, 29.839231346349106,
        ];
        _this.createPoint(106.39329457675916, 29.839602419438034, '大门');
        _this.createPoint(106.39319184450478, 29.83978500106265, '售票处');
        _this.createPoint(106.393142601819, 29.840834615922326, '相思岩');
        _this.createPoint(106.39191486930582, 29.841411141696334, '青云寨遗址');
        _this.createPoint(106.39234950540896, 29.841390087402694, '宝塔');
        _this.createPoint(106.39122883649434, 29.840878208349835, '拨云见塔');
        _this.createPoint(106.39085910111285, 29.840971259628894, '狮子峰'); //不准
        _this.createPoint(106.38988507560128, 29.841537494754284, '竹苑');
        _this.createPoint(106.39236373080706, 29.83911227372327, '太虚塔');
        _this.createPoint(106.39166125577658, 29.83868618138927, '缙云寺');
        _this.createPoint(106.39146979739363, 29.838802612510733, '缙云寺内');
        _this.createPoint(106.38945992825899, 29.839231346349106, '松云轩'); //不准
        _this.createPoint(106.38966522434086, 29.83915900773117, '海螺洞');
        _this.createPoint(106.38817868701857, 29.838787413225237, '猿啸峰');
        _this.createPoint(106.38783091443345, 29.83801893021242, '莲花峰');
        _this.createPoint(106.38691691257822, 29.83790679382691, '宝塔峰');
        _this.createPoint(106.38550275942556, 29.83329850134254, '邓小平旧居');
        _this.createPoint(106.38500105968971, 29.833130237422072, '邓伯承旧居');
        _this.createPoint(106.39084651223577, 29.83846453101012, '中心花园');
        _this.createPoint(106.39190724173791, 29.838469524779892, '明代石坊');
        _this.createPoint(106.390138195011, 29.83857989142194, '斯巴鲁生态林');
        _this.createPoint(106.39205724198823, 29.838376066351564, '晚唐石照壁');
        _this.createPoint(106.3913973079774, 29.838716377396413, '石碑');
        _this.createPoint(106.39216311109438, 29.83840518780462, '衡亭');
        _this.createPoint(106.39034521617425, 29.8384535521021, '八角井1');
        _this.createPoint(106.39025853117397, 29.838482012683368, '八角井2');
        _this.createPoint(106.39074212749087, 29.83841027858238, '草坪');
        _this.createPoint(106.3916066311063, 29.8389193640692, '许愿树');
        _this.createPoint(106.3930429013645, 29.838627805493722, '树林1');
        _this.createPoint(106.38942264362971, 29.838472930077135, '树林2');
        _this.createPoint(106.39191953188137, 29.838451924925177, '台阶');
        _this.createPoint(106.38966201665481, 29.839484844245, '登山步道');
        _this.createPoint(106.39072410965629, 29.838028890418204, '缙云山宾馆');

        var options = {
            camera: viewer.scene.camera,
            canvas: viewer.scene.canvas
        };

        var dataSourcePromise = viewer.dataSources.add(_this.dataSourceForCluster);

        dataSourcePromise.then(function (dataSource) {
            var pixelRange = 15; // 代码中pixelRange是聚合距离，也就是小于这个距离就会被聚合
            var minimumClusterSize = 3; // 是每个聚合点的最小聚合个数，这个值最好是设置为2，因为两个图标也可能叠压
            var enabled = true;

            dataSource.clustering.enabled = enabled;
            dataSource.clustering.pixelRange = pixelRange;
            dataSource.clustering.minimumClusterSize = minimumClusterSize;

            var removeListener;

            var pinBuilder = new Cesium.PinBuilder();
            var url = Cesium.buildModuleUrl("../../../img/others/mark4.png");
            var pin50 = pinBuilder.fromText('50+', Cesium.Color.RED, 48).toDataURL();
            var pin40 = pinBuilder.fromText('40+', Cesium.Color.ORANGE, 48).toDataURL();
            var pin30 = pinBuilder.fromText('30+', Cesium.Color.YELLOW, 48).toDataURL();
            var pin20 = pinBuilder.fromText('20+', Cesium.Color.GREEN, 48).toDataURL();
            var pin10 = pinBuilder.fromText('10+', Cesium.Color.BLUE, 48).toDataURL();
            var groceryPin = Cesium.when(
                pinBuilder.fromUrl(url, Cesium.Color.GREEN, 48),
                function (canvas) {
                    return viewer.entities.add({
                        name: "Grocery store",
                        position: Cesium.Cartesian3.fromDegrees(-75.1705217, 39.921786),
                        billboard: {
                            image: canvas.toDataURL(),
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        }
                    });
                }
            );
            var singleDigitPins = new Array(8);
            for (var i = 0; i < singleDigitPins.length; ++i) {
                singleDigitPins[i] = pinBuilder.fromText('' + (i + 2), Cesium.Color.VIOLET, 48).toDataURL();
            }

            function customStyle() {
                if (Cesium.defined(removeListener)) {
                    removeListener();
                    removeListener = undefined;
                } else {
                    removeListener = dataSource.clustering.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
                        cluster.label.show = false;
                        cluster.billboard.show = true;
                        cluster.billboard.id = cluster.label.id;
                        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
                        cluster.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND; //绝对贴地
                        // cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY; //元素在正上方
                        if (clusteredEntities.length >= 50) {
                            cluster.billboard.image = pin50;
                        } else if (clusteredEntities.length >= 40) {
                            cluster.billboard.image = pin40;
                        } else if (clusteredEntities.length >= 30) {
                            cluster.billboard.image = pin30;
                        } else if (clusteredEntities.length >= 20) {
                            cluster.billboard.image = pin20;
                        } else if (clusteredEntities.length >= 10) {
                            cluster.billboard.image = pin10;
                        } else {
                            cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
                        }
                    });
                }

                // force a re-cluster with the new styling
                var pixelRange = dataSource.clustering.pixelRange;
                dataSource.clustering.pixelRange = 0;
                dataSource.clustering.pixelRange = pixelRange;
            }

            customStyle();
        });
    }


    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById(_btnIdName); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'enabled').subscribe(
            function (newValue) {
                go.bbi.bindImg(_btnName, _btnIdName, newValue) // 切换是否选中图片
                if (newValue) {
                    _this.start();
                    _this.clickPoint();
                } else {
                    _this.clear();
                }
            }
        );
    }
}