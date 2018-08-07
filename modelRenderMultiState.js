/**
 * Created by shenxian on 2018/5/25.
 */
"use strict";
var Color = require("color");
var Matrix = require("gl-matrix");
var scene3d = require("./../modelManager/scene3d");
var vic = require("./../modelManager/pcms_vic_manager");
var base = require("./../modelManager/modelManager.base");
var _ = require("lodash");
var serverURL = require("./baseInfo").getServerURL();

var factory,rootColorChangeEffect,
    view3D,
    rootNode,
    rootNodeList,
    exceptNodes = [];
var transparencyEffectList = [];

var finishHighLightEffect,finishNotAllHighLightEffect,unFinishHighLightEffect,unFinishNotAllHighLightEffect;
var finishHighLightColor,unFinishHighLightColor;

var rootHighLightColor = Color("#A9A9A9");

/**
 * 虚化三维场景
 */
var virtualScene3D = function () {
    /*if (_.isObject(transparencyEffectList) && transparencyEffectList.length > 0) {
        for(var a = 0,b = transparencyEffectList.length; a < b; a ++){
            view3D.executeCommand(transparencyEffectList[a].createChangeTransparencyCommand(0.2));
        }
    } else {
        if(rootNodeList.length > 0){
            for(var i = 0,j = rootNodeList.length;i < j;i ++){
                var  transparencyEffect = factory.EffectFactory.createTransparencyEffect({
                    destNodes : [rootNodeList[i]],
                    exceptNodes : exceptNodes,
                    transparencyValue : 0.2
                });
                view3D.addEffect(transparencyEffect);
                transparencyEffectList.push(transparencyEffect);
            }
        }
    }*/
    if (_.isObject(rootColorChangeEffect)) {
        view3D.removeEffect(rootColorChangeEffect);
        rootColorChangeEffect = factory.EffectFactory.createColorChangeEffect(rootNodeList, rootHighLightColor);
        view3D.addEffect(rootColorChangeEffect);
    } else {
        rootColorChangeEffect = factory.EffectFactory.createColorChangeEffect(rootNodeList, rootHighLightColor);
        view3D.addEffect(rootColorChangeEffect);
    }
    if(exceptNodes.length > 0){
        var option = {
            nodes:exceptNodes,
            daRatio:0.3,
            time:500,
            direction : Matrix.vec3.fromValues(-1, 0, -1)
        }
        //定位
        vic.nodesPositioning(option);
    }
}

var highLightModel = function (nodes,highLightColor) {
    if(highLightColor === "56:255:2:255"){
        exceptNodes = null;
        exceptNodes = _.compact(nodes);
        if (_.isObject(finishHighLightEffect)) {
            view3D.removeEffect(finishHighLightEffect);
            finishHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, finishHighLightColor);
            view3D.addEffect(finishHighLightEffect);
        } else {
            finishHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, finishHighLightColor);
            view3D.addEffect(finishHighLightEffect);
        }
    }else if(highLightColor === "56:255:2:100"){
        if (_.isObject(finishNotAllHighLightEffect)) {
            view3D.removeEffect(finishNotAllHighLightEffect);
            finishNotAllHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, finishHighLightColor);
            view3D.addEffect(finishNotAllHighLightEffect);
        } else {
            finishNotAllHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, finishHighLightColor);
            view3D.addEffect(finishNotAllHighLightEffect);
        }
    }else if(highLightColor === "255:0:0:255"){
        exceptNodes = exceptNodes.concat(nodes);
        if (_.isObject(unFinishHighLightEffect)) {
            view3D.removeEffect(unFinishHighLightEffect);
            unFinishHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, unFinishHighLightColor);
            view3D.addEffect(unFinishHighLightEffect);
        } else {
            unFinishHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, unFinishHighLightColor);
            view3D.addEffect(unFinishHighLightEffect);
        }
        setTimeout(function () {
            virtualScene3D();
        },300);
    }else if(highLightColor === "255:0:0:100"){
        if (_.isObject(unFinishNotAllHighLightEffect)) {
            view3D.removeEffect(unFinishNotAllHighLightEffect);
            unFinishNotAllHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, unFinishHighLightColor);
            view3D.addEffect(unFinishNotAllHighLightEffect);
        } else {
            unFinishNotAllHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, unFinishHighLightColor);
            view3D.addEffect(unFinishNotAllHighLightEffect);
        }
    }
}

function changeModelColor(itemIds, pipeSectionColor) {
    if(itemIds.length === 0){
        return;
    }
    var date1 = new  Date().getTime();
    view3D.findDescendantNodes(rootNode, itemIds, function(error, nodes) {
        if (_.isObject(error)) {
            throw Error(error.message);
        }
        nodes = _.compact(nodes);
        var date2 = new  Date().getTime();
        console.log("findDescendantNodes耗时"+(date2 - date1));
        if(nodes !== null && nodes.length !== 0){
            highLightModel(nodes,pipeSectionColor);
        }
    });
}

/**
 * 渲染管段 焊缝
 * @param welds {id : string, pipeline.id : string}
 */
var renderPipeAndWeld = function (statisticsData,finishColor,unFinishColor) {
    var date1 = new  Date().getTime();
    releaseEffect();
    initScene3D();
    if(statisticsData.finished.length === 0 && statisticsData.unfinished.length === 0){
        virtualScene3D();
    }else{
        var finishedData = statisticsData.finished;
        var unFinishedData = statisticsData.unfinished;
        finishHighLightColor = finishColor;
        unFinishHighLightColor = unFinishColor;
        // 获取所有管线线(完成)
        var finishPipelineIds = {};
        // 焊口ID集合(完成)
        var finishWeldIdsObj = {};
        var finishWeldIds = [];
        // 获取所有管线线(未完成)
        var unFinishPipelineIds = {};
        // 焊口ID集合(未完成)
        var unFinishWeldIdsObj = {};
        var unFinishWeldIds = [];

        //管段变色已经完成
        var finishPipeSectionsDoneAll = [];
        //管段变色部分完成
        var finishPipeSectionDoneNotAll = [];

        //管段变色已经完成(未完成)
        var unFinishPipeSectionsDoneAll = [];
        //管段变色部分完成(未完成)
        var unFinishPipeSectionDoneNotAll = [];

        for (var m = 0,n = finishedData.length; m < n; m++) {
            finishPipelineIds[finishedData[m].pid] = 1;
            finishWeldIdsObj[finishedData[m].wid] = 1;
            finishWeldIds.push(finishedData[m].wid);
        }
        for (var i = 0,j = unFinishedData.length; i < j; i++) {
            unFinishPipelineIds[unFinishedData[i].pid] = 1;
            unFinishWeldIdsObj[unFinishedData[i].wid] = 1;
            unFinishWeldIds.push(unFinishedData[i].wid);
        }
        var data = getAllPipeSection();//
        var date2 = new  Date().getTime();
        console.log("获取所有管段耗时"+(date2 - date1));
        matchFinishPipeColor(data,finishPipelineIds,finishWeldIdsObj,finishPipeSectionsDoneAll,finishPipeSectionDoneNotAll);
        matchUnFinishPipeColor(data,unFinishPipelineIds,unFinishWeldIdsObj,unFinishPipeSectionsDoneAll,unFinishPipeSectionDoneNotAll);
        var date3 = new  Date().getTime();
        console.log("处理数据逻辑耗时"+(date3 - date2));
        //管段变色(完成)
        finishWeldIds = _.compact(finishWeldIds);
        var finishDoneAllItemIds = finishPipeSectionsDoneAll.concat(finishWeldIds);
        changeModelColor(finishDoneAllItemIds, getColorFinished("all"));
        changeModelColor(finishPipeSectionDoneNotAll,getColorFinished("notAll"));
        //管段变色(未完成)
        unFinishWeldIds = _.compact(unFinishWeldIds);
        var unFinishDoneAllItemIds = unFinishPipeSectionsDoneAll.concat(unFinishWeldIds);
        changeModelColor(unFinishDoneAllItemIds, getColorUnFinish("all"));
        changeModelColor(unFinishPipeSectionDoneNotAll,getColorUnFinish("notAll"));
    }
}

var matchFinishPipeColor = function (data,finishPipelineIds,finishWeldIdsObj,finishPipeSectionsDoneAll,finishPipeSectionDoneNotAll) {
    var date1 = new  Date().getTime();
    for (var pipeId in finishPipelineIds) {
        for(var key in data){
            if(pipeId == data[key].pid){
                var ps = data[key].pipeIds;
                var ws = data[key].weldIds;
                var pipeSections = ps.replace("[","").replace("]","").split(",");
                var weldIdss = ws.replace("[","").replace("]","").split(",");
                var pipeSectionColor = getFinishedPipeSectionColor(finishWeldIdsObj,weldIdss);
                // 如果管段两端的焊口都未焊接完成 则管段不变色
                if (pipeSectionColor) {
                    if(pipeSectionColor === "56:255:2:255"){
                        for(var a = 0,b = pipeSections.length;a < b; a++){
                            finishPipeSectionsDoneAll.push(pipeSections[a]);
                        }
                    }else if(pipeSectionColor === "56:255:2:100"){
                        for(var c = 0,d = pipeSections.length;c < d; c++){
                            finishPipeSectionDoneNotAll.push(pipeSections[c]);
                        }
                    }
                }
            }
        }
    }
    var date2 = new  Date().getTime();
    console.log("matchFinishPipeColor耗时"+(date2 - date1));
}

function matchUnFinishPipeColor(data, unFinishPipelineIds, unFinishWeldIdsObj, unFinishPipeSectionsDoneAll, unFinishPipeSectionDoneNotAll) {
    var date1 = new  Date().getTime();
    for (var pipeId in unFinishPipelineIds) {
        for(var key in data){
            if(pipeId == data[key].pid){
                var dateww = new  Date().getTime();
                var ps = data[key].pipeIds;
                var ws = data[key].weldIds;
                var pipeSections = ps.replace("[","").replace("]","").split(",");
                var weldIdss = ws.replace("[","").replace("]","").split(",");
                var pipeSectionColor = getUnFinishedPipeSectionColor(unFinishWeldIdsObj,weldIdss);
                // 如果管段两端的焊口都未焊接完成 则管段不变色
                if (pipeSectionColor) {
                    if(pipeSectionColor === "255:0:0:255"){
                        for(var a = 0,b = pipeSections.length;a < b; a++){
                            unFinishPipeSectionsDoneAll.push(pipeSections[a]);
                        }
                    }else if(pipeSectionColor === "255:0:0:100"){
                        for(var c = 0,d = pipeSections.length;c < d; c++){
                            unFinishPipeSectionDoneNotAll.push(pipeSections[c]);
                        }
                    }
                }
                var datewwss = new  Date().getTime();
                console.log("getUnFinishedPipeSectionColor耗时"+(datewwss - dateww));
            }
        }
    }
    var date2 = new  Date().getTime();
    console.log("matchUnFinishPipeColor耗时"+(date2 - date1));
}

/**
 * 获取所有以焊缝为切分口的管段
 */
var getAllPipeSection = function () {
    var pipeSections = null;
    $.ajax({
        url : serverURL + "/pcms/air/getAllSections",
        type : "post",
        dataType : "text",
        async : false,
        success : function (data) {
            if(data){
                pipeSections = JSON.parse(data);
            }
        },
        error : function () {
            console.info("获取管段信息失败!");
        }
    });
    return pipeSections;
}


/**
 * 获取管段颜色(完成)
 */
var getFinishedPipeSectionColor = function (weldIdsObj,weldIds) {
    // 不存在焊口则返回灰色
    if (!weldIds || weldIds.length < 1) {
        return getColorFinished("none");
    }
    var weldExits = 0;
    for (var i = 0,j = weldIds.length; i < j; i++) {
        if (weldIdsObj[weldIds[i]]) {
            weldExits ++;
        }
    }
    if (weldExits < 1) {
        return getColorFinished("none");
    } else if (weldExits < weldIds.length) {
        // 管段部分完成
        return getColorFinished("notAll");
    } else {
        // 管段全部完成
        return getColorFinished("all");
    }
}

/**
 * 获取管段颜色(未完成)
 */
var getUnFinishedPipeSectionColor = function (weldIdsObj,weldIds) {
    // 不存在焊口则返回灰色
    if (!weldIds || weldIds.length < 1) {
        return getColorUnFinish("none");
    }
    var weldExits = 0;
    for (var i = 0,j = weldIds.length; i < j; i++) {
        if (weldIdsObj[weldIds[i]]) {
            weldExits ++;
        }
    }
    if (weldExits < 1) {
        return getColorUnFinish("none");
    } else if (weldExits < weldIds.length) {
        // 管段部分完成
        return getColorUnFinish("notAll");
    } else {
        // 管段全部完成
        return getColorUnFinish("all");
    }
}

/**
 * 根据焊口状态获取颜色(完成)
 */
var getColorFinished = function (status) {
    switch (status) {
        case "none" :
            return null;
        case "notAll" :
            return "56:255:2:100";
        case "all" :
            return "56:255:2:255";
    }
}

/**
 * 根据焊口状态获取颜色(未完成)
 */
var getColorUnFinish = function (status) {
    switch (status) {
        case "none" :
            return null;
        case "notAll" :
            return "255:0:0:100";
        case "all" :
            return "255:0:0:255";
    }
}


/**
 * 先初始化三维场景
 */
function initScene3D() {
    factory = scene3d.getCurrentFactory();
    view3D = scene3d.getCurrentView3D();
    rootNodeList = scene3d.getRootNodeList();
    rootNode = scene3d.getCurrentNode();
}

function releaseEffect() {
    if (_.isObject(finishHighLightEffect)) {
        view3D.removeEffect(finishHighLightEffect);
        factory.EffectFactory.releaseEffect([finishHighLightEffect]);
        finishHighLightEffect = null;
    }
    if (_.isObject(finishNotAllHighLightEffect)) {
        view3D.removeEffect(finishNotAllHighLightEffect);
        factory.EffectFactory.releaseEffect([finishNotAllHighLightEffect]);
        finishNotAllHighLightEffect = null;
    }
    if (_.isObject(unFinishHighLightEffect)) {
        view3D.removeEffect(unFinishHighLightEffect);
        factory.EffectFactory.releaseEffect([unFinishHighLightEffect]);
        unFinishHighLightEffect = null;
    }
    if (_.isObject(unFinishNotAllHighLightEffect)) {
        view3D.removeEffect(unFinishNotAllHighLightEffect);
        factory.EffectFactory.releaseEffect([unFinishNotAllHighLightEffect]);
        unFinishNotAllHighLightEffect = null;
    }
    if (_.isObject(rootColorChangeEffect)) {
        view3D.removeEffect(rootColorChangeEffect);
        factory.EffectFactory.releaseEffect([rootColorChangeEffect]);
        rootColorChangeEffect = null;
    }
    if(_.isObject(transparencyEffectList)&&(transparencyEffectList.length > 0)){
        for(var x = 0,y = transparencyEffectList.length; x < y; x ++){
            view3D.removeEffect(transparencyEffectList[x]);
        }
        factory.EffectFactory.releaseEffect(transparencyEffectList);
        transparencyEffectList = [];
    }
}

exports.renderPipeAndWeld = renderPipeAndWeld;
exports.releaseEffect = releaseEffect;

