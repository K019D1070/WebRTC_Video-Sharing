export class WebSocketManager{
  ws;
  defaultOptions = {};
  #que = [];
  dead = false;

  constructor(
    ws,
    options = {
      autostart: true
    }
  ){
    this.ws = ws;
    if(options.autostart){
      this.#s();
      this.ws.addEventListener("open",()=>{
        this.#s();
      });
    }
  }
  setDefaultOptions(options){
    this.defaultOptions = options;
  }
  sendMessage(message){
    let msg = {
      body: message,
      ...this.defaultOptions
    };
    this.#que.push(msg);
    this.#s();
  }
  send(packet){
    this.#que.push(packet);
  }
  #s(){
    if(this.ws.readyState == 1){
      this.ws.send(JSON.stringify(this.#que.shift()));
    }else if(this.ws.readyState == 3){
      this.dead = true;
      this.#que = [];
    }
  }
}