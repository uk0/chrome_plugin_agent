// 监听 background.js 传来的指令
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    const {action, payload} = request;
    switch (action) {
        // 5. 获取页面内容
        case "get_page_content": {
            const htmlContent = document.documentElement.outerHTML;
            sendResponse(htmlContent);
            break;
        }
        // 6. 获取元素内容
        case "get_element_html": {
            const {selector, xpath} = payload;
            let element = null;
            if (selector !== "") {
                element = document.querySelector(selector);
            }
            if (xpath !== "") {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                element = result.singleNodeValue;
            }
            sendResponse(element ? element.outerHTML : "");
            break;
        }
        // 6. 获取元素内容
        case "get_element_text": {
            const {selector, xpath} = payload;
            let element = null;
            if (selector !== "") {
                element = document.querySelector(selector);
            }
            if (xpath !== "") {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                element = result.singleNodeValue;
            }
            sendResponse(element ? element.innerText : "");
            break;
        }
        // 7. 点击元素
        case "click_element": {
            const {selector, xpath} = payload;
            let element = null;
            if (selector !== "") {
                element = document.querySelector(selector);
            }
            if (xpath !== "") {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                element = result.singleNodeValue;
            }
            if (element) element.click();
            sendResponse({success: !!element});
            break;
        }
        // 8. 输入文本
        case "input_text": {
            const {selector, text} = payload;
            const element = document.querySelector(selector);
            if (element) {
                element.value = text;  // 对于input/textarea生效
                // 触发事件以让页面检测到输入
                element.dispatchEvent(new Event('input', {bubbles: true}));
            }
            sendResponse({success: !!element});
            break;
        }
        // 9. 滚动
        case "scroll_down": {
            const {px} = payload;
            window.scrollBy(0, px);
            sendResponse({success: true});
            break;
        }
        // 9. 刷新
        case "refresh_active_page": {
            // 刷新当前页面
            window.location.reload();
            sendResponse({success: true});
            break;
        }
        default:
            sendResponse({error: "未知操作"});
    }

    // 必须返回 true 或在处理完异步后调用 sendResponse，否则消息通道会立即关闭
    return true;
});