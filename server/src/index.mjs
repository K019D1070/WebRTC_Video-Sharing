import { WebSocketServer } from 'ws';
const { createHash } = await import("crypto");
import { Manager } from "./class/Manager.mjs";

const man = new Manager();
const wss = new WebSocketServer({ port: 8080 });
let pass = true;

const host = {
  ws: null,
};
let idCounter = 0;
let connections = {};

wss.on('connection', function connection(ws) {
  let connection = {
    id: null
  };
  ws.on('message', function message(data) {
    let msg = {};
    if(connection.id == null){
      connection.id = ++idCounter;
      connection.ws = ws;
      connections[connection.id] = connection;
    }
    console.log("message----------------");
    console.log("connection id: "+ connection.id);
    try{
      msg = JSON.parse(data);
    }catch{
    }
    console.log(msg);
    if(msg.to.role == "wsserver" && msg.subject == "login" && msg.body != undefined){
      let hashedPass = createHash("sha3-512").update(msg.body).digest("hex");
      if(hashedPass == pass || pass === true){
        if(pass === true){
          pass = hashedPass;
          console.log("password set."+ "\n"+ pass);
        }
        console.log("logged in.");
        host.ws = ws;
        man.connected();
        ws.addEventListener("close", ()=>man.disconnected())
      }else{
        console.log("login failed.");
      }
    }else{
      switch(true){
        case msg.to.role == "host":
          man.addQue(
            host,
            connection.id,
            msg
          );
          break;
        case msg.to.id != undefined:
          man.addQue(
            connections[msg.to.id],
            connection.id,
            msg
          );
          break;
      }
      console.log("relay message.");
    }
    console.log("-----------------------");
  });
});