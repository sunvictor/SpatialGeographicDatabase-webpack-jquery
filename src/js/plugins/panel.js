const $  = require("jQuery")
const gykjPanel = (function () {
    let zIndex = 1;
    let top = 15;
    let left = 30;
    let width = 200;
    let height = 300;
    let currentRotate = 0;
    let unShow = "none";
    class gykjPanel {
        constructor(options) {
            this.panelDom = this.initPanel(options);
        }
        /**
         *
         * @param {*} options zIndex,top,left,width,title,content
         * @returns
         */
        initPanel(options) {
            let _this = this;
            const panelDiv = document.createElement('div');
            const mapDiv = document.querySelector('.B');
            mapDiv.appendChild(panelDiv);
            if (options == null) {
                options = {};
            }
            panelDiv.classList.add('panelDiv');
            panelDiv.style.zIndex = options.zIndex ? options.zIndex : zIndex;
            // panelDiv.style.position = 'absolute';
            panelDiv.style.top = (options.top ? options.top : top) + 'px';
            panelDiv.style.left = (options.left ? options.left : left) + 'px';
            panelDiv.style.width = (options.width ? options.width : width) + 'px';
            panelDiv.style.height = (options.height ? options.height : height) + 'px';
            panelDiv.style.display = options.show? "block": unShow;
            // panelDiv.style.backgroundColor = "rgba(57, 57, 57, 0.8)";
            const title = document.createElement('div');
            panelDiv.appendChild(title);
            title.classList.add('panel-title');
            const titleH3 = document.createElement('h3');
            titleH3.classList.add('panel-title-h3');
            titleH3.innerText = options.title ? options.title : "";
            title.appendChild(titleH3);
            const titleDiv2 = document.createElement('div');
            title.appendChild(titleDiv2);
            const titleImgA = document.createElement('a');
            titleDiv2.appendChild(titleImgA);
            titleImgA.classList.add('panel-title-img-a');
            titleImgA.onclick = _this.togglePanel;
            const arrow = document.createElement('img');
            arrow.classList.add('panel-arrow')
            arrow.src = "./img/navImg/jianjian.png";
            titleImgA.appendChild(arrow);
            const content = document.createElement('div');
            content.style.height = (options.height ? options.height - 50 : height - 50) + 'px';
            content.classList.add('panel-content');
            content.innerHTML = options.content ? options.content : "";
            panelDiv.appendChild(content);

            _this.move(title);
            // _this.resize(document.querySelector('.panel-div-map i.bar'));
            return panelDiv;
        }

        closePanel(domPanel) {
            let _this = this;
            this.panelDom.remove();
        }
        resize(obj) {
            let _this = this;
            // 是否开启尺寸修改
            let resizeable = false;
            // 鼠标按下时的坐标，并在修改尺寸时保存上一个鼠标的位置
            let clientX, clientY;
            // div可修改的最小宽高
            let minW = 130,
                minH = 100;
            let offleft,
                offtop;
            let windowHeight, windowWidth;
            let navHeight = document.querySelector('.A').offsetHeight;
            // 鼠标按下时的位置，使用n、s、w、e表示
            let direc = '';
            let isMoving = false;
            // 鼠标松开时结束尺寸修改
            function up() {
                resizeable = false
            }
            // 鼠标松开事件
            document.body.addEventListener('mouseup', up)
            document.body.addEventListener('mouseleave', function(){
                isMoving = false;
                // 预防短暂的移出页面导致事件终止
                setTimeout(function(){
                    if (isMoving) {
                        return;
                    }
                    resizeable = false;
                },1200)
            })
            // 鼠标按下事件
            obj.addEventListener('mousedown', function (e) {
                resizeable = true;
                clientX = e.clientX
                clientY = e.clientY
                offleft = parseInt(_this.panelDom.offsetLeft);
                offtop = parseInt(_this.panelDom.offsetTop);
                windowHeight = window.innerHeight;
                windowWidth = window.innerWidth;
                // let direction = getDirection(e)
                // // 当位置为四个边和四个角时才开启尺寸修改
                // if (direction !== '') {
                //     resizeable = true
                //     direc = direction
                //     clientX = e.clientX
                //     clientY = e.clientY
                // }
            })
            // // 获取鼠标所在div的位置
            // function getDirection(ev) {
            //     let xP, yP, offset, dir;
            //     dir = '';

            //     xP = ev.offsetX;
            //     yP = ev.offsetY;
            //     offset = 10;

            //     if (yP < offset) dir += 'n';
            //     else if (yP > c.offsetHeight - offset) dir += 's';
            //     if (xP < offset) dir += 'w';
            //     else if (xP > c.offsetWidth - offset) dir += 'e';

            //     return dir;
            // }
            // body监听移动事件 // 鼠标移动事件
            document.body.addEventListener('mousemove', function (e) {
                isMoving = true;
                // 当开启尺寸修改时，鼠标移动会修改div尺寸
                if (resizeable) {
                    // 鼠标按下的位置在右边， 修改宽度
                    // if (direc.indexOf('e') !== -1) {
                    let width = Math.max(minW, _this.panelDom.offsetWidth + (e.clientX - clientX));
                    if (windowWidth - offleft < width) {
                        _this.panelDom.style.width = windowWidth - offleft  + 'px';
                    } else {
                        _this.panelDom.style.width = width  + 'px';
                    }
                    clientX = e.clientX
                    // }
                    // // 鼠标按下的位置在底部，修改高度
                    // if (direc.indexOf('s') !== -1) {
                    let height = Math.max(minH, _this.panelDom.offsetHeight + (e.clientY - clientY));
                    if (windowHeight - offtop - navHeight < height) {
                        _this.panelDom.style.height = windowHeight - offtop - navHeight  + 'px';
                        _this.panelDom.querySelector('.panel-content').style.height = windowHeight - offtop - navHeight - 50  + 'px'; // 50是标题栏的高度
                    } else {
                        _this.panelDom.style.height = height  + 'px';
                        _this.panelDom.querySelector('.panel-content').style.height = height - 50  + 'px'; // 50是标题栏的高度
                    }
                    clientY = e.clientY
                }

                // }
            })
        }
        /*封装移动函数*/
        move(obj) {
            let _this = this;
            var onOff = false;
            var l = 0,
                t = 0,
                x = 0,
                y = 0;
            var parent = obj.parentNode;

            obj.onmousedown = function (event) {
                var e = event || window.event;
                x = e.clientX;
                y = e.clientY;
                l = parseInt(parent.offsetLeft);
                t = parseInt(parent.offsetTop);
                onOff = true;
                obj.style.cursor = "move"; //此时鼠标形状为可移动手势
                $("body").attr("onselectstart", "return false") // 拖动弹出框时禁止全选操作
                let panelHeight = parent.offsetHeight;
                let panelWidth = parent.offsetWidth;
                let navHeight = document.querySelector('.A').offsetHeight;
                document.onmousemove = function (event) {
                    if (onOff) {
                        var e = event || window.event;
                        let windowHeight = window.innerHeight;
                        let windowWidth = window.innerWidth;
                        let left = l + e.clientX - x;
                        let top = t + e.clientY - y;
                        if (top < 0) {
                            top = 0;
                        }
                        if (left < 0) {
                            left = 0;
                        }
                        if (top > windowHeight - panelHeight - navHeight) {
                            top = windowHeight - panelHeight - navHeight;
                        }
                        if (left > windowWidth - panelWidth) {
                            left = windowWidth - panelWidth;
                        }
                        parent.style.left = left + 'px';
                        parent.style.top = top + 'px';

                    }

                }
                document.onmouseup = function () {
                    if (onOff) {
                        onOff = false;
                    }
                    $("body").attr("onselectstart", "return true")
                };

            };
        };
        togglePanel() {
            currentRotate = (currentRotate + 180) % 360;
            $(this).parent().parent().next().toggle();
            $(this).children('.panel-arrow').css({
                "transform": "rotate(" + currentRotate + "deg)",
                "-ms-transform": "rotate(" + currentRotate + "deg)",
                /* IE 9 */
                "-moz-transform": "rotate(" + currentRotate + "deg)",
                /* Firefox */
                "-webkit-transform": "rotate(" + currentRotate + "deg)",
                /* Safari 和 Chrome */
                "-o-transform": "rotate(" + currentRotate + "deg)",
                /* Opera */
            })
            if (currentRotate == 180) {
                $(this).parent().parent().parent().addClass('panelDiv-close');
            }else{
                $(this).parent().parent().parent().removeClass('panelDiv-close');
            }
        }
    }
    return gykjPanel

    // return {
    //     open: initPanel,
    //     close: closePanel
    // }

})()

export default gykjPanel