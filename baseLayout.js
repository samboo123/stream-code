"use strict";
var $jqgrid = require("./unifiedManagementTabs");
var scene3d = require("./../modelManager/scene3d");
var base = require("./../modelManager/modelManager.base");
require("malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css");
require("jquery-mousewheel/jquery.mousewheel");
require("malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min");
var weldSet = require("../basicFunction/weldSet/weldSet");
var weldSetControl=require("../basicFunction/weldSetControl/weldSetControl");
var $scene3D = $('#scene3D'),
    $switchBtn = $('#switch-button'),
    windowHeight = $(window).height();
$(function(){
    $("#inner-container").mCustomScrollbar({
        scrollbarPosition: "outside",
        mouseWheelPixels:300
    });
    var isUnfold=false;
   /* $("#toolBox").menubutton({
          menu : "#toolSubBox",
          plain:true
      });
      $("#toolSubItem").click(function () {
          if($("#toolStrip").css("display")==="block"){
              $("#toolStrip").hide();
              $("#toolStripSec").show();
          }else{
              $("#toolStrip").show();
              $("#toolStripSec").hide();
          }
      });*/
    $("#toolBox").click(function () {
        if($("#toolStrip").css("display")==="block"){
            $("#toolBox").attr("title","工具箱");
            $("#toolStrip").hide();
            $("#toolStripSec").show();
            weldSet.switchWeldSetAnd4D(true);
        }else{
            $("#toolBox").attr("title","预制设计");
            $("#toolStrip").show();
            $("#toolStripSec").hide();
            weldSet.switchWeldSetAnd4D(false);
            weldSetControl.executeSwitchWeldSetFunction();
        }
        /*if(!isUnfold){
            $("#toolStrip").animate({"left":0,"width":0},150,function () {
                isUnfold=true;
            })
        }else{
            $("#toolStrip").animate({"left":50,"width":238},150,function () {
                isUnfold=false;
            })
        }*/
    });
    /**
     * 三维交互统一管理
     */
    $switchBtn.click(function(){
        var isSwitch = $switchBtn.is(":checked");
        var handler = $("#function-tabs");
        //获取所有选项卡面板
        var alltabs = handler.tabs("tabs");
        var title = $('.tabs-selected .tabs-title').text();
        if(title === "工艺参数"){
            $("#pref_info_jqgrid").trigger("reloadGrid");
        }
        if(title === "焊工管理"){
            $("#welder_management_jqgrid").trigger("reloadGrid");
        }
        if(title === "RT检测结果录入"){
            $("#rtResultList_jqgrid").trigger("reloadGrid");
        }
        if(title === "材料统计"){
            $("#material_count_jqgrid").trigger("reloadGrid");
        }
        if(isSwitch){
            /**
             * @comment_s: 一开始选中√切换半屏显示滚动条
             */
            $(this).css({"-webkit-appearance":"checkbox"});
            if(title === "用户权限"){
                $("#userManagementIframe").css({'height':'48%'})
            }
            if(title === "数据字典"){
                $('#data_dictionary_left_tree_span').height(windowHeight*0.5-135);
                $('#data_dictionary_right_tree_span').height(windowHeight*0.5-129);
                $('#scrollbox').height(windowHeight*0.5-176)
            }
            if(title === "过程资料生成"){
                $("#process_data_jq").setGridHeight(windowHeight*0.5-224);
                $("#process_data_left_tree_box").height(windowHeight*0.5-186)
            }
            if(title === "委托单"){
                $('#ndtEntrustOrder').parent().css({'height':'48%','overflow-y':'scroll'});
            }
            if(title === "组批点口"){
                $('#ndtBatch').parent().css({'height':'48%','overflow-y':'scroll'});
            }
            if(title === "扩探点口"){
                $("#extension_weld").css("height","98%").parent().css({'height':'48%','overflow-y':'auto'});
            }
            //初始化三维场景
            var selectedItem = base.getSelectedItem();
            var option = {
                item : selectedItem,
                callback : function() {
                    scene3d.setUserDefaultView();
                }
            };
            scene3d.multiDeviceModel(option);
            $("#modelTools").show();
            $("#overview_progress_control").hide();
            $("#dasky_container").hide();
            if(alltabs.length > 0){
                $scene3D.css('height','50%');
            }else{
                $scene3D.css('height','100%');
                if($(".selectMenu").text()==="4D模型概览"){
                    $("#modelTools").hide();
                    $("#overview_progress_control").show();
                    $("#dasky_container").show();
                }
            }
        }else{
            $(this).css({"-webkit-appearance":"none"});
            if(title === "用户权限"){
                $("#userManagementIframe").css({'height':'100%'})
            }
            if(title === "数据字典"){
                $('#data_dictionary_left_tree_span').height(484);
                $('#data_dictionary_right_tree_span').height(490);
                $('#scrollbox').height(440)
            }
            if(title === "过程资料生成"){
                $("#process_data_jq").setGridHeight(windowHeight-250);
                $("#process_data_left_tree_box").height(windowHeight-212)
            }
            if(title === "委托单"){
                $('#ndtEntrustOrder').parent().css({'height':'100%','overflow':'hidden'});
            }
            if(title === "组批点口"){
                $('#ndtBatch').parent().css({'height':'100%','overflow':'hidden'});
            }
            if(title === "扩探点口"){
                $("#extension_weld").css("height","100%").parent().css({'height':'100%','overflow':'hidden'});
            }

            if(document.getElementById("center_dialog-custom_tree_panel") !== null){
                $("#center_dialog-custom_tree_panel").window("close");
            }
            scene3d.close();
            $scene3D.hide();
            $("#modelTools").hide();
            $("#overview_progress_control").hide();
            $("#dasky_container").hide();
            if($(".selectMenu").text()==="4D模型概览"){
                addSpecial(title);
            }
        }
        $jqgrid.resizeJqgrid();
        $jqgrid.resizeJqgridTwo();
    });
    /*admin切换*/
    $(".top-admin").click(function(){
        $("#admin-menu").toggle();
        $(this).toggleClass("addbgcolor");
        if($(this).hasClass("addbgcolor") && $(this).next().hasClass("addbgcolor")){
            $(this).next().trigger("click");
        }
    });
    $(".top-project-tree-icon").click(function(){
        $("#project-tree").toggle();
    });
    $(window).resize(function () {
        setTimeout(function () {
            $jqgrid.resizeJqgrid();
            $jqgrid.resizeJqgridTwo();
        },200);
    });
    $("#function-tabs,#function_menu_shrink_id").click(function () {
        if($("#top-layout")[0].getElementsByClassName("addbgcolor")!==null){
            $(".addbgcolor").trigger("click")
        }
    });
    /**
     * 打开第一个选项卡之前（看是否开启三维视图 如果已经开启 得把高度设置成50%）
     */
    $('.easyui-tabs').tabs({
        onAdd: function(title){
            var isSwitch = $switchBtn.is(":checked");
            var handler = $("#function-tabs");
            //获取所有选项卡面板
            var alltabs = handler.tabs("tabs");
            $("#overview_progress_control").hide();
            $("#dasky_container").hide();
            setTimeout(function () {
                if (isSwitch) {
                    $("#modelTools").show();
                    $scene3D.css('height','50%');
                    if (alltabs.length === 1) {
                        $scene3D.css('height', '50%');
                    }
                    $(this).css({"-webkit-appearance": "checkbox"});
                    if (title === "用户权限") {
                        $("#userManagementIframe").css({'height':'48%'})
                    }
                    if (title === "委托单") {
                        $('#ndtEntrustOrder').parent().css({'height':'48%','overflow-y': 'scroll'});
                    }
                    if (title === "组批点口") {
                        $('#ndtBatch').parent().css({'height': '48%','overflow-y':'scroll'});
                    }
                    if(title === "扩探点口"){
                        $("#extension_weld").css("height","98%").parent().css({'height':'48%','overflow-y':'auto'});
                    }
                    return true;
                } else {
                    $("#modelTools").hide();
                    $scene3D.css('height','100%');
                    $(this).css({"-webkit-appearance": "none"});
                    if (title === "用户权限") {
                        $("#userManagementIframe").css({'height':'100%'})
                    }
                    if (title === "委托单") {
                        $('#ndtEntrustOrder').parent().css({'height': '100%', 'overflow': 'hidden'});
                    }
                    if (title === "组批点口") {
                        $('#ndtBatch').parent().css({'height': '100%', 'overflow': 'hidden'});
                    }
                    if(title === "扩探点口"){
                        $("#extension_weld").css("height","100%").parent().css({'height': '100%', 'overflow': 'hidden'});
                    }
                    return true;
                }
            },30);
        },
        onBeforeClose : function (title) {
            judgeIsRestoreView();
        },
        onContextMenu:function(e,title,index) {
                //在每个菜单选项中添加title值
                var $divMenu = $("#tab_rightmenu div[id]");
                $divMenu.each(function() {
                    $(this).attr("id", index);
                });

                //显示menu菜单
                $('#tab_rightmenu').menu('show', {
                    left: e.pageX,
                    top: e.pageY
                });
                e.preventDefault();
            }
        });
        //实例化menu点击触发事件
        $('#tab_rightmenu').menu({
            "onClick":function(item) {
                closeTab(Number(item.id),item.text);
            }
        });
        initBuildProject();
        firstList();
        menuSelected();
        startList();
});

//关闭
function closeTab(selectedIndex, text) {
    var handler = $("#function-tabs");
    var alltabs = handler.tabs("tabs");

    if(text === '关闭全部标签') {
        for(var i = alltabs.length - 1; i >= 0; i--) {
            var indexone = handler.tabs('getTabIndex',alltabs[i]);
            handler.tabs("close", indexone);
        }
    }
    if(text === '关闭其他标签') {
        for(var a = alltabs.length - 1; a >= 0; a--) {
            var indextwo = handler.tabs('getTabIndex',alltabs[a]);
            if(selectedIndex !== indextwo) {
                handler.tabs("close", indextwo);
            }
        }
    }
    if(text === '关闭右侧标签') {
        for(var b = alltabs.length - 1; b >= 0; b--) {
            var indexthree = handler.tabs('getTabIndex',alltabs[b]);
            if(selectedIndex !== indexthree) {
                handler.tabs("close", indexthree);
            } else {
                break;
            }
        }
    }
    if(text === '关闭左侧标签') {
        for(var j = alltabs.length - 1; j >= 0; j--) {
            var indexs = handler.tabs('getTabIndex',alltabs[j]);
            if(selectedIndex > indexs) {
                handler.tabs("close", indexs);
            }
        }
    }
}

/**
 * 初始化项目下拉框
 */
var initBuildProject = function () {
    base.loadProjectTree();
};

/*一级菜单切换效果*/
var firstList = function(){
    var navRoot = $("#function_menu_shrink_id ");
    for(var a = 0;a < navRoot.length;a ++){
        var allli =  $(navRoot[a]).find(".panel-header");
        for(var i = 0;i < allli.length;i ++){
            var node = allli[i];
            node.onmouseover = function(){
                this.className = this.className.trim();
                if(this.className !=="panel-header accordion-header accordion-header-selected")
                    this.className+=" current";
            };
            node.onmouseout = function(){
                this.className = this.className.replace("current","");
            }
        }
    }
};

/*二级菜单选中*/
var menuSelected=function(){
    var $menus = $(".function-menu li");
    $menus.each(function(index){
        $(this).click(function(){
            $menus.removeClass("selectMenu");
            $menus.eq(index).addClass("selectMenu");
        })
    })
};

/**
 * 功能菜单鼠标切换效果
 */
var startList = function(){
    var navRoot = $(".function-menu");
    for(var a = 0;a < navRoot.length;a ++){
        var allli =  $(navRoot[a]).find("li");
        for(var i = 0;i < allli.length;i ++){
            var node = allli[i];
            node.onmouseover = function(){
                if(this.className!==" selectMenu")
                    this.className+="current";
            };
            node.onmouseout = function(){
                this.className = this.className.replace("current","");
            }
        }
    }
};

/**
 * 最后一个选项卡关闭之前（看是否开启三维视图 如果已经开启 得把高度还原成100%）
 */
var judgeIsRestoreView = function () {
    var handler = $("#function-tabs");
    var isSwitch = $switchBtn.is(":checked");
    //获取所有选项卡面板
    var alltabs = handler.tabs("tabs");
    /*最后一个选项卡关闭，图标恢复初始色*/
    if(alltabs.length === 1){
        setTimeout(function () {
            $(".function-menu li").removeClass("selectMenu");
        },200)
    }
    if(isSwitch){
        if(alltabs.length === 1){
            $scene3D.css('height','100%');
        }else{
            $scene3D.css('height','50%');
        }
        setTimeout(function () {
            $jqgrid.resizeJqgrid();
            $jqgrid.resizeJqgridTwo();
        },200);
        return true;
    }else{
        setTimeout(function () {
            $jqgrid.resizeJqgrid();
            $jqgrid.resizeJqgridTwo();
        },200);
        return true;
    }
};
var addSpecial = function (title) {
    var $menus = $(".function-menu li");
    $menus.each(function(indexs){
        if(title === $(this).children().text()){
            $menus.removeClass("selectMenu");
            $menus.eq(indexs).addClass("selectMenu");
            $menus.parent().parent().parent().css("display","none");
            $(this).parent().parent().parent().css("display","block");
            $menus.parent().parent().parent().prev().removeClass("accordion-header-selected");
            $(this).parent().parent().parent().prev().addClass("accordion-header-selected");
        }
    });
};

exports.addSpecial = addSpecial;

