export class WebSocketManager{
  #ws;
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
    this.#ws = new WebSocket(server.server);
    this.init(this.#ws);
    this.#ws.addEventListener("error",(e)=>{
      console.error(e);
      console.log("フォールバック");
      console.log(this.#ws);
      this.#ws = new WebSocket(server.fallback);
      this.init(this.#ws);
    });

  }
  #s(){
    this.#que.forEach((message)=>{
      this.#que.shift();
      this.#ws.send(JSON.stringify(message));
    });
  }
  send(message, options){
    let msg = {
      body: message,
      ...this.config,
      ...options
    };
    this.#que.push(msg);
    if(this.#ws.readyState == 1){
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