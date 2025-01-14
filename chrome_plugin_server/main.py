# main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import uvicorn
from collections import deque

app = FastAPI()

# 用来暂存发给 plugin 的指令（在 plugin 未连接时先暂存）
plugin_queue = deque()

html = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>控制页面</title>
</head>
<body>
<h1>控制页面</h1>
<div>
  <textarea id="cmd" rows="5" cols="50">
{"action":"open_tab","payload":{"url":"https://www.example.com"}}
  </textarea><br>
  <button onclick="sendCmd()">发送指令</button>
</div>
<hr>
<div id="log"></div>
<script>
let wsControl = new WebSocket("ws://localhost:8000/ws_control");

wsControl.onmessage = (e) => {
  document.getElementById("log").innerHTML += "<p>收到消息: " + e.data + "</p>";
};

function sendCmd() {
  let cmd = document.getElementById("cmd").value;
  wsControl.send(cmd);
}
</script>
</body>
</html>
"""

plugin_ws = None
control_ws = None

@app.get("/")
async def index():
    return HTMLResponse(html)

@app.websocket("/ws_control")
async def ws_control_endpoint(ws: WebSocket):
    global control_ws, plugin_ws
    await ws.accept()
    control_ws = ws
    try:
        while True:
            data = await ws.receive_text()
            print("[CONTROL] 接收到前端指令：", data)

            # 如果 plugin 已连接，直接转发
            if plugin_ws:
                await plugin_ws.send_text(data)
            else:
                # plugin 未连接，先存队列，等待 plugin 连接后再转发
                plugin_queue.append(data)
    except WebSocketDisconnect:
        print("[CONTROL] 断开连接")
        control_ws = None

@app.websocket("/ws_plugin")
async def ws_plugin_endpoint(ws: WebSocket):
    global control_ws, plugin_ws
    await ws.accept()
    plugin_ws = ws
    try:
        # 刚连接时，先把之前堆积的指令全部发送
        while plugin_queue:
            pending_cmd = plugin_queue.popleft()
            await plugin_ws.send_text(pending_cmd)

        while True:
            data = await ws.receive_text()
            print("[PLUGIN] 接收到插件响应：", data)

            # 把插件的响应转发给前端
            if control_ws:
                await control_ws.send_text(data)
    except WebSocketDisconnect:
        print("[PLUGIN] 断开连接")
        plugin_ws = None

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)