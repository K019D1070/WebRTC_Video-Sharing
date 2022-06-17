export class Manager{
  #queue = [];
  connectState = false;
  constructor(){}
  start(){
    this.#queue.forEach((packet)=>{
      console.log("tx");
      packet.to.ws.send(packet.msg);
      this.#queue.shift();
    });
  }
  disconnected(){
    console.log("host disconnected");
    this.connectState = false;
  }
  connected(){
    this.connectState = true;
    this.start();
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