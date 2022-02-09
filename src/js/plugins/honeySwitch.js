export const honeySwitch = {};
honeySwitch.themeColor = "rgb(100, 189, 99)";
honeySwitch.init = function (ele) {
    var s = "<span class='slider'></span>";
    if (!ele){
        ele = $("[class^=switch]")
    }
    ele.append(s);
    ele.click(function() {
    // $(document).on('click', '[class^=switch]', function () {
    // $("[class^=switch]").off('click').on('click', function () {
        if ($(this).hasClass("switch-disabled")) {
            return;
        }
        if ($(this).hasClass("switch-on")) {
            $(this).removeClass("switch-on").addClass("switch-off");
            $(this).val(false)
            $(".switch-off").css({
                'border-color': '#dfdfdf',
                'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
                'background-color': 'rgb(255, 255, 255)'
            });
        } else {
            $(this).removeClass("switch-off").addClass("switch-on");
            $(this).val(true)
            if (honeySwitch.themeColor) {
                var c = honeySwitch.themeColor;
                $(this).css({
                    'border-color': c,
                    'box-shadow': c + ' 0px 0px 0px 16px inset',
                    'background-color': c
                });
            }
            if ($(this).attr('themeColor')) {
                var c2 = $(this).attr('themeColor');
                $(this).css({
                    'border-color': c2,
                    'box-shadow': c2 + ' 0px 0px 0px 16px inset',
                    'background-color': c2
                });
            }
        }
    });

    if (this.themeColor) {
        var c = this.themeColor;
        $(".switch-on").css({
            'border-color': c,
            'box-shadow': c + ' 0px 0px 0px 16px inset',
            'background-color': c
        });
        $(".switch-off").css({
            'border-color': '#dfdfdf',
            'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
            'background-color': 'rgb(255, 255, 255)'
        });
    }
    if ($('[themeColor]').length > 0) {
        $('[themeColor]').each(function () {
            var c = $(this).attr('themeColor') || honeySwitch.themeColor;
            if ($(this).hasClass("switch-on")) {
                $(this).css({
                    'border-color': c,
                    'box-shadow': c + ' 0px 0px 0px 16px inset',
                    'background-color': c
                });
            } else {
                $(".switch-off").css({
                    'border-color': '#dfdfdf',
                    'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
                    'background-color': 'rgb(255, 255, 255)'
                });
            }
        });
    }
};

window.switchEvent = function (ele, on, off) {
    $(ele).on('click', function () {
        if ($(this).hasClass("switch-disabled")) {
            return;
        }
        if ($(this).hasClass('switch-on')) {
            if (typeof on == 'function') {
                on();
            }
        } else {
            if (typeof off == 'function') {
                off();
            }
        }
    });
}

honeySwitch.showOn = function (ele) {
    $(ele).val(true)
    $(ele).removeClass("switch-off").addClass("switch-on");
    if (honeySwitch.themeColor) {
        var c = honeySwitch.themeColor;
        $(ele).css({
            'border-color': c,
            'box-shadow': c + ' 0px 0px 0px 16px inset',
            'background-color': c
        });
    }
    if ($(ele).attr('themeColor')) {
        var c2 = $(ele).attr('themeColor');
        $(ele).css({
            'border-color': c2,
            'box-shadow': c2 + ' 0px 0px 0px 16px inset',
            'background-color': c2
        });
    }
}
honeySwitch.showOff = function (ele) {
    $(ele).val(false)
    $(ele).removeClass("switch-on").addClass("switch-off");
    $(".switch-off").css({
        'border-color': '#dfdfdf',
        'box-shadow': 'rgb(223, 223, 223) 0px 0px 0px 0px inset',
        'background-color': 'rgb(255, 255, 255)'
    });
}
$(function () {
    honeySwitch.init();
});