/**
 * Created by shenxian on 2017/8/11.
 */
"use strict";
/**
 * 服务器的地址
 */
var serverURL = window.location.protocol+'//'+window.location.host;

var airURL = "http://192.168.1.73:8081/AIR/";


/**
 * BRS服务地址
 */
var BRSURL = null;


var setBRSURL = function() {
    $.ajax({
        type : "GET",
        url : serverURL + "/pcms/brs/getBRSUrl",
        //dataType : "json",
        success : function(info) {
            BRSURL = info;
        },
        error : function() {
            throw Error("获取云渲染地址失败");
        }
    });
}
var setAIRURL = function(){
    $.ajax({
        type : "GET",
        url : serverURL + "/pcms/air/getAirURL",
        //dataType : "json",
        success : function(info) {
            airURL = info;
        },
        error : function() {
            throw Error("获取AIR地址失败");
        }
    });
}
function getServerURL() {
    return serverURL;
}

function getAirURL(){
    return airURL;
}

function getBRSURL() {
    return BRSURL;
}
function initURL() {
    setBRSURL();
    setAIRURL();
}
exports.getServerURL = getServerURL;
exports.getAirURL = getAirURL;
exports.getBRSURL = getBRSURL;
exports.initURL = initURL;
