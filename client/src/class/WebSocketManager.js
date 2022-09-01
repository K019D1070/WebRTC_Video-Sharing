export class WebSocketManager{
  _ws;
  #que = [];
  config = {
    from: {
      role: null,
      id: null
    },
    to: {
      role: null,
      id: null
    }
  };

  msgCallback = (msg)=>{console.log(msg);};
  constructor(server){
    this._ws = new WebSocket(server.server);
    this.init(this._ws);
    this._ws.addEventListener("error",(e)=>{
      console.error(e);
      console.log("フォールバック");
      console.log(this._ws);
      this._ws = new WebSocket(server.fallback);
      this.init(this._ws);
    });
    this._ws.addEventListener("close", (e)=>{
      console.log("WebSocket closed");
      alert("WebSocket接続が切断されました。再接続します。");
      this._ws = new WebSocket(server.server);
      this.init(this._ws);
      this._ws.addEventListener("error",(e)=>{
        console.error(e);
        console.log("フォールバック");
        console.log(this._ws);
        this._ws = new WebSocket(server.fallback);
        this.init(this._ws);
      });
    });
  }
  #s(){
    this.#que.forEach((message)=>{
      this.#que.shift();
      this._ws.send(JSON.stringify(message));
    });
  }
  send(message, options){
    let msg = {
      body: message,
      ...this.config,
      ...options
    };
    this.#que.push(msg);
    if(this._ws.readyState == 1){
      this.#s();
    }
  }
  init(ws){
    ws.addEventListener("open",()=>{
      this.#s();
    });
    ws.addEventListener("message",(e)=>{
      let message = JSON.parse(e.data);
      this.msgCallback(message);
    });
  }
}