import { config } from "../config/config.js";
import { WebRTCSender, WebRTCReciever } from "./class/WebRTC.js";
import { WebSocketManager } from "./class/WebSocketManager.js";


let queries = new URLSearchParams(document.location.search);
let mode = queries.get("mode");
let role = (()=>{if(mode == "host"){return "host";}return "invitator";})();
window.ws = new WebSocketManager(config.wsURL, role);

let wrtcs = {};
window.wrtcs = wrtcs;
let streams = {
  desktop: null
};
window.streams = streams;

switch(mode){
  case "host":
    let videoB = document.createElement("button");
    videoB.innerText = "ビデオを有効化";
    videoB.id = "cum";
    videoB.addEventListener("click",async (e)=>{
      e.target.innerText = "共有対象を再選択";
      try {
        streams.desktop = await navigator.mediaDevices.getDisplayMedia({audio: false, video: true});
        //streams.desktop = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
        document.getElementById("view").srcObject = streams.desktop;
      } catch {
        streams.desktop = null;
      }
      Object.entries(wrtcs).forEach((wtcs)=>{
        streams.desktop.getTracks().forEach(track => {
          wtcs[1].connection.addTrack(track, streams.desktop);
        });
      });
    });
    document.getElementById("ui").insertAdjacentElement("beforeend", videoB);
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
    const transceiver = wrtc.connection.addTransceiver('video');
    transceiver.direction = "recvonly";
    wrtc.offerReadyCallback = a=>{
      ws.send({
        subject: "SDPOffer",
        body: a
      });
    };
    wrtcs["0"] = wrtc;
    webRTCEventsSubscriber(wrtc);
    break;
}
ws.msgCallback = async (message)=>{
  console.log(message.msg);
  switch(message.msg.subject){
    case "SDPOffer":
      let wrtc = new WebRTCReciever({
        iceServers: [{
          urls: "stun:stun.l.google.com:19302"
        }]
      });
      wrtcs[message.msg.from.id] = wrtc;
      wrtc.remote = message.msg.from;
      if(streams.desktop != null){
        streams.desktop.getVideoTracks().forEach(track => {
          wrtc.connection.addTrack(track, streams.desktop);
        });
      }
      webRTCEventsSubscriber(wrtc);
      let r = await wrtc.regRemoteDescription(message.msg.body);
      console.log(r);
      message.reply({
        subject: "SDPAnswer",
        body: r
      });
      break;
    case "SDPAnswer":
      wrtcs[message.msg.from.id] = wrtcs["0"];
      wrtcs[message.msg.from.id].regRemoteDescription(message.msg.body);
      delete wrtcs["0"];
      break;
    case "ICECandidate":
      wrtcs[message.msg.from.id].regRemoteCandidate(message.msg.body);
      break;
  }
};

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
    setTimeout(()=>{document.getElementById("view").play();},3000);
    console.log("trackR");
  });
}