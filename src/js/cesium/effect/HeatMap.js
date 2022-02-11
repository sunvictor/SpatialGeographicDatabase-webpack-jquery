import h337 from '../../plugins/heatmap'

export default class HeatMap {
    heatM = null;
    constructor(viewer) {
        let _this = this;
        _this.viewer = viewer;
    }
    getData(len){
        //构建一些随机数据点
        var points = [];
        var max = 0;
        var width = 1000;
        var height = 1000;
        while (len--) {
            var val = Math.floor(Math.random() * 1000);
            max = Math.max(max, val);
            var point = {
                x: Math.floor(Math.random() * width),
                y: Math.floor(Math.random() * height),
                value: val
            };
            points.push(point);
        }
        return {max: max, data: points}
    }
    createRectangle(viewer, coordinate, heatMap){
        var _this = this;
        _this.heatM = viewer.entities.add({
            name: 'Rotating rectangle with rotating texture coordinate',
            show: true,
            rectangle: {
                coordinates: Cesium.Rectangle.fromDegrees(coordinate[0], coordinate[1], coordinate[2], coordinate[3]),
                material: heatMap._renderer.canvas // 核心语句，填充热力图
            }
        });
    }
    createHeatMap(max, data){
        // 创建元素
        var heatDoc = document.createElement("div");
        heatDoc.setAttribute("style", "width:1000px;height:1000px;margin: 0px;display: none;");
        document.body.appendChild(heatDoc);
        // 创建热力图对象
        var heatmap = h337.create({
            container: heatDoc,
            radius: 20,
            maxOpacity: .5,
            minOpacity: 0,
            blur: .75,
            gradient: {
                '0.9':'red',
                '0.8':'orange',
                '0.7':'yellow',
                '0.5':'blue',
                '0.3':'green',
            },
        });
        // 添加数据
        heatmap.setData({
            max: max,
            data: data
        });
        return heatmap;
    }
}