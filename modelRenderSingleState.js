/**
 * Created by shenxian on 2018/5/24.
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

var doneHighLightEffect,notAllHighLightEffect;
var doneHighLightColor,notAllHighLightColor;

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
        if (_.isObject(doneHighLightEffect)) {
            view3D.removeEffect(doneHighLightEffect);
            doneHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, doneHighLightColor);
            view3D.addEffect(doneHighLightEffect);
        } else {
            doneHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, doneHighLightColor);
            view3D.addEffect(doneHighLightEffect);
        }
        setTimeout(function () {
            virtualScene3D();
        },300);
    }else if(highLightColor === "56:255:2:100"){
        if (_.isObject(notAllHighLightEffect)) {
            view3D.removeEffect(notAllHighLightEffect);
            notAllHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, notAllHighLightColor);
            view3D.addEffect(notAllHighLightEffect);
        } else {
            notAllHighLightEffect = factory.EffectFactory.createColorChangeEffect(nodes, notAllHighLightColor);
            view3D.addEffect(notAllHighLightEffect);
        }
    }
}

function changeModelColor(itemIds, pipeSectionColor) {
    if(itemIds.length > 0){
        view3D.findDescendantNodes(rootNode, itemIds, function(error, nodes) {
            if (_.isObject(error)) {
                throw Error(error.message);
            }
            nodes = _.compact(nodes);
            if(nodes !== null && nodes.length !== 0){
                highLightModel(nodes,pipeSectionColor);
            }
        });
    }
}

/**
 * 渲染管段 焊缝
 * @param welds {id : string, pipeline.id : string}
 */
var renderPipeAndWeld = function (welds,resource,color) {
    releaseEffect();
    initScene3D();
    if(welds === null || welds.length === 0){
        virtualScene3D();
        return;
    }
    doneHighLightColor = notAllHighLightColor = color;
    // 获取所有管线线(完成)
    var pipelineIds = {};
    // 焊口ID集合(完成)
    var weldIdsObj = {};
    var weldIds = [];

    //管段变色已经完成
    var pipeSectionsDoneAll = [];
    //管段变色部分完成
    var pipeSectionDoneNotAll = [];

    if(resource === "weldprocess"){
        for (var i = 0,j = welds.length; i < j; i++) {
            pipelineIds[welds[i].pid] = 1;
            weldIdsObj[welds[i].wid] = 1;
            weldIds.push(welds[i].wid);
        }
    }
    var data = getAllPipeSection();//
    if(data.length > 0){
        for (var pipeId in pipelineIds) {
            for(var key in data){
                if(pipeId == data[key].pid){
                    var ps = data[key].pipeIds;
                    var ws = data[key].weldIds;
                    var pipeSections = ps.replace("[","").replace("]","").split(",");
                    var weldIdss = ws.replace("[","").replace("]","").split(",");
                    var pipeSectionColor = getPipeSectionColor(weldIdsObj,weldIdss);
                    // 如果管段两端的焊口都未焊接完成 则管段不变色
                    if (pipeSectionColor) {
                        if(pipeSectionColor === "56:255:2:255"){
                            for(var a = 0,b = pipeSections.length;a < b; a++){
                                pipeSectionsDoneAll.push(pipeSections[a]);
                            }
                        }else if(pipeSectionColor === "56:255:2:100"){
                            for(var c = 0,d = pipeSections.length;c < d; c++){
                                pipeSectionDoneNotAll.push(pipeSections[c]);
                            }
                        }
                    }
                }
            }
        }
        weldIds = _.compact(weldIds);
        var doneAllItemIds = pipeSectionsDoneAll.concat(weldIds);
        //管段变色
        changeModelColor(doneAllItemIds, getColorByStatus("all"));
        changeModelColor(pipeSectionDoneNotAll,getColorByStatus("notAll"));
    }
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
 * 获取管段颜色
 */
var getPipeSectionColor = function (weldIdsObj,weldIds) {
    // 不存在焊口则返回灰色
    if (!weldIds || weldIds.length < 1) {
        return getColorByStatus("none");
    }
    var weldExits = 0;
    for (var i = 0,j = weldIds.length; i < j; i++) {
        // 如果焊口已焊接完成
        if (weldIdsObj[weldIds[i]]) {
            weldExits ++;
        }
    }
    if (weldExits < 1) {
        return getColorByStatus("none");
    } else if (weldExits < weldIds.length) {
        // 管段部分焊口焊接完成
        return getColorByStatus("notAll");
    } else {
        // 管段全部焊口焊接完成
        return getColorByStatus("all");
    }
}

/**
 * 根据焊口状态获取颜色(完成)
 */
var getColorByStatus = function (status) {
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
 * 先初始化三维场景
 */
function initScene3D() {
    factory = scene3d.getCurrentFactory();
    view3D = scene3d.getCurrentView3D();
    rootNodeList = scene3d.getRootNodeList();
    rootNode = scene3d.getCurrentNode();
}

function releaseEffect() {
    if (_.isObject(doneHighLightEffect)) {
        view3D.removeEffect(doneHighLightEffect);
        factory.EffectFactory.releaseEffect([doneHighLightEffect]);
        doneHighLightEffect = null;
    }
    if (_.isObject(notAllHighLightEffect)) {
        view3D.removeEffect(notAllHighLightEffect);
        factory.EffectFactory.releaseEffect([notAllHighLightEffect]);
        notAllHighLightEffect = null;
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

