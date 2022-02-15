export default class KeepView {
    constructor(viewer) {
        this._viewer = viewer;
        /*
        去掉二三维切换动画效果，设置这个参数，二三维切换的时候位置就会保持原来的了,
        原理： cesium底层的代码做了一个判断，如果延时参数大于0，就缩放到全球显示一个切换动画，设成0就没这个动画了
        因为这样可以解决了，所以下面return了
        如果用下面的方法存在2.5D哥伦布视图无效问题
         */
        this._viewer.sceneModePicker.viewModel.duration = 0.0;
        return;

        this._2dPC = {time: Date.parse(new Date())};
        this._3dPC = {time: Date.parse(new Date())};
        this._t = undefined;

        let _nodes = this._viewer.sceneModePicker._wrapper.children;
        let _btn2D, _btn3D;
        if (_nodes[1].attributes["data-bind"].value.indexOf("SCENE2D") > -1) {
            _btn2D = _nodes[1];
            _btn3D = _nodes[2];
        } else {
            _btn2D = _nodes[2];
            _btn3D = _nodes[1];
        }
        (function (obj, btnArr) {
            for (let index = 0; index < btnArr.length; index++) {
                let _btn = btnArr[index];
                _btn.onmouseenter = function () {
                    obj.update();
                };
                _btn.onclick = function () {
                    obj.keep();
                };
            }
        })(this, [_btn2D, _btn3D]);
    }

    update() {
        let _pc = this._viewer.camera.positionCartographic.clone();
        let _curSceneMode = this._viewer.scene.mode;
        if (_curSceneMode == Cesium.SceneMode.SCENE2D) {
            this._2dPC = {
                pc: _pc,
                time: Date.parse(new Date())
            }
        } else if (_curSceneMode == Cesium.SceneMode.SCENE3D) {
            this._3dPC = {
                pc: _pc,
                time: Date.parse(new Date())
            }


        }
    }

    keep() {
        let _correctPC = this._3dPC;
        let _waitMode = undefined;
        if (this._2dPC.time > this._3dPC.time) {
            _waitMode = Cesium.SceneMode.SCENE3D;
            _correctPC = this._2dPC.pc;
            this._3dPC = this._2dPC;
        } else if (this._2dPC.time < this._3dPC.time) {
            _waitMode = Cesium.SceneMode.SCENE2D;
            _correctPC = this._3dPC.pc;
            this._2dPC = this._3dPC;
        } else {
            return;
        }
        this._waitMode = _waitMode;
        (function (obj, correctPC) {
            if (obj._t != undefined) clearInterval(obj._t)
            obj._t = setInterval(function () {
                if (_waitMode === obj._viewer.scene.mode) {
                    var c3 = new Cesium.Cartesian3.fromRadians(correctPC.longitude, correctPC.latitude, correctPC.height);
                    obj._viewer.camera.setView({destination: c3});
                    clearInterval(obj._t);
                }
            }, 100);
        })(this, _correctPC);
    }
}