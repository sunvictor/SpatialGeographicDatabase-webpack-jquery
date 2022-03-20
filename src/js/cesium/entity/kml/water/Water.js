import {go} from "../../../globalObject";
import cm from "@/js/plugins/CesiumMethod";

export default class Water {
    viewer = null;
    scene = null;
    clock = null;
    canvas = null;
    camera = null;
    ellipsoid = null;
    AllRiver = null;
    AllRiverArray = [];
    //获取XML文档
    xml = null;
    //获取文档中"name"元素节点集合(数组)
    domElems = null;
    //创建"strNames"数组用于存储"用户名"
    strNames = "";
    // 正则表达式去掉kml坐标中的空白符
    patt1 = /\s/g;
    patt2 = /,/g;
    xmlArray = [];
    x1 = [];
    polygonInstances = [];
    carto = [];
    car3 = [];
    cartoPositions = [];
    viewModel = {
        animationSpeed: 0.02, // 流动速度
        normalMap: 'images/water2.jpg', //水面图片
        frequency: 80.0,//波动频率
        amplitude: 2.5, //振幅频率
        specularIntensity: 0.5, // 镜面反射强度
        drawWaterEnabled: false
    }

    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
        _this.scene = viewer.scene;
        _this.clock = viewer.clock;
        _this.canvas = viewer.scene.canvas;
        _this.camera = viewer.scene.camera;
        _this.ellipsoid = viewer.scene.globe.ellipsoid;
        _this.bindModel();
    }

    clear() {
        let _this = this;
        _this.polygonInstances = [];
        _this.carto = [];
        _this.car3 = [];
        _this.cartoPositions = [];
        _this.xmlArray = [];
        _this.x1 = [];
    }

    loadXMLDoc(xmlFile, isHeight, classificationType) {
        let that = this;
        $.ajaxSettings.async = false;
        $.get(xmlFile, function (xml) {
            that.startEvent(xml, isHeight, classificationType);
        })
        $.ajaxSettings.async = true;
    }

    createPrimitive(polygonInstances, classificationType) {
        let _this = this;
        _this.AllRiver = new Cesium.GroundPrimitive({
            show: true,
            geometryInstances: polygonInstances,
            classificationType: Cesium.defaultValue(classificationType, Cesium.ClassificationType.TERRAIN),
            appearance: new Cesium.EllipsoidSurfaceAppearance({
                aboveGround: true, // 如果为 true ，则该几何体应位于椭圆体的表面上-不在其上方的恒定高度-因此 EllipsoidSurfaceAppearance＃renderState 启用了背面剔除。
                translucent: false, // 如果为 true ，则几何图形应显示为半透明。
                closed: true // 如果为 true ，则几何将被关闭，因此 EllipsoidSurfaceAppearance＃renderState 启用了背面剔除。如果查看者输入了几何图形，则它将不可见。
                // material: River_Material,
            }),
        });
    }

    createGeometry(points, isHeight) {
        let _this = this;
        let newPoints = [];
        let car = null;
        if (isHeight) {
            car = Cesium.Cartesian3.fromDegreesArrayHeights(points);
        } else {
            car = Cesium.Cartesian3.fromDegreesArray(points);

        }
        let geometry = new Cesium.GeometryInstance({
            geometry: new Cesium.PolygonGeometry({
                polygonHierarchy: new Cesium.PolygonHierarchy(car),
                extrudedHeight: 260,
                // height: 220,
                vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                //vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
                clampToGround: true //开启贴地
                //perPositionHeight : true
            }),
        })
        return geometry;
    }

    drawWater(newValue) {
        let _this = this;
        if (!newValue) return;
        _this.clear();
        go.plot.trackPolygon(function (position) {
            console.log(position)
            position.push(position[position.length - 1]);
            let geometry = new Cesium.GeometryInstance({
                geometry: new Cesium.PolygonGeometry({
                    polygonHierarchy: new Cesium.PolygonHierarchy(position),
                    extrudedHeight: 260,
                    // height: 220,
                    vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    //vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL,
                    clampToGround: true //开启贴地
                    //perPositionHeight : true
                }),
            })
            _this.polygonInstances.push(geometry);
            _this.createWater(Cesium.ClassificationType.TERRAIN);
            let newNode = {
                name: _this.AllRiver.name ? _this.AllRiver.name : "未命名水面",
                checked: _this.AllRiver.show
            }
            let node = go.ec.addNode(-1, newNode, _this.AllRiver);
            _this.viewModel.drawWaterEnabled = false;
        }, function (positions) {
            console.log(positions)
        })
    }

    start(url, isHeight, classificationType) {
        let _this = this;
        _this.AllRiverArray = [];
        this.loadXMLDoc(url, isHeight, classificationType);
        let newNode = {
            name: _this.AllRiver.name ? _this.AllRiver.name : "未命名水面",
            checked: _this.AllRiver.show
        }
        let node = go.ec.addNode(-1, newNode, _this.AllRiver)
        return _this.AllRiver;
    }

    startEvent(xmls, isHeight, classificationType) {
        let _this = this;
        _this.clear();
        // 读取XML文件中`coordinates` 节点中的坐标
        _this.domElems = $(xmls).find("coordinates");
        for (let i = 0; i < _this.domElems.length; i++) {
            // let str = _this.domElems[i].childNodes[0].data;
            let str = _this.domElems[i].innerHTML;
            // 将第一个空白符去掉，不同的kml文件有可能没有第一个空白符，如果没有就将这行注释掉
            // let n3 = str.substring(1, str.length);
            // 将空白符转换成逗号
            let n1 = str.replace(_this.patt1, ",")
            //n1=n1.replace(/,0/g, "");
            // 将逗号转换成逗号加空格
            let n2 = n1.replace(_this.patt2, ", ")

            //取得"name"元素节点的子节点(文本节点)的数据,并存入"strNames"数组
            _this.strNames += n2
            _this.xmlArray.push(n2)
        }
        // 按逗号拆分,一个逗号为一组坐标
        for (let j = 0; j < _this.xmlArray.length; j++) {
            _this.x1.push(_this.xmlArray[j].split(",").map(Number));
        }

        for (let k = 0; k < _this.x1.length; k++) {
            // if (_this.x1[k].length < 4000) {
            _this.polygonInstances.push(_this.createGeometry(_this.x1[k], isHeight));
            // 转为cartesian3下面的循环再转换弧度供earthSDK的水域使用
            if (isHeight) {
                _this.car3.push(Cesium.Cartesian3.fromDegreesArrayHeights(_this.x1[k]));
            } else {
                _this.car3.push(Cesium.Cartesian3.fromDegreesArray(_this.x1[k]));
            }
            // }
        }
        // 转为Cartographic供earthSDK的水域使用
        for (let m = 0; m < _this.car3.length; m++) {
            let a = [];
            for (let n = 0; n < _this.car3[m].length; n++) {
                let b = Cesium.Cartographic.fromCartesian(_this.car3[m][n]);
                a.push(b.longitude, b.latitude)
            }
            _this.cartoPositions.push(a)
        }
        _this.createWater(classificationType);
    }

    createWater(classificationType) {
        let _this = this;
        _this.createPrimitive(_this.polygonInstances, classificationType);
        // 设置水材质
        let River_Material = new Cesium.Material({
            fabric: {
                type: 'Water',
                uniforms: {
                    normalMap: '../../../../../img/water/water2.jpg',
                    frequency: 80.0, //控制波数的数字
                    animationSpeed: 0.02, //控制水的动画速度的数字
                    amplitude: 2.5, //控制水波幅度的数字
                    specularIntensity: 0.5, //控制镜面反射强度的数字
                    baseWaterColor: new Cesium.Color.fromCssColorString("#0a6bb547"),
                    blendColor: new Cesium.Color.fromCssColorString("#008B45"),
                }
            }
        });

        _this.AllRiver.appearance.material = River_Material;
        _this.scene.primitives.add(_this.AllRiver); //添加到场景
        _this.AllRiverArray.push(_this.AllRiver);
    }

    /**
     * 属性绑定
     */
    bindModel() {
        let _this = this;
        Cesium.knockout.track(_this.viewModel);
        let toolbar = document.getElementById("drawWater"); // 按钮的dom元素
        Cesium.knockout.applyBindings(_this.viewModel, toolbar);
        Cesium.knockout.getObservable(_this.viewModel, 'drawWaterEnabled').subscribe(
            function (newValue) {
                go.bbi.bindImg("水域", "drawWater", newValue) // 切换是否选中图片
                // _this.dataSourcePanel.show = newValue; // 控制面板显示隐藏
                _this.drawWater(newValue);
            }
        );
    }
}