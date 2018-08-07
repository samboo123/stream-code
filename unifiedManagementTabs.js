/**
 * Created by shenxian on 2017/8/21.
 */
"use strict";
var totalCommission = require("./../dataStatistics/totalCommission/totalCommission");
var weldDetail = require("./../dataStatistics/weldDetail/weldDetail");
var flag = true;

var resizeJqgridSum = function ($jqgrid,numH,$datagrid) {
    var modelLayout = $("#modelManagerLayout"),
        modelGrid = $('#modelManagerGrid'),
        projectLayout = $("#projectManagerLayout"),
        projectGrid = $('#projectManagerGrid');
    setTimeout(function () {
        var $menu = $("#function_menu_shrink_id").parent(),
            $centerData = $("#center_data"),
            isSwitch = $("#switch-button").is(":checked"),
            dataCenterWidth = $(window).width(),
            dataCenterHeight = $(window).height();
        if($menu.css("display") === "none" && $jqgrid.length === 0){
            $centerData.parent().css({"width":dataCenterWidth+"px","left":"0"});
            $(".tabs-wrap").width(dataCenterWidth).parentsUntil().width(dataCenterWidth);
            $(".tabs-panels").width(dataCenterWidth);
        }
        if($menu.css("display") === "none" && ($jqgrid.length > 0 || $datagrid.length > 0 )){
            $jqgrid.each(function () {
                var thName = $(this).attr("id");
                $(this).parentsUntil("body").width(dataCenterWidth);
                $(this).parent().parent().parent().parent().parent().width(dataCenterWidth-52);
                $(this).parent().parent().parent().parent().parent().parent().width(dataCenterWidth-52);
                if(isSwitch){//三维视图已经打开
                    $(this).setGridWidth(dataCenterWidth-54);//54
                    $(this).setGridHeight(dataCenterHeight*0.5-174);//180
                    $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-118);//124

                }else{
                    $(this).setGridWidth(dataCenterWidth-54);
                    $(this).setGridHeight(dataCenterHeight*numH[0]-numH[1]);
                    $(this).parent().parent().parent().parent().parent().height(dataCenterHeight-numH[2]);//new
                }
                $(this).parent().width(dataCenterWidth-54);
                $(this).closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden"});
                if(thName === "totalCommission_jqgrid"){
                    if(isSwitch){
                        $(this).setGridHeight(dataCenterHeight*0.5-196);
                        $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-118);
                        $("#totalCommission_jqgrid_Pager").css({"bottom":"1px"});
                    }else{
                        $("#totalCommission_jqgrid_Pager").css({"bottom":"22px"});
                    }
                }
                if(thName === "nd_cd_relation_jqgrid"){
                    if(isSwitch){
                        $(this).setGridHeight(dataCenterHeight*0.5-212);
                    }else{
                        $(this).setGridHeight(dataCenterHeight-238);
                    }
                }
                if(thName === "extension_weld_needed_jqtwo" || thName === "extension_weld_able_jqtwo"){
                    if(isSwitch){
                        $(this).setGridHeight(dataCenterHeight*0.5-197);
                        $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-105);
                    }else{
                        $(this).parent().parent().height(dataCenterHeight*0.5-160);
                        $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-68);
                    }
                }
            });
            $centerData.width(dataCenterWidth).parent().css({"width":dataCenterWidth+"px","left":"0"});
            $("#function-tabs").children(".tabs-header").width(dataCenterWidth).children().width(dataCenterWidth);
            $datagrid.each(function () {
                var dataName = $(this).attr("id");
                if(dataName==="modelManagerGrid"){
                    modelLayout.parentsUntil('.panel').width(dataCenterWidth);
                    modelLayout.parent().parent().width(dataCenterWidth);
                    modelGrid.datagrid("resize",{"width":dataCenterWidth-54});
                }
                if(dataName==="projectManagerGrid"){
                    projectLayout.parentsUntil('.panel').width(dataCenterWidth);
                    projectLayout.parent().parent().width(dataCenterWidth);
                    projectGrid.treegrid("resize",{"width":dataCenterWidth-54});
                    $('#projectUnitManagerGrid').datagrid("resize",{"width":dataCenterWidth-54});
                }
                if(isSwitch){
                    modelGrid.datagrid("resize",{"height":(dataCenterHeight-170)*0.45});
                    projectGrid.datagrid("resize",{"height":(dataCenterHeight-170)*0.45});
                    $('#projectUnitManagerGrid').datagrid("resize",{"height":(dataCenterHeight-170)*0.45});
                    $('#projectManager>div').css({"height":"47%","overflow-y":"scroll"});
                    $('#projectManager>div>div').css({"height":"100%"});
                }else{
                    modelGrid.datagrid("resize",{"height":dataCenterHeight-170});
                    $('#projectManager>div').css({"height":"97%","overflow-y":"hidden"});
                    $('#projectManager>div>div').css({"height":"45%"});
                }
            })
        }
        if($menu.css("display") === "block" && ($jqgrid.length > 0 || $datagrid.length > 0 )){
            $jqgrid.each(function () {
                var thName = $(this).attr("id");
                $(this).parentsUntil("body").width(dataCenterWidth);
                $(this).parent().parent().parent().parent().parent().width(dataCenterWidth-252);
                $(this).parent().parent().parent().parent().parent().parent().width(dataCenterWidth-252);
                if(isSwitch){//三维视图已经打开
                    $(this).setGridWidth(dataCenterWidth-254);
                    $(this).setGridHeight(dataCenterHeight*0.5-174);//180
                    $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-118);//124

                }else{
                    $(this).setGridWidth(dataCenterWidth-254);
                    $(this).setGridHeight(dataCenterHeight*numH[0]-numH[1]);
                    $(this).parent().parent().parent().parent().parent().height(dataCenterHeight-numH[2]);//new右下侧边线
                }
                $(this).closest(".ui-jqgrid-bdiv").css({ "overflow-x" : "hidden" });
                $(this).parent().width(dataCenterWidth-254);
                if(thName === "totalCommission_jqgrid"){
                    if(isSwitch){
                        $(this).setGridHeight(dataCenterHeight*0.5-196);
                        $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-118);
                        $("#totalCommission_jqgrid_Pager").css({"bottom":"1px"});
                    }else{
                        $(this).setGridHeight(dataCenterHeight-220);//238
                        $(this).parent().parent().parent().parent().parent().height(dataCenterHeight-140);//170
                        $("#totalCommission_jqgrid_Pager").css({"bottom":"3px"});
                    }
                }
                if(thName === "nd_cd_relation_jqgrid"){
                    if(isSwitch){
                        $(this).setGridHeight(dataCenterHeight*0.5-212);
                    }else{
                        $(this).setGridHeight(dataCenterHeight-238);
                    }
                }
                if(thName === "extension_weld_needed_jqtwo" || thName === "extension_weld_able_jqtwo"){
                    if(isSwitch){
                        $(this).setGridHeight(dataCenterHeight*0.5-197);
                        $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-105);
                    }else{
                        $(this).parent().parent().height(dataCenterHeight*0.5-160);
                        $(this).parent().parent().parent().parent().parent().height(dataCenterHeight*0.5-68);
                    }
                }
            });
            $centerData.width(dataCenterWidth-200).parent().css({"width":dataCenterWidth-199+"px","left":"199px"});
            $("#function-tabs").children(".tabs-header").width(dataCenterWidth-200).children().width(dataCenterWidth-200);
            $datagrid.each(function () {
                var dataName = $(this).attr("id");
                if(dataName==="modelManagerGrid"){
                    modelLayout.parentsUntil('.panel').width(dataCenterWidth-200);
                    modelLayout.parent().parent().width(dataCenterWidth-200);
                    modelGrid.datagrid("resize",{"width":dataCenterWidth-254});
                }
                if(dataName==="projectManagerGrid"){
                    projectLayout.parentsUntil('.panel').width(dataCenterWidth-200);
                    projectLayout.parent().parent().width(dataCenterWidth-200);
                    projectGrid.treegrid("resize",{"width":dataCenterWidth-254});
                    $('#projectUnitManagerGrid').datagrid("resize",{"width":dataCenterWidth-254});
                }
                if(isSwitch){
                    modelGrid.datagrid("resize",{"height":(dataCenterHeight-170)*0.45});
                    projectGrid.datagrid("resize",{"height":(dataCenterHeight-170)*0.45});
                    $('#projectUnitManagerGrid').datagrid("resize",{"height":(dataCenterHeight-170)*0.45});
                    $('#projectManager>div').css({"height":"47%","overflow-y":"scroll"});
                    $('#projectManager>div>div').css({"height":"100%"});
                }else{
                    modelGrid.datagrid("resize",{"height":dataCenterHeight-170});
                    $('#projectManager>div').css({"height":"97%","overflow-y":"hidden"});
                    $('#projectManager>div>div').css({"height":"45%"});
                }
            })
        }
        if($menu.css("display") === "block"&& $jqgrid.length === 0){
            $centerData.parent().css({"width":dataCenterWidth-199+"px","left":"199px"});
            $(".tabs-wrap").width(dataCenterWidth-200).parentsUntil($centerData.parent()).width(dataCenterWidth-200);
            $(".tabs-panels").width(dataCenterWidth-200);
        }
    },100);
};
var resizeJqgrid = function () {
    var $jqgrid = $("table[id*='jqgrid']");
    var $datagrid = $("table[id*='Grid']");
    var numH=[1,200,141];//210;151
    resizeJqgridSum($jqgrid,numH,$datagrid);
};
var resizeJqgridTwo=function () {
    var $jqgrid = $("table[id*='jqtwo']");
    var $datagrid = $("table[id*='Grid']");
    var numH=[0.5,155,100];//160;105
    resizeJqgridSum($jqgrid,numH,$datagrid);
};
/*点击三维视图动画效果*/
$("#switch-button").click(function(){
    $("#function-tabs").css("position","relative");
    for(var i=30;i>=0;i--){
        if(i<0)break;
        $("#function-tabs").animate({top:"-"+i+"px"},4)
    }
});

/**
 * @comment_s: 点击列表按钮切换左侧菜单
 */
$(".top-menu").click(function(){
    var selectTxt = $(".tabs-selected .tabs-inner").text(),
        $projectScan = $("#project_scan"),
        $qualityScan = $("#quality_scan"),
        $pdtemp=$("#processData"),
        $pdPanel=$("#process_data_panel"),
        $pdmain=$("#process_data_main"),
        $pdgrid=$("#process_data_right_grid_box");
    if(selectTxt === "工艺参数"){
        $("#pref_info_jqgrid").trigger("reloadGrid");
    }
    if(selectTxt === "焊工管理"){
        $("#welder_management_jqgrid").trigger("reloadGrid");
    }
    if(selectTxt === "RT检测结果录入"){
        $("#rtResultList_jqgrid").trigger("reloadGrid");
    }
    if(selectTxt === "材料统计"){
        $("#material_count_jqgrid").trigger("reloadGrid");
    }
    if(selectTxt === "检测总委托"){
        setTimeout(function () {
            totalCommission.destroyGroupHeader();
            totalCommission.setGroupHeaders();
        },400)
    }
    if(selectTxt === "焊口明细"){
        setTimeout(function () {
            weldDetail.destroyWDGroupHeadear();
            weldDetail.setWDGroupHeadears();
        },400)
    }
    if(flag){
        $("#function_menu_shrink_id").parent().hide(200,function(){
            $(".top-menu").addClass("menubgcolor");
            $(".dsk-supported .dsk-nav").animate({"left":620},150);
            $("#overview_progress_control").animate({"left":30},150);
            resizeJqgrid();
            resizeJqgridTwo();
            var windowW=$(window).width();
            if($projectScan.css("display") === "block"){
                $projectScan.width(windowW-10);
                $("#progressProject-scan.panel-body").width(windowW).parent().width(windowW);
                $(".projectWrap").width((windowW-132)/3);
            }
            if($qualityScan.css("display") === "block"){
                $qualityScan.width(windowW-10);
                $("#qualityProject-scan.panel-body").width(windowW).parent().width(windowW);
                $(".qualityWrap").width((windowW-132)/3);
            }
            if($pdPanel.css("display") === "block"){
                $pdtemp.width(windowW).parent().width(windowW);
                $pdPanel.width(windowW-52);
                $pdmain.width($pdPanel.width());
                $pdgrid.width($pdmain.width()-280);
                $("#process_data_jq").setGridWidth($pdgrid.width());
            }
        });
        flag = false;
    }else{
        $("#function_menu_shrink_id").parent().show(200,function(){
            $(".top-menu").removeClass("menubgcolor");
            $(".dsk-supported .dsk-nav").animate({"left":820},150);
            $("#overview_progress_control").animate({"left":230},150);
            resizeJqgrid();
            resizeJqgridTwo();
            var windowW=$(window).width();
            if($projectScan.css("display") === "block"){
                $projectScan.width(windowW-215);
                $("#area-scan.panel-body").width(windowW-200).parent().width(windowW-200);
                $(".projectWrap").width((windowW-330)/3);
            }
            if($qualityScan.css("display") === "block"){
                $qualityScan.width(windowW-215);
                $("#qualityProject-scan.panel-body").width(windowW-200).parent().width(windowW-200);
                $(".qualityWrap").width((windowW-330)/3);
            }
            if($pdPanel.css("display") === "block"){
                $pdtemp.width(windowW-200).parent().width(windowW-200);
                $pdPanel.width(windowW-252);
                $pdmain.width($pdPanel.width());
                $pdgrid.width($pdmain.width()-280);
                $("#process_data_jq").setGridWidth($pdgrid.width());
            }
        });
        flag = true;
    }
});

$(window).resize(function () {
    resizeJqgrid();
    resizeJqgridTwo();
});
exports.resizeJqgrid = resizeJqgrid;
exports.resizeJqgridTwo = resizeJqgridTwo;