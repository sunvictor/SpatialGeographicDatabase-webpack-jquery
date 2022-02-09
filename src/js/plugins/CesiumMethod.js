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
}

const cm = new CesiumMethod();
export default cm;