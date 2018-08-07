# stream-code
Simple daily



//获取所有可关闭的选项卡
function closeAllTabs() {
    var handler = $("#function-tabs");//tab选项卡对象
    var alltabs = handler.tabs("tabs");//获取所有选项卡面板
    for(var i = alltabs.length - 1; i >= 0; i--) {
        var index = handler.tabs('getTabIndex',alltabs[i]);//获取指定标签页面板的索引
        handler.tabs("close", index);//关闭一个标签页面板（tab panel），二参可以是要被关闭的标签页面板的标题（title）或索引（index）
    }
}
