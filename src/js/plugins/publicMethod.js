/**
 * 公共函数
 */
const publicMethod = function () {

}
/**
 * 将json格式的参数遍历放入obj对象中
 * @param {object} obj json对象
 * @param {object} options json格式的参数
 */
publicMethod.prototype.setOptions = function (obj, options) {
    for (const key in options) {
        if (Object.hasOwnProperty.call(options, key)) {
            const element = options[key];
            obj[key] = element;
        }
    }
}

/**
 * 字典比对
 * @param {string} type 类型
 * @param {object} dict 字典对象
 * @returns 字典的中与type对应key的值
 */
publicMethod.prototype.comparDict = function (type, dict) {
    for (const key in dict) {
        if (Object.hasOwnProperty.call(dict, key)) {
            const element = dict[key];
            if (type == key) {
                return element;
            }
        }
    }
}

/**
 * 比较两个对象是否相同
 */
publicMethod.prototype.compareObj = function(obj, newObj) {
    let flag = true;
    if (Object.keys(obj).length != Object.keys(newObj).length) {
        return false;
    }
    for (let key in obj) {
        if (Array.isArray(obj[key])) {
            flag = compareArr(obj[key], newObj[key])
            if (!flag) {
                break;
            }
        } else if (obj[key] instanceof Object) {
            flag = compareObj(obj[key], newObj[key]);
            if (!flag) {
                break;
            }
        } else if (obj[key] != newObj[key]) {
            flag = false;
            break;
        }
    }
    return flag
}
const pm = new publicMethod();
export default pm