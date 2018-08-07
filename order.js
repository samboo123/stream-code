"use strict";

/**
 *
 * @param orderParamArray
 * @param columnName
 */
function pipelineWeldOrder(columnName, iCol, sortOrder, orderParamArray) {
    return getOrderParamArray(columnName, iCol, sortOrder, orderParamArray, 'pipeline.pipelineTagNumber', 'weld.orderNumber');
}

function getOrderParamArray(columnName, iCol, sortOrder, orderParamArray, pipelineTagNumberName, weldTagNumberName) {
    columnName = ((columnName === 'pipelineTagNumber' || columnName === 'pipeTagnumber' || columnName === 'pipeTagNumber' || columnName === 'pipeline.pipeTagnumber') ? pipelineTagNumberName : columnName);
    if (columnName === 'weldTagNumber' || columnName === 'weld.weldTagNumber' || columnName === 'weldTagnumber' || columnName === 'weldTagNumber' || columnName === 'weld.weldTagnumber') {
        columnName = weldTagNumberName;
    }
    var orderParam = {columnName: columnName, sortOrder: sortOrder};
    if (columnName === pipelineTagNumberName || columnName === weldTagNumberName) {
        orderParam.iCol = iCol;
        //删除不是管线或焊口的字段名
        for (var j = 0; j < orderParamArray.length; j++) {
            if (orderParamArray[j].columnName != pipelineTagNumberName && orderParamArray[j].columnName != weldTagNumberName) {
                orderParamArray.splice(j, 1);
                continue;
            }
        }
        for (var i = 0; i < orderParamArray.length; i++) {
            if (orderParamArray[i].columnName === columnName) {
                orderParamArray[i].sortOrder = sortOrder;
                break;
            }
            if (orderParamArray[i].iCol > iCol) {//  如果新元素比当前的小,则插入i前面
                orderParamArray.unshift(orderParam);
                break;
            } else if (i === orderParamArray.length - 1) {//  如果i==orderParamArray.length-1,则新元素插入到数组末尾
                orderParamArray.push(orderParam);
            } else if (orderParamArray[i].iCol < iCol && orderParamArray[i + 1].iCol > iCol) {//  如果i元素小于新元素,且(i+1)元素大于新元素,则添加到此处,停止循环
                orderParamArray.splice(i, 0, orderParam);
                break;
            } else {
                continue;
            }
        }
    } else {
        orderParamArray = [];
    }
    if (orderParamArray.length == 0) {
        orderParamArray.push(orderParam);
    }
    return orderParamArray;
}

exports.pipelineWeldOrder = pipelineWeldOrder;
exports.getOrderParamArray = getOrderParamArray;