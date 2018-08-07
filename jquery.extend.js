"use strict";
jQuery.extend({
    'KVToObject': function (serializeStr) {
        var jsonArr = {};
        if (!serializeStr) {
            return null;
        }
        var kv = serializeStr.replace(/\+/g, " ");
        kv = kv.split("&");
        for (var i = 0; i < kv.length; i++) {
            var arr = kv[i].split("=");
            if ($.trim(arr[1]) == "") {
                continue;
            }
            jsonArr[decodeURIComponent(arr[0])] = decodeURIComponent(arr[1]);
        }
        var rtn = null;
        // 判断是否有值
        for (var key in jsonArr) {
            rtn = jsonArr;
            break;
        }
        return rtn;
    }
});
jQuery.extend({
    'strToObject': function (str) {
        var obj = {};
        str = $.trim(str);
        if (str) {
            if (str.substring(0, 1) != "{") {
                str = "{" + str + "}";
            }
            obj = (new Function("return " + str))();
        }
        return obj;
    }
});


$.extend($.fn.combo.defaults.inputEvents.click = function (event) {
    var t = $(event.data.target);
    if (t.attr("type") == "checkbox" || t.attr("type") == "radio") {
        t.focus().validatebox("validate");
    }
    if(t.hasClass("combobox-f combo-f textbox-f")){
        t.combobox("showPanel");
        t.combobox("setValue","");
    }else if(t.hasClass("datebox-f combo-f textbox-f")){
        t.datebox("showPanel");
    }
})

$.extend($.fn.textbox.defaults.inputEvents,{
    blur: function(event){
        var value = event.currentTarget.value;
        if(value.indexOf('请输入') === -1){
            value = value.replace(/^\s+|\s+$/g,"");
        }else{
            value = value.replace(/^[\u4e00-\u9fa5]{3,}/,"");
        }
        $(event.data.target).textbox("setValue",value);
    }
})

//easyui校验扩展：combobox值必须为下拉框中有的值
$.extend($.fn.validatebox.defaults.rules, {
    comboboxExistData: {
        validator: function (value, param) {
            var textFieldName = $(param[0]).combobox("options").textField;
            var data = $(param[0]).combobox("getData");
            var multiple = $(param[0]).combobox("options").multiple;
            if (multiple && multiple == true) {//多选校验
                var items = value.split(",");
                for (var h = 0; h < items.length; h++) {
                    var notContains = true;
                    for (var j = 0; j < data.length; j++) {
                        if (items[h] == data[j][textFieldName]) {
                            notContains = false;
                            break;
                        }
                    }
                    if (notContains) {
                        return false;
                    }
                }
                return true;
            } else {//单选校验
                for (var i = 0; i < data.length; i++) {
                    if (value == data[i][textFieldName]) {
                        return true;
                    }
                }
            }
            return false;
        },
        message:'该数据已经录入或该数据不存在!'
    }
});
//easyui combobox扩展：带复选框，支持多选
$.parser.plugins.push("checkCombobox");//注册扩展组件
$.fn.checkCombobox = function (options, param) {//定义扩展组件
    //当options为字符串时，说明执行的是该插件的方法。
    if (typeof options == "string") {
        return $.fn.combobox.apply(this, arguments);
    }
    options = options || {};

    //当该组件在一个页面出现多次时，this是一个集合，故需要通过each遍历。
    return this.each(function () {
        var jq = $(this);

        //$.fn.combobox.parseOptions(this)作用是获取页面中的data-options中的配置
        var userOpts = $.extend({}, $.fn.combobox.parseOptions(this), options);

        //把配置对象myopts放到$.fn.combobox这个函数中执行。
        var myopts = $.extend({}, userOpts, {
            multiple: true,
            formatter: function (row) { //formatter方法就是实现了在每个下拉选项前面增加checkbox框的方法
                var opts = $(this).combobox('options');
                return '<input type="checkbox" class="combobox-checkbox">' + row[opts.textField];
            },
            onLoadSuccess: function () {  //下拉框数据加载成功调用
                var opts = $(this).combobox('options');
                var target = this;
                var values = $(target).combobox('getValues');//获取选中的值的values
                $.map(values, function (value) {
                    var el = opts.finder.getEl(target, value);
                    el.find('input.combobox-checkbox')._propAttr('checked', true);
                })
                if (userOpts.onLoadSuccess) {
                    userOpts.onLoadSuccess();
                }
            },
            onSelect: function (row) { //选中一个选项时调用
                var opts = $(this).combobox('options');
                //获取选中的值的values
                var values = $(this).combobox('getValues');
                if (values.length > 1) {
                    //如果最后一个值系统不存在,则将其删除
                    var data = $(this).combobox("getData");
                    var notContains = true;
                    var value = values[values.length - 2];//combobox的onSelect事件是点击之后触发,点击选中的数据已拼接在数组末尾
                    for (var i = 0; i < data.length; i++) {
                        if (value == data[i][opts.valueField]) {
                            notContains = false;
                            break;
                        }
                    }
                    if (notContains) {
                        values.splice(values.length - 2, 1);
                        $(this).combobox('setValues', values);
                    }
                }
                $(this).val(values);
                //设置选中值所对应的复选框为选中状态
                var el = opts.finder.getEl(this, row[opts.valueField]);
                el.find('input.combobox-checkbox')._propAttr('checked', true);
                if (userOpts.onSelect) {
                    userOpts.onSelect(row);
                }
            },
            onUnselect: function (row) {//不选中一个选项时调用
                var opts = $(this).combobox('options');
                //获取选中的值的values
                $(this).val($(this).combobox('getValues'));

                var el = opts.finder.getEl(this, row[opts.valueField]);
                el.find('input.combobox-checkbox')._propAttr('checked', false);
                if (userOpts.onUnselect) {
                    userOpts.onUnselect(row);
                }
            },
            onChange: function (newValue, oldValue) {
                $(".combobox-checkbox")._propAttr('checked', false);
                var values = newValue.toString().split(",");
                var data = $(this).combobox("getData");
                var opts = $(this).combobox('options');
                for (var i = 0; i < data.length; i++) {
                    var contains = false;
                    for (var j = 0; j < values.length; j++) {
                        if (data[i][opts.valueField] == values[j]) {
                            contains = true;
                            break;
                        }
                    }
                    var el = opts.finder.getEl(this, data[i][opts.valueField]);
                    if (contains) {
                        el.find('input.combobox-checkbox')._propAttr('checked', true);
                    } else {
                        el.find('input.combobox-checkbox')._propAttr('checked', false);
                    }
                }
                if (userOpts.onChange) {
                    userOpts.onChange(newValue, oldValue);
                }
            }
        });
        $.fn.combobox.call(jq, myopts);
    });
};

function switchShow1() {
    $(this).next().hide();
}

$.fn.myPropertygrid = function (options, params) {
    var root = this;
    var groups = {};

    if (root.next(".myPropertygridDiv").html() != "") {
        root.next(".myPropertygridDiv").html("");
    }
    $.ajax({
        url: options.url,
        async:false,
        success: function (value) {
            var htmlText = "<div class='myPropertygridDiv'>";
            var rowdata = value.rows;
            for (var i = 0; i < rowdata.length; i++) {
                if (groups[rowdata[i].group] == undefined) {
                    groups[rowdata[i].group] = [];
                }
                groups[rowdata[i].group].push(rowdata[i]);
            }
            Object.keys(groups).forEach(function (key) {
                htmlText += "<div class='myPropertygridGropDiv' style='width: 100%'>" + key + "</div><table style='width: 100%' border=\"1\">";
                var rows = groups[key];
                for (var j = 0; j < rows.length; j++) {
                    var format = getMyPropertyGridFormat(key,rows[j].name,options.formats);
                    var htmlValue;
                    if(format){
                        htmlValue = format(rows[j].value);
                    }else {
                        htmlValue = rows[j].value == null ? "" : rows[j].value;
                    }
                    htmlText += "<tr><td style='width: 40%;text-align: center'>" + rows[j].name + "</td>" + "<td style='width: 60%;text-align: center'>" + htmlValue + "</td></tr>";
                }
                htmlText += "</table>";
            });
            $(root).after(htmlText + "</div>");
            $(".myPropertygridGropDiv").click(function () {
                if ($(this).next().css("display") == "none") {
                    $(this).next().show();
                    $(this).removeClass("shift");
                } else {
                    $(this).next().hide();
                    $(this).addClass("shift");
                }
            })
        }
    })
}

function getMyPropertyGridFormat(group, name, formatData) {
    for(var i in formatData){
        if (group == formatData[i].group && name == formatData[i].name){
            return formatData[i].format;
        }
    }
    return null;
}

$.fn.getComboboxOrderedValue = function () {
    var selectData = $(this).val();
    var data = $(this).combobox("getData");
    var options = $(this).combobox("options");
    var valueField = options.valueField;
    var orderedStr = "";
    for (var i = 0; i < data.length; i++) {
        if (selectData.indexOf(data[i][valueField]) != -1) {
            orderedStr += data[i][valueField] + ",";
        }
    }
    return orderedStr.substring(0, orderedStr.lastIndexOf(','));
}

$.extend($.fn.validatebox.defaults.tipOptions, {
    showEvent: "none", hideEvent: "none", showDelay: 0, hideDelay: 0, zIndex: "", onShow: function () {
        $(this).tooltip("tip").css({color: "#000", borderColor: "#CC9933", backgroundColor: "#FFFFCC"});
    }, onHide: function () {
        $(this).tooltip("destroy");
    }
});
$.extend($.fn.numberbox.defaults, {
    precision:10,
    formatter:function(value) {
        return deleteNoUseZero(value);
    },
    parser:function (s) {
        return deleteNoUseZero(s);
    }
});

function deleteNoUseZero(value) {
    if (value) {
        var parseNum = parseFloat(value);
        if (isNaN(parseNum)) {
            return "";
        }
        return parseNum.toString();
    } else {
        return value;
    }
}

//初始化插件
//easyui日期控件清空按钮
var dateboxEmptyButtons = $.extend([], $.fn.datebox.defaults.buttons);
dateboxEmptyButtons.splice(1, 0, {
    text: '清空',
    handler: function (target) {
        $(target).datebox("setValue", "");
        $(target).datebox("hidePanel");
    }
});
$.extend($.fn.datebox.defaults.buttons, dateboxEmptyButtons);

//重写tree方法scrollTo，
// 可已经选择的信息在滚动栏中展示到最上边
$.extend($.fn.tree.methods, {
    scrollTo: function(jqTree, param) {
        var tree = this;
        //如果node为空，则获取当前选中的node
        var targetNode = param && param.targetNode ? param.targetNode : tree.getSelected(jqTree);
        if (targetNode != null) {
            //判断节点是否在可视区域
            var root = tree.getRoot(jqTree);
            var $targetNode = $(targetNode.target);
            var containerH = jqTree.height();
            var nodeOffsetHeight = $targetNode.offset().top - jqTree.offset().top;
            var timer = setInterval(function () {
                if (root.state == "open") {
                    if (nodeOffsetHeight > (containerH)) {
                        var scrollHeight = jqTree.scrollTop() + nodeOffsetHeight;
                        jqTree.scrollTop(scrollHeight);
                        clearInterval(timer)
                    }else{
                        var scrollHeight1 = jqTree.scrollTop() + nodeOffsetHeight;
                        jqTree.scrollTop(scrollHeight1);
                        clearInterval(timer)
                    }
                }
            },100)
        }
    }
});