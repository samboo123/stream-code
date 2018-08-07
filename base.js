"use strict";
var $jqgrid = require("./unifiedManagementTabs");
var Handlebars = require("handlebars/runtime");
var baseLayout = require("./baseLayout");
var serverURL = require("./../basic/baseInfo").getServerURL();
var totalCommission = require("./../dataStatistics/totalCommission/totalCommission");
var weldDetail = require("./../dataStatistics/weldDetail/weldDetail");
var windowWidth = $(window).width();
var windowHeight = $(window).height();
exports.windowWidth = windowWidth;
exports.windowHeight = windowHeight;
var $switchBtn = $('#switch-button');

var judgePanelIsExist = function (panelId) {
    var handler = $("#function-tabs");
    //获取所有选项卡面板
    var alltabs = handler.tabs("tabs");
    for(var i = 0;i < alltabs.length;i ++){
        if(panelId ===  alltabs[i][0].id){
            return true;
        }
    }
    return false;
}

/**
 * 注册if_hasPermission hepler,用于handlebars模版中判断是否有权限
 * example: {{#if_hasPermission "project:add"}}
 *          <a href="#">添加项目</a>
 *          {{/if_hasPermission}}
 *          如果没有"project:add"权限，则，<a href="#">添加项目</a>将不会显示在页面中。
 */
Handlebars.registerHelper("if_hasPermission",function(keyword,options){
    if(hasPermission(keyword)) {
        return options.fn(this);
    }
})

/**
 * 判断用户是否有操作权限
 * @param keyword 权限关键字
 * @returns {boolean} 有无操作权限
 */
var hasPermission = function(keyword){
    var isPermitted = false;
    $.ajax({
        url : serverURL+'/pcms/hasPermission',
        type : 'post',
        async : false,
        dataType : 'text',
        data:{
            keyword: keyword
        },
        success:function(data){
            if(data === "true"){
                isPermitted = true;
            }
        }
    });
    return isPermitted;
}
/**
 * 统一注册管理选项卡面板
 */
var registerPanel = function(panelId,content,title,callback){
    var handler = $("#function-tabs");
    handler.tabs({
        onSelect : function (title) {
            baseLayout.addSpecial(title);
        }
    })
    //获取所有选项卡面板
    var alltabs = handler.tabs("tabs");
    var index = null;
    for(var i = 0;i < alltabs.length;i ++){
        if(panelId ===  alltabs[i][0].id){
            index = handler.tabs('getTabIndex',alltabs[i]);
            handler.tabs('close',title);
        }
    }
    //根据用户显示器 分辨率 限制用户打开的选项卡个数
    var maxTablength = parseInt((windowWidth - 190)/140)-1;
    if(maxTablength === alltabs.length){
        handler.tabs('close',0);
    }
    if(index === null){
        handler.tabs('add',{
            id:panelId,
            title:title,
            content:content,
            closable:true,
            narrow:false,
            onBeforeDestroy: function(){
                if(callback !== null){
                    callback();
                }
            }
        })
    }else{
        handler.tabs('add',{
            id:panelId,
            title:title,
            index:index,
            content:content,
            closable:true,
            narrow:false,
            onBeforeDestroy: function(){
                if(callback !== null){
                    callback();
                }
            }
        })
    }
    $(".tabs-inner").click(function(){
        var $html =$(this).text();
        var isSwitch = $switchBtn.is(":checked");
        if($html === "工艺参数"){
            $("#pref_info_jqgrid").trigger("reloadGrid");
            $jqgrid.resizeJqgrid();
        }
        if($html === "焊工管理"){
            $("#welder_management_jqgrid").trigger("reloadGrid");
            $jqgrid.resizeJqgrid();
        }
        if($html === "RT检测结果录入"){
            $("#rtResultList_jqgrid").trigger("reloadGrid");
            $jqgrid.resizeJqgrid();
        }
        if($html === "材料统计"){
            $("#material_count_jqgrid").trigger("reloadGrid");
            $jqgrid.resizeJqgrid();
        }
        setTimeout(function () {
            if($html === "检测总委托"){
                totalCommission.destroyGroupHeader();
                totalCommission.setGroupHeaders();
            }
            if($html === "焊口明细"){
                weldDetail.destroyWDGroupHeadear();
                weldDetail.setWDGroupHeadears();
            }
            if(isSwitch){
                if($html === "用户权限"){
                    $("#userManagementIframe").css({'height':'48%'})
                }
                if($html === "数据字典"){
                    $('#data_dictionary_left_tree_span').height(windowHeight*0.5-135);
                    $('#data_dictionary_right_tree_span').height(windowHeight*0.5-129);
                    $('#scrollbox').height(windowHeight*0.5-176)
                }
                if($html === "过程资料生成"){
                    $("#process_data_jq").setGridHeight(windowHeight*0.5-224);
                    $("#process_data_left_tree_box").height(windowHeight*0.5-186)
                }
                if($html === "委托单"){
                    $('#ndtEntrustOrder').parent().css({'height':'48%','overflow-y':'scroll'});
                }
                if($html === "组批点口"){
                    $('#ndtBatch').parent().css({'height':'48%','overflow-y':'scroll'});
                }
                if($html === "扩探点口"){
                    $("#extension_weld").css("height","98%").parent().css({'height':'48%','overflow-y':'auto'});
                }
            }else{
                if($html === "用户权限"){
                    $("#userManagementIframe").css({'height':'100%'})
                }
                if($html === "数据字典"){
                    $('#data_dictionary_left_tree_span').height(484);
                    $('#data_dictionary_right_tree_span').height(490);
                    $('#scrollbox').height(440)
                }
                if($html === "过程资料生成"){
                    $("#process_data_jq").setGridHeight(windowHeight-250);
                    $("#process_data_left_tree_box").height(windowHeight-212)
                }
                if($html === "委托单"){
                    $('#ndtEntrustOrder').parent().css({'height':'100%','overflow':'hidden'});
                }
                if($html === "组批点口"){
                    $('#ndtBatch').parent().css({'height':'100%','overflow':'hidden'});
                }
                if($html === "扩探点口"){
                    $("#extension_weld").css("height","100%").parent().css({'height': '100%', 'overflow': 'hidden'});
                }
            }
        },30);
    })
    $(".tabs-pill").click(".tabs-title",function () {
        $jqgrid.resizeJqgrid();
        $jqgrid.resizeJqgridTwo();
    })
}

/**
 * 屏幕锁定
 */
var ScreenBlocker = {
    blockAll : function (msg) {
        $("#block_all").show();
        this.showMsg(true, msg);
    },
    showMsg : function (isShow, msg) {
        msg = msg || "数据加载中..";
        var windowWidth = document.documentElement.clientWidth;
        var windowHeight = document.documentElement.clientHeight;
        var height = 30;
        var width = 200;
        var left = (windowWidth - width ) / 2;
        var top = (windowHeight - height) / 2;
        var $blockMsg = $("#block_message");
        $blockMsg.css({"width" : width + "px", "height" : height + "px", "left" : left + "px", "top" : top + "px", "line-height" : height + "px"}).html("<img src='../pcms/images/index/loaders.gif'/>" +msg);
        if (isShow) {
            $blockMsg.show();
        } else {
            $blockMsg.hide();
        }

    },
    unBlock : function () {
        $("#block_top").hide();
        $("#block_left").hide();
        $("#block_all").hide();
        this.showMsg(false);
    }
}

var SubBlocker = {
    blockCss : "load-mode-box",
    block : function (target, info, color) {
        info = info || "请求中..";
        color = color || "white";
        var $this = $(target);
        if (!$this.hasClass(this.blockCss)){
            $this.addClass(this.blockCss);
        }
        $this.html("<img src='../pcms/images/index/loaders.gif'/>"  + info);
        $this.css({"color" : color});
        $this.slideDown();
    },
    unBlock : function (target, delay, info, color, callback) {
        delay = delay || 0;
        info = info || "已完成!";
        color = color || "white";
        var $this = $(target);
        $this.html(info);
        $this.css({"color" : color, "background-image" : "none"});
        setTimeout(function () {
            $this.slideUp();
            if (callback) {
                callback();
            }
        }, delay)
    }
}



var registerPointPickClickClalback = function (callBack) {
    require("./../modelManager/default_interaction").setDefaultInteraction(function(pickNode) {
        if(pickNode === undefined || pickNode === null) {
            return ;
        }
        var items = require("./../modelManager/modelManager.base").getAllParentItems(pickNode.name);
        if (items === null)
            return;
        var pipelineId = null;
        var weldId = null;
        if(items.length > 0){
            for(var i in items){
                if(items[i].categoryName === "管线"){
                    pipelineId = items[i].id;
                }
                if(items[i].categoryName === "焊缝"){
                    weldId = items[i].id;
                }
            }
        }
        var returnArray = [];
        if(pipelineId !== null && weldId !== null){
            if(callBack !== null){
                callBack(pipelineId,weldId);
            }
        }
    });
}

exports.registerPointPickClickClalback = registerPointPickClickClalback;
exports.registerPanel = registerPanel;
exports.hasPermission = hasPermission;
exports.judgePanelIsExist = judgePanelIsExist;
exports.ScreenBlocker = ScreenBlocker;
exports.SubBlocker = SubBlocker;