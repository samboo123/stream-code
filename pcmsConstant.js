"use strict";
exports.jqGridCommonParam = {
    data: [],
    datatype: "local",
    cellEdit: true,
    shrinkToFit: true,
    autoScroll: true,
    autoWidth: true,
    cellsubmit: "clientArray",
    multiselect : true,
    rownumbers : true,
    rownumWidth: 30,
    viewrecords: true,//是否在浏览导航栏显示记录总数
    rowNum: 10,//每页显示记录数   -1为全部
    sortorder: "asc",
    rowList: [10, 20, 30],//用于改变显示行数的下拉列表框的元素数组。
    sortable: false,
    jsonReader: {
        root: "dataList", // 指明表格所需要的数据从哪里开始
        page: "currentPage", // 当前页
        total: "totalPage", // 总页数
        records: "totalRecords" // 总记录条数
    }
}