import * as turf from '@turf/turf'

class CesiumMethod {

    /**
     * 笛卡尔转经纬度
     * @param {Cartesian3} cartesian
     * @return {Array<Number>}
     */
    cartesianToCoordinate(cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        let lon = Cesium.Math.toDegrees(cartographic.longitude)
        let lat = Cesium.Math.toDegrees(cartographic.latitude)
        return [lon, lat]
    }

    /**
     *
     * @param {Array<Cartesian3>} cartesians
     * @return {Array<Array>}
     */
    cartesiansToCoordinates(cartesians) {
        let coordinates = [];
        for (let i = 0, len = cartesians.length; i < len; i++) {
            coordinates.push(this.cartesianToCoordinate(cartesians[i]))
        }
        return coordinates;
    }

    /**
     * 根据笛卡尔解析绝对中心坐标点
     * @param {Array<Cartesian3>} cartesians
     * @return {Feature<Point, Properties>}
     */
    calcAbsoluteCenterByCartesians(cartesians) {
        let turfPoints = [];
        for (let i = 0, len = cartesians.length; i < len; i++) {
            turfPoints.push(turf.point(this.cartesianToCoordinate(cartesians[i])))
        }
        let center = turf.center(turf.featureCollection(turfPoints));
        return center;
    }

    /**
     * 根据笛卡尔解析绝对中心坐标点
     * @param {Array<Cartesian3>} cartesians
     * @return {{coord: Position, cart: Cartesian3}}
     */
    countPolygonCenter(cartesians) {
        let tempPos = [];
        for (let i = 0, len = cartesians.length; i < len; i++) {
            tempPos.push(turf.point(this.cartesianToCoordinate(cartesians[i])))
        }
        let center = turf.center(turf.featureCollection(tempPos));
        let coord = center.geometry.coordinates;
        let cartesian = Cesium.Cartesian3.fromDegrees(coord[0], coord[1]);
        return {
            coord: coord,
            cart: cartesian,
        }
    }

    /**
     * 计算多边形面积
     * @param {Array<Array>} coords 一个包含经纬度坐标的二维数组
     * @return {number}
     */
    calcPolygonArea(coords) {
        let polygon = turf.polygon([coords]);
        let area = turf.area(polygon);
        return area;
    }

    getTerrainHeight(positions, callback) {
        let terrain = viewer.scene.terrainProvider;
        let promise = Cesium.sampleTerrainMostDetailed(terrain, positions);
        // if (terrainType == "old") {
        //     promise = Cesium.sampleTerrain(terrain, 17, positions);
        // }
        Cesium.when(promise, function (updatedPositions) {
            callback(updatedPositions);
        }).otherwise(function (error) {
            console.log(error);
        });
    }
}

const cm = new CesiumMethod();
export default cm;