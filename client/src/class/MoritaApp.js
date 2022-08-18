import { WebSocketManager } from "./WebSocketManager";

export class MoritaApp{
  /**
   * @type {WebSocketManager}
   */
  #ws;
  /**
   * @type {Array<WebSocketManager>}
   */
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
    this.#ws.send();
  }
  /**
   * 
   * @param {Array<String>} roles An array included role Strings. Example: ["host", "mirror"]
   */
  setRoles(roles){
    roles.forEach((role)=>{
      this.setRole(role);
    });
  }
  wsConnect(server){
    this.#ws = new WebSocketManager(server);
  }
  webRTCinit(){

  }
}