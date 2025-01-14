## Chrome Plugin AI AutoMan(Agent)

### TODO 


* [✅] 支持多窗口
* [✅] 支持多Tab切换
* [✅] 支持页面刷新
* [✅] 支持页面滚动
* [✅] 支持页面点击
* [✅] 支持页面输入
* [✅] 支持页面元素获取
* [❎] 优化代码
* [❎] 支持Langchain



### examples 


```bash

{"action":"open_tab","payload":{"url":"https://console.tensorsecurity.cn/#/palace/event-center/159372654275479392"}}
{"action":"get_curr_tab"} #获取当前tab详情
{"action":"get_curr_tab_page_load"} #获取当前激活的tab页面的内容
{"action":"close_tab","payload":{"tabId":1418708484}} # 关闭某一个tab
{"action":"switch_tab","payload":{"tabId":1418708414}} #切换到某一个tab
{"action":"list_tabs"} # 获取所有tab列表
{"action":"get_page_content"} #获取激活页面的Text（注意是text）
{"action":"get_element_text","payload":{"xpath":"","selector":"#default_base"}} #获取某一个元素的text
#点击操作
{"action":"click_element","payload":{"xpath":"","selector":"#layoutMain > div > div.ant-page-header.tz-header.header-content.has-breadcrumb.ant-page-header-ghost > div > span > div > div > div > button.ant-btn.ant-btn-default.tz-button.ml16"}}
{"action":"click_element","payload":{"selector":"","xpath":"//*[@id=\"layoutMain\"]/div/div[1]/div/span/div/div/div/button[2]"}}
#输入操作
{"action":"input_text","payload":{"selector":"#layoutMainContent > div > span > span > input","text":"Hello World"}}
#获取某一个element 的原始内容（会自动等待加载完成）
{"action":"get_element_html","payload":{"selector":"","xpath":"//*[@id=\"gd427jr2_titleDetail\"]"}}
# 被激活页面向上移动 px
{"action":"scroll_down","payload":{"px":-300}}
# 被激活页面向下移动px
{"action":"scroll_down","payload":{"px":300}}

#刷新激活的tab
{"action":"refresh_active_page"} 

#获取window 列表
{"action":"list_windows"} 

#切换到指定window
{"action":"switch_window","payload":{"windowId":1418707623,"asTop":true}}

```