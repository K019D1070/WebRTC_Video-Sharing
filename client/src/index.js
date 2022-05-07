import { config } from "../config/config.js";
import { WebRTCSender, WebRTCReciever } from "./class/WebRTC.js";
import { WebSocketManager } from "./class/WebSocketManager.js";


let queries = new URLSearchParams(document.location.search);
let mode = queries.get("mode");
let role = (()=>{if(mode == "host"){return "host";}return "invitator";})();
window.ws = new WebSocketManager(config.wsURL, role);

let wrtcs = {};
window.wrtcs = wrtcs;

switch(mode){
  case "host":
    //let passwd = prompt("パスワードを設定してください(未入力で省略できます)");
    let passwd = "hogehuga";
    ws.send({
      to: {
        role: "wsserver"
      },
      subject: "login",
      body: passwd
    });
    break;
  default:
    let wrtc = new WebRTCSender({
      iceServers: [{
        urls: "stun:stun.l.google.com:19302"
      }]
    });
    wrtc.remote = {
      role: "host"
    };
    wrtc.genSDPOffer().then(a=>{
      ws.send({
        subject: "SDPOffer",
        body: a
      });
    });
    wrtcs["0"] = wrtc;
    webRTCEventsSubscriber(wrtc);
    break;
}
ws.msgCallback = async (message)=>{
  switch(message.msg.subject){
    case "SDPOffer":
      let wrtc = new WebRTCReciever({
        iceServers: [{
          urls: "stun:stun.l.google.com:19302"
        }]
      });
      wrtcs[message.msg.from.id] = wrtc;
      wrtc.remote = message.msg.from;
      webRTCEventsSubscriber(wrtc);
      let r = await wrtc.regRemoteDescription(message.msg.body);
      message.reply({
        subject: "SDPAnswer",
        body: r
      });
      break;
    case "SDPAnswer":
      wrtcs[message.msg.from.id] = wrtcs["0"];
      delete wrtcs["0"]
      wrtcs[message.msg.from.id].regRemoteDescription(message.msg.body);
      break;
    case "ICECandidate":
      wrtcs[message.msg.from.id].regRemoteCandidate(message.msg.body);
      break;
  }
};
document.getElementById("cam").addEventListener("click",async ()=>{
  let localStream;
  try {
    localStream = await navigator.mediaDevices.getDisplayMedia({audio: false, video: true});
    localStream.getTracks().forEach(track => wrtc.connection.addTrack(track, localStream));
    document.getElementById("view").srcObject = localStream;
  } catch {
    localStream = undefined;
  }
});

function webRTCEventsSubscriber(wrtc){
  wrtc.iceCandidateCallback = (candidate)=>{
    ws.send({
      to: wrtc.remote,
      subject: "ICECandidate",
      body: candidate
    });
  }
  wrtc.connection.addEventListener("track", e => {
    document.getElementById("view").srcObject =e.streams[0];
    console.log("trackR");
  });
}