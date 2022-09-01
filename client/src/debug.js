function debugInfo(){
  console.log("%cWebSocket", "font-size: large;\n",
      "WebSocket status: "+ ws._ws.readyState+ ";",
      "WebSocket ping: "+ "hogehuga"+ "ms;",);
  console.log("%cWeb RTC", "font-size: large;\n",
      "Web RTC status: "+ "hogehuga"+ ";",
      "Web RTC ping: "+ "hogehuga"+ "ms;",);
}