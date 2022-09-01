import { WebRTCSender, WebRTCReciever } from "./class/WebRTC.js";
import { WebSocketManager } from "./class/WebSocketManager.js";


let queries = new URLSearchParams(document.location.search);
let mode = queries.get("mode");
let role = (()=>{if(mode == "host"){return "host";}return "invitator";})();
let ws = new WebSocketManager("wss://6607.io:8443");
ws.config.from.role = role;
ws.config.to.role = ((role)=>{if(role == "host"){return "invitator"}return "host";})(role);
window.ws = ws;

let wrtcs = {};
window.wrtcs = wrtcs;
let streams = {
  desktop: null
};
window.streams = streams;

document.getElementById("renegotiation").addEventListener("click",renego);

switch(mode){
  case "host":
    let videoB = document.createElement("button");
    let fpsI = document.createElement("input");
    let fpsArea = document.createElement("div");
    fpsI.value = 1;
    fpsI.type = "number";
    fpsArea.setAttribute("class", "fps");
    videoB.innerText = "ビデオを有効化";
    videoB.id = "cum";
    videoB.addEventListener("click",async (e)=>{
      e.target.innerText = "共有対象を再選択";
      try {
        streams.desktop = await navigator.mediaDevices.getDisplayMedia({video: {
          frameRate: {
            ideal: fpsI.value
          }
        }});
        //streams.desktop = await navigator.mediaDevices.getUserMedia({audio: false, video: true});
        document.getElementById("view").srcObject = streams.desktop;
      } catch {
        streams.desktop = null;
      }
      renego();
    });
    /*
    fpsI.addEventListener("keydown", (e)=>{
      if(e.key == "Enter" && streams.desktop != undefined){
        streams.desktop.getVideoTracks().forEach((track)=>{
          console.log(e.target.value);
          let constraints = {video: {
            frameRate: {
              ideal: e.target.value
            }
          }}
          track.applyConstraints(constraints);
        });
        Object.entries(wrtcs).forEach((wtcs)=>{
          wtcs[1].negotiation();
        });
      }
    })
    */
    document.getElementById("ui").insertAdjacentElement("beforeend", videoB);
    videoB.insertAdjacentElement("afterend", fpsArea);
    fpsArea.insertAdjacentElement("afterbegin", fpsI);
    fpsI.insertAdjacentHTML("beforebegin", "共有前に設定してください<br>");
    fpsI.insertAdjacentText("afterend", "fps");
    let passwd = prompt("パスワードを設定してください(未入力で省略できます)");
    ws.firstMessage(
      passwd,
      {
        subject: "login",
        to: {role: "wsserver"},
        from: {role: "host"}
      },
    );
    break;
  default:
    let wrtc = new WebRTCSender(
      {
        iceServers: [{
          urls: "stun:stun.l.google.com:19302"
        }]
      },
      ws
    );
    const videoTransceiver = wrtc.connection.addTransceiver('video');
    videoTransceiver.direction = "recvonly";
    wrtcs["0"] = wrtc;
    webRTCEventsSubscriber(wrtc);
    break;
}
ws.msgCallback = async (message)=>{
  switch(message.subject){
    case "SDPOffer":
      let wrtc = new WebRTCReciever(
        {
          iceServers: [{
            urls: "stun:stun.l.google.com:19302"
          }]
        },
        ws
      );
      ws.config.to = message.from;
      wrtcs[message.from.id] = wrtc;
      wrtcs[message.from.id].killCallback = ()=>{
        delete wrtcs[message.from.id];
      };
      //const transceiver = wrtc.connection.addTransceiver('video');
      //const transceiver = wrtc.connection.addTransceiver(streams.desktop.getVideoTracks()[0]);
      //transceiver.direction = "sendonly";
      if(streams.desktop != null){
        streams.desktop.getVideoTracks().forEach(track => {
          wrtc.connection.addTrack(track, streams.desktop);
        });
      }
      webRTCEventsSubscriber(wrtc);
      wrtc.regRemoteDescription(message.body);
      break;
    case "SDPAnswer":
      if(wrtcs["0"] != undefined){
        wrtcs[message.from.id] = wrtcs["0"];
        wrtcs[message.from.id].killCallback = ()=>{
          delete wrtcs[message.from.id];
        };
      }
      wrtcs[message.from.id].regRemoteDescription(message.body);
      delete wrtcs["0"];
      break;
    case "ICECandidate":
      console.log(message);
      wrtcs[message.from.id].regRemoteCandidate(message.body);
      break;
  }
};

function webRTCEventsSubscriber(wrtc){
  wrtc.connection.addEventListener("track", e => {
    document.getElementById("view").srcObject =e.streams[0];
    console.log("trackR");
    console.log(e);
  });
}
function renego(){
  Object.keys(wrtcs).forEach((k)=>{
    wrtcs[k].negotiation();
  });
}