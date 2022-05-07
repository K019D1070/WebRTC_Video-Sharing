export class WebRTC{
  connection;
  wRTCManagerChannel;
  negotiator;

  constructor(config = {}, negotiator){
    this.negotiator = negotiator;

    this.connection = new RTCPeerConnection(config);
    this.connection.addEventListener("icecandidate", e => {
      if(e.candidate){
        this.negotiator.send(e.candidate, {subject: "ICECandidate"});
      }
    });
    this.connection.addEventListener("datachannel", e => {
      this.wRTCManagerChannel = e.channel;
      this.wRTCManagerChannel.addEventListener("message", e => {
        this.recievedMessages.push(e.data);
      });
      console.log("datachannnel fired");
    });
    this.connection.addEventListener("connectionstatechange", e => {
      console.log(this.connection.connectionState);
    });
    this.connection.addEventListener("negotiationneeded", async e => {
      console.log("WebRTC nego");
    });
  }
  async regRemoteDescription(sdp){
    await this.connection.setRemoteDescription(sdp);
  }
  async regRemoteCandidate(ice){
    this.connection.addIceCandidate(ice);
  }
  createDataChannel(){
    this.wRTCManagerChannel = this.connection.createDataChannel("channel");
    this.wRTCManagerChannel.addEventListener("message", async e => {
      let d = JSON.parse(e.data);
      switch(d.body.type){
        case "answer":
          this.connection.setRemoteDescription(d.body);
          break;
        case "offer":
          this.channel.send(await this.connection.setRemoteDescription(d.body));
          break;
      }
    });
  }
}

export class WebRTCSender extends WebRTC{
  offerReadyCallback = (answer)=>{console.log(answer);};
  constructor(config, negotiator){
    super(config, negotiator);
    this.createDataChannel();
    this.connection.addEventListener("negotiationneeded", async e => {
      let offerSDP = await this.connection.createOffer();
      this.connection.setLocalDescription(offerSDP);
      this.negotiator.send(offerSDP, {subject: "SDPOffer"});
    });
  }
}

export class WebRTCReciever extends WebRTC{
  async regRemoteDescription(SDPOffer){
    super.regRemoteDescription(SDPOffer);
    let answerSDP = await this.connection.createAnswer();
    this.connection.setLocalDescription(answerSDP);
    this.negotiator.send(answerSDP, {subject: "SDPAnswer"});
  }
}