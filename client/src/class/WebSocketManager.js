export class WebSocketManager{
  _ws;
  server;
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
  _fm;
  msgCallback = (msg)=>{console.log(msg);};


  constructor(server){
    this.server = server;
    this._ws = new WebSocket(this.server);
    this.init(this._ws);
  }
  #s(){
    this.#que.forEach((message)=>{
      this.#que.shift();
      this._ws.send(JSON.stringify(message));
    });
  }
  send(message, options = {}){
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
  firstMessage(message, options){
    if(message !== undefined){
      this._fm = [message, options];
    }
    if(this._fm !== undefined){
      this.send(...this._fm);
    }
  }
  init(ws){
    this.firstMessage();
    ws.addEventListener("open",()=>{
      this.#s();
    });
    ws.addEventListener("message",(e)=>{
      let message = JSON.parse(e.data);
      this.msgCallback(message);
    });
    this._ws.addEventListener("close", (e)=>{
      console.log("WebSocket closed");
      console.log("WebSocket接続が切断されました。再接続します。");
      this._ws = new WebSocket(this.server);
      this.init(this._ws);
    });
  }
}