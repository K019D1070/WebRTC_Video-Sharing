export class WebSocketManager{
  #ws;
  #que = [];
  #default = {};
  msgCallback = (msg)=>{console.log(msg);};
  constructor(config, role){
    this.#ws = new WebSocket(config);

    this.#default = {
      from: {
        role: role
      },
      to: {
        role: ((role)=>{if(role == "host"){return "invitator"}return "host";})(role)
      }
    }
    this.#ws.addEventListener("open",()=>{
      this.#s();
    });
    this.#ws.addEventListener("message",(e)=>{
      let message = JSON.parse(e.data);
      let msg = {
        msg: message,
        reply: (m)=>{
          this.send({
            ...{
              to: message.from,
              from: message.to,
            },
            ...m
          });
        }
      }
      this.msgCallback(msg);
    });
  }
  #s(){
    this.#que.forEach((message)=>{
      this.#que.shift();
      if(message.from == undefined)message.from = {...this.#default.from, ...message.from}
      if(message.to == undefined)message.to= {...this.#default.to, ...message.to}
      this.#ws.send(JSON.stringify(message));
    });
  }
  send(message){
    this.#que.push(message);
    if(this.#ws.readyState == 1){
      this.#s();
    }
  }
}