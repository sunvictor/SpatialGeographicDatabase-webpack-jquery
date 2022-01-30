require("./clickEvents")
// const $ = require("jQuery");
import $ from "jquery";
export function initMainHtml() {
    $(".nav li").data("checked", "0"); //0代表所有得标签
    $(".nav li:eq(0)").data("checked", "1"); //1代表当前选中标签
    var isShow = true; //默认是显示状态
    //获取点击事件的对象
    $(".nav li").click(function () {
        var ck = $(this).data("checked"); //获取当前点击元素
        if (ck == "0" && !isShow) { //0代表没有选中得其他标签
            //获取要显示或隐藏的对象
            shownav();
            isShow = !isShow; //因为调用了隐藏函数 ，  所以这里取反
        }
        if (ck == "0") { //当  当前元素为没选中时
            $(".nav li").data("checked", "0");
            $(this).data("checked", "1"); //让当前变为选中
        }
        if (ck == "1") {
            //获取要显示或隐藏的对象
            shownav();
            isShow = !isShow;
        }
        var divShow = $(".content").children('.list');
        //判断当前对象是否被选中，如果没选中的话进入if循环
        if (!$(this).hasClass('selected')) {
            //获取当前对象的索引
            var index = $(this).index();
            //当前对象添加选中样式并且其同胞移除选中样式；
            $(this).addClass('selected').siblings('li').removeClass('selected');
            //索引对应的div块显示
            $(divShow[index]).show();
            //索引对应的div块的同胞隐藏
            $(divShow[index]).siblings('.list').hide();
        }
    });

    // 导航栏得显示隐藏函数
    function shownav() {
        var cesiumTop = document.getElementById('cesiumTop');
        var content = document.getElementById('content');
        var cesiumBotoum = document.getElementById('cesiumBotoum');
        if (content.style.display != 'none') {
            content.style.display = 'none';
            cesiumTop.style.height = 'null';
            $('#title').height(37);
            $("#title span").height(37);
            $('#title').css("line-height", "37px");
            $(".outer").css('padding-top', '37px');
        } else {
            content.style.display = "block";
            var height = $("#cesiumTop").height();
            $('#title').height(height);
            $('#title').css("line-height", height + 'px');
            $(".outer").css('padding-top', height + 'px');
        }
        ;
        var compasstop = $("#cesiumTop").height();
    }
}