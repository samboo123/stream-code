"use strict";
var checkboxUtil = require("../util/checkboxUtil");
var handler = require("./../basic/base");
var serverURL = require("./../basic/baseInfo").getServerURL();
var pcmsConstant = require("./pcmsConstant");
var messager = require("./../messager/messager");
var showOrHideCell = require("./../showOrHideCell/showOrHideCell");
var $tabs = require("./../basic/unifiedManagementTabs");

exports.setJqqirdRowBackgroundColor = function (jqgridId, set, color) {
    if (!color) {// 默认颜色
        color = '#FEFECC';
    }
    var rowDatas = $(jqgridId).jqGrid("getRowData");
    for(var i = 0;i < rowDatas.length;i ++){
        var rowData = rowDatas[i];
        var rowid = rowData.id;
        if(set(rowData)){
            $(jqgridId + " #" + rowid).css("cssText", 'background-color:' + color + ' !important;');
        }
    }
}

/**
 *
 * @param elementId html元素id，须带#
 * @param title 弹窗标题
 * @param confirmFn 确定按钮的事件
 * @param customParam 自定义弹窗属性
 * @param resetForm 是否清空表单(默认清空)
 * @param beforeClose 关闭弹窗前执行的函数
 */
exports.initDialog = function (elementId, title, confirmFn, customParam, resetForm, beforeClose) {
    if (resetForm === null || resetForm === undefined) {
        resetForm = true;
    }
    $(elementId).dialog($.extend({
        title: title,
        closed: true,
        modal: true,
        width: 600,
        height: 400,
        zIndex: 1,
        maximizable: false,
        minimizable: false,
        draggable: true,
        shadow: false,
        onBeforeClose: function () {
            closeDialog(elementId, resetForm, beforeClose);
        },
        buttons: [
            {
                text: '确定',
                handler: function () {
                    confirmFn();
                }
            },
            {
                text: '取消',
                handler: function () {
                    closeDialog(elementId, resetForm, beforeClose);
                }
            }
        ]
    },customParam));
}

function closeDialog(elementId, resetForm, beforeClose) {
    if (resetForm) {// 清空form数据
        $(elementId + " form").form("reset");
    }
    if (beforeClose) {
        beforeClose();
    }
    $(elementId).dialog("close",true);
    // 从dom移除元素
    var child=document.getElementById(elementId.substring(1, elementId.length));
    child.parentNode.removeChild(child);
}

exports.downloadWithParam = function (url, param) {
    var form = $("<form></form>").attr("action",url).attr("method","post");
    Object.keys(param).forEach(function (key) {
        form.append($("<input/>").attr("type","hidden").attr("name",key).attr("value", param[key]));
    });
    $(document.body).append(form)
    form.submit().remove();
}

/**
 *
 * @param clearSearchBoxId 清除筛选按钮id
 * @param clearClickCallBack 清除筛选按钮点击事件
 * *@param 从第3个参数开始是搜索框id，支持任意多个，但搜索框combobox未选择时的值是''或者'全部'此功能才能正常使用
 */
exports.clearSearchBoxChange = function (clearSearchBoxId, clearClickCallBack) {
    $(clearSearchBoxId).css('display','none');
    $(clearSearchBoxId).html('清除筛选');
    $(clearSearchBoxId).linkbutton({
        iconCls : 'icon-clear',
        onClick:function () {
            clearClickCallBack();
            $(clearSearchBoxId).hide();
        }
    });
    var args = arguments;
    if (args) {
        var selectFunctions = {};
        for (var k = 2; k < args.length; k++) {
            selectFunctions[args[k]] = $(args[k]).combobox('options').onSelect;
        }
        for (var i = 2; i < args.length; i++) {
            var searchComboboxId = args[i];
            $(searchComboboxId).combobox({
                onSelect:function (record) {
                    var selectFunction = selectFunctions['#' + $(this).attr("id")];
                    if (selectFunction) {
                        selectFunction(record);
                    }
                    var flag = true;
                    for (var j = 2; j < args.length; j++) {
                        var value = $(args[j]).combobox('getValue');
                        if (value !== '' && value !== '全部') {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        $(clearSearchBoxId).hide();
                    } else {
                        $(clearSearchBoxId).show();
                    }
                }
            });
            // console.log(i + ":" + $(searchComboboxId).combobox('options').onSelect.toString())
        }
    }
}

/**
 * 显示隐藏列
 * @param elementId 显示隐藏列按钮id（需带#）
 * @param jqgridId （需带#）
 */
exports.showOrHideCol = function (elementId, jqgridId) {
    $(elementId).linkbutton({
        iconCls:'select'
    });
    $(elementId).click(function(){
        showOrHideCell.openWindow2($(jqgridId));
    });
}
exports.setFormTextBoxValue = function (fromId, jsonObj) {
    $("#" + fromId + " input[autoSetValue='1']").each(function () {
        if (jsonObj[$(this).attr("textboxname")]) {
            $(this).textbox('setValue', jsonObj[$(this).attr("textboxname")]);
        }
    });
}
exports.removeDataBtnUseId = function (elementId, getMultiselectRow, url, successCallBack) {
    removeDataBtn ($(elementId), getMultiselectRow, url, successCallBack)
}
function removeDataBtn (element, getMultiselectRow, url, successCallBack) {
    element.linkbutton({
        iconCls: 'icon-remove'
    });
    element.click(function () {
        var rowIds = getMultiselectRow();
        if (rowIds == undefined || rowIds.length == 0) {
            showMessage("请选择要删除的数据！");
        } else {
            messager.confirm({
                message: '确认要删除所选中的数据？',
                okCallback: function () {
                    pcmsAjax(url, {ids: rowIds},
                        function (data) {
                            showMessage(data);
                            successCallBack();
                            rowIds = null;
                        }, null, {traditional:true});
                }
            })
        }
    });
}
//根据id判断数组中是否存在此对象，存在则更新属性值，不存在则添加
exports.putObjToArrayNoRepeat = function (array, toAddId, attr, value) {
    var containsObj = false;
    for (var i = 0, len = array.length; i < len; i++) {
        containsObj = false;
        if (array[i].id == toAddId) {
            containsObj = true;
            array[i][attr] = value;
            break;
        }
    }
    if (!containsObj) {
        var obj = new Object();
        obj.id = toAddId;
        obj[attr] = value;
        array.push(obj);
    }
}

//删除js对象中属性值是“全部”的属性
exports.deletePropertyIsAllstr = function (filter) {
    for (var items in filter) {
        if (filter[items] == '全部') {
            delete filter[items];
        }
    }
}

function showMessage(message, title, time, style) {
    messager.show({
        message: message,
        title: title,
        time: time,
        style: style
    });
}

function pcmsAjax(url, param, successCallBack, failCallBack, customParam) {
    var ajaxCommonConfig = {
        url: serverURL + "/pcms/" + url,
        type: "post",
        data: param,
        success: successCallBack,
        error: failCallBack
    };
    var ajaxConfig = $.extend({}, ajaxCommonConfig, customParam);
    $.ajax(ajaxConfig);
}
exports.declareJqGridUseId = function(elementId, param) {
    declareJqGrid($(elementId), param);
}
function declareJqGrid (element, param) {
    var jqGridParam = $.extend({}, pcmsConstant.jqGridCommonParam, {pager: $("#" + element.attr("id") + "_Pager")}, param);
    element.jqGrid(jqGridParam);
    $tabs.resizeJqgrid();
}

exports.saveEditDataBtnUseId = function saveEditDataBtnUseId (elementId, saveUrl, getUpdateParams, successCallBack, errorCallBack, customParam) {
    saveEditDataBtn ($(elementId), saveUrl, getUpdateParams, successCallBack, errorCallBack, customParam)
}

function saveEditDataBtn (element, saveUrl, getUpdateParams, successCallBack, errorCallBack, customParam) {
    var saveBoxId = element.attr("id");
    var saveBtnId = saveBoxId + "_save_edit_btn";
    var saveBlockerId = saveBoxId + "_save_blocker";
    element.html("<label for=\"" + saveBtnId + "\" style=\"color:red;\">数据已修改请</label>" +
        "<label><a id=\"" + saveBtnId + "\" href=\"javascript:void(0)\">保存</a></label>" +
        "<span id=\"" + saveBlockerId + "\"></span>");
    $("#" + saveBtnId).linkbutton({
        iconCls: 'icon-save'
    });
    $("#" + saveBtnId).click(function () {
        var SubBlocker = handler.SubBlocker;
        SubBlocker.block("#" + saveBlockerId);
        var params = getUpdateParams();
        pcmsAjax(saveUrl, params, function (data) {
            if (data == "0") {
                SubBlocker.unBlock("#" + saveBlockerId, 2000, "更新失败！", "red");
            } else {
                SubBlocker.unBlock("#" + saveBlockerId, 2000, "更新成功!", "#FFFFFF", function () {
                });
            }
            if (successCallBack) {
                successCallBack(data);
            }
            element.slideUp();
        }, function (res, info, exc) {
            if (errorCallBack) {
                errorCallBack();
            }
            SubBlocker.unBlock("#" + saveBlockerId, 2000, "更新出错！错误信息:" + info, "red");
            element.slideUp();
        }, customParam);
    });
}

exports.cacheMultiSelectRow = checkboxUtil.cacheMultiselectRow;
exports.loadJqgridUseId = function (elementId, url, param) {
    loadJqgrid ($(elementId), url, param);
}
exports.loadJqgridCurrentPage = function (elementId, url, param) {
    var page = $(elementId).getGridParam('page');
    var rows = $(elementId).getGridParam('rows');
    var sidx = $(elementId).getGridParam('sidx');
    var sord = $(elementId).getGridParam('sord');
    $(elementId).setGridParam({
        url: serverURL + "/pcms/" + url,
        page:page,
        rows:rows,
        sidx:sidx,
        sord:sord,
        mtype: "POST",
        datatype: "json",
        postData: param
    }).trigger("reloadGrid");
}
function loadJqgrid (element, url, param) {
    element.setGridParam({
        url: serverURL + "/pcms/" + url,
        mtype: "POST",
        datatype: "json",
        postData: param
    }).trigger("reloadGrid");
}

/**
 * 将毫秒数日期格式化为yyyy-MM-dd格式
 * @param timeMillisOrDate
 * @returns {string}
 */
exports.format1 = function (timeMillisOrDate) {
    if (timeMillisOrDate) {
        timeMillisOrDate = timeMillisOrDate instanceof Date ? timeMillisOrDate : new Date(timeMillisOrDate);
        return timeMillisOrDate.getFullYear() + "-" + ((timeMillisOrDate.getMonth() + 1) > 9 ? (timeMillisOrDate.getMonth() + 1) : ("0" + (timeMillisOrDate.getMonth() + 1)))
            + "-" + (timeMillisOrDate.getDate() > 9 ? timeMillisOrDate.getDate() : ("0" + timeMillisOrDate.getDate()));
    } else {
        return "";
    }
}
exports.pcmsAjax = pcmsAjax;
exports.showMessage = showMessage;
exports.removeDataBtn = removeDataBtn;
exports.declareJqGrid = declareJqGrid;
exports.saveEditDataBtn = saveEditDataBtn;
exports.loadJqgrid = loadJqgrid;