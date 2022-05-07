export class Manager{
  #queue = [];
  connectState = false;
  constructor(){}
  start(){
    this.connectState = true;
    this.#queue.forEach((packet)=>{
      packet.to.ws.send(packet.msg);
      this.#queue.shift();
    });
  }
  stop(){
    this.connectState = false;
  }
  addQue(to, from, message){
    message.from.id = from;
    this.#queue.push({
      to: to,
      msg: JSON.stringify(message)
    });
    if(this.connectState)this.start();
  }
}