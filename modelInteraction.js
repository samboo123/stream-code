/**
 * Created by shenxian on 2018/1/8.
 */
"use strict";
//与三维交互
var modelInteraction = require("./../modelManager/scene3d");
var modelManager = require("./../modelManager/modelManager.base");
var vic = require("./../modelManager/pcms_vic_manager");
function interactionEvent(itemId,hasChildren) {
    if (itemId) {
        //三维视图交互开关
        var is3DInteractionOn = $("#switch-button").is(":checked");
        if(!is3DInteractionOn){
            return;
        }
        var itemIds;
        if(hasChildren){
            itemIds = modelManager.getAllChildrenItems(itemId);
        }else{
            itemIds = [itemId];
        }
        modelInteraction.highlightItem(itemIds);
    }
}

function pointPick(leftPointPickCallback,rightPointPickCallback) {
    vic.pointPickInteraction(leftPointPickCallback,rightPointPickCallback);
}

function initView3d() {
    var selectedItem = modelManager.getSelectedItem();
    var option = {
        item : selectedItem,
        callback : function() {
            modelInteraction.setUserDefaultView();
        }
    };
    modelInteraction.multiDeviceModel(option);
}

exports.modelInteraction = interactionEvent;
exports.pointPick =pointPick;
exports.initView3d = initView3d;