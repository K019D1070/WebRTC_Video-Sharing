import { WebSocketManager } from "./WebSocketManager";

export class Morita{
  #ws;
  #wrtcs;
  #streams;
  #role = [];
  constructor(){
    this.#wrtcs = {};
    this.#streams = {
      desktop: null
    };
  }
  setRole(role){
    this.#role.push(role);
  }
  wsconnect(){
    this.#ws = new WebSocketManager(config.ws);
  }
  webRTCinit(){

  }
}