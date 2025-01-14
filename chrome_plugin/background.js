let ws = null;

let requestLogs = {}; // 用于存储各 tab 的请求列表

// 在 Manifest V3 中只能在 service worker(本文件)使用 webRequest API
chrome.webRequest.onBeforeRequest.addListener(
  details => {
    const tabId = details.tabId;
    if (tabId < 0) return;
    if (!requestLogs[tabId]) requestLogs[tabId] = [];
    // 可自行决定要不要只存简化信息
    requestLogs[tabId].push({
      url: details.url,
      method: details.method,
      timeStamp: details.timeStamp
    });
  },
  { urls: ["<all_urls>"] }
);

// 初始化 WebSocket 连接
function initWebSocket() {
  ws = new WebSocket("ws://127.0.0.1:8000/ws_plugin");

  ws.onopen = () => console.log("WebSocket连接已打开");
  ws.onmessage = (event) => handleMessage(event.data);
  ws.onclose = () => {
    console.log("WebSocket连接已关闭");
    setTimeout(initWebSocket, 2000); // 自动重连
  };
}

// 处理后端发来的指令
async function handleMessage(msg) {
  try {
    const data = JSON.parse(msg);
    const { action, payload } = data;

    switch (action) {
      // 1. 打开新tab
      case "open_tab": {
        await chrome.tabs.create({ url: payload.url });
        wsSend({ action: "open_tab_response", data: {success:true}});
        break;
      }
      case "get_curr_tab": {
         let queryOptions = { active: true, lastFocusedWindow: true };
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
         wsSend({ action: "get_curr_tab_response", data: tab });
        break;
      }
      // 2. 关闭指定tab
      case "close_tab": {
        await chrome.tabs.remove(payload.tabId);
         wsSend({ action: "close_tab_response", data: {success:true} });
        break;
      }
      // 3. 切换到指定tab
      case "switch_tab": {
        await chrome.tabs.update(payload.tabId, { active: true });
        wsSend({ action: "switch_tab_response", data: {success:true}});
        break;
      }
      // 4. 获取当前tab列表
      case "list_tabs": {
        const tabs = await chrome.tabs.query({});
        wsSend({ action: "list_tabs_response", data: tabs });
        break;
      }
      // 5. 获取当前激活tab的页面内容
      case "get_curr_tab_page_load": {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        // 发送给 content script 获取内容
        chrome.tabs.sendMessage(tab.id, { action: "get_page_content" }, response => {
          wsSend({ action: "get_curr_tab_page_load_response", data: response });
        });
        break;
      }
      // 新增：获取window列表
      case "list_windows": {
        const windows = await chrome.windows.getAll({ populate: false });
        wsSend({ action: "list_windows_response", data: windows });
        break;
      }
      // 新增：切换到指定window
      case "switch_window": {
        // 让某个window聚焦
        console.log("switch window", payload);
        // 如果为 true，则以吸引用户注意窗口的方式显示窗口，而不会更改聚焦的窗口。该效果将持续到用户将焦点切换到窗口为止。如果窗口已具有焦点，则此选项无效。设置为 false 可取消之前的 drawAttention 请求。
        await chrome.windows.update(payload.windowId, { focused: true, drawAttention: payload.asTop});
        wsSend({ action: "switch_window_response", data: {success:true} });
        break;
      }
      // 以下操作需要在 content_script 中执行
      // 6. 获取页面元素内容
      // 7. 点击元素
      // 8. 输入文本
      // 9. 滚动
      default: {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        chrome.tabs.sendMessage(tab.id, data, response => {
          wsSend({ action: action + "_response", data: response });
        });
      }
    }
  } catch (e) {
    console.log("消息解析异常", e);
  }
}

// 向后端发送消息
function wsSend(obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

// 启动
initWebSocket();