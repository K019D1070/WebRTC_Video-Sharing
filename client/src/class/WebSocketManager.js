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
  constructor(config){
    this.#ws = new WebSocket(config);

    this.#ws.addEventListener("open",()=>{
      this.#s();
    });
    this.#ws.addEventListener("message",(e)=>{
      let message = JSON.parse(e.data);
      this.msgCallback(message);
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
}