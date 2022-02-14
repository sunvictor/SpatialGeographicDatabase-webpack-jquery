import $ from "jquery";

export default class gykjAlert {
    options = null;
    viewModel = {};

    constructor(options) {
        let _this = this;
        _this.options = options;
        _this.initAlert(options);
    }

    initAlert(options) {
        let _this = this;
        let alert = $("<div class='gykj_alert'></div>");
        $(alert).css({
            "background-color": "rgba(57, 57, 57)",
            "position": "absolute",
            "z-index": 1000,
            "display": "none",
            "top": 0,
            "background": "rgba(71,71,71,.8)",
            "border": "2px solid hsla(0,0%,54%,.8)",
            "border-radius": "3px",
            "padding": "10px",
            "border-top": "none",
            "border-top-left-radius": 0,
            "border-top-right-radius": 0,
            "overflow": "auto"
        })
        $(alert).append(options.content)
        $(".B").append(alert)
        _this.setPosition(options.btn, alert)
        return this
    }

    setPosition(btn, alert) {
        console.log(btn)
        btn.off('click').on('click', function (e) {
            let x = e.pageX || (e.clientX + scrollX);
            alert.css('display') === "none" ? alert.show() : alert.hide();
            alert.css({
                left: x - 60 + "px",
            })
        })
        $(document.querySelector(".A")).off('click').on('click', function (e) {
            let status = $(e.target).closest('.al_arrow').length; //在元素内点击返回1，不在返回0
            if (!status) {
                $('.gykj_alert').hide()
            }
        })
    }
}