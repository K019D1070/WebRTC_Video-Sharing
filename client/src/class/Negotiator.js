export class Negotiator{
  #ws;
  #defaultOptions;
  constructor(ws, defaultOptions){
    this.#ws = ws;
  }
  send(message, options = {}){
    sendOptions = {...options, ...this.#defaultOptions}
    this.#ws.send(message, options);
  }
}