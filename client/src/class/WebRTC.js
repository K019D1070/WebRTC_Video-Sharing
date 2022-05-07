export class WebRTC{
  connection;
  channel;
  channelState = {};
  candidates = [];
  recievedMessages = [];
  remote;

  iceCandidateCallback = (candidate)=>{};
  constructor(config = {}){
    this.connection = new RTCPeerConnection(config);
    this.connection.addEventListener("icecandidate", e => {
      if(e.candidate){
        this.candidates.push(e.candidate);
        this.iceCandidateCallback(e.candidate);
      }
    });
    this.connection.addEventListener("datachannel", e => {
      this.channel = e.channel;
      this.channel.addEventListener("message", e => {
        this.recievedMessages.push(e.data);
      });
      console.log("datachannnel fired");
    });
    this.connection.addEventListener("negotiationneeded", e => {
      console.log("negotiationneeded");
      if(this.connection.connectionState == "connected"){
        console.log("再接続処理");
        //
        //
        //
        //
      }
    });
    this.connection.addEventListener("connectionstatechange", e => {
      console.log(this.connection.connectionState);
    });
  }
  setIceCandidateCallback(callback){
    this.iceCandidateCallback = callback;
    this.candidates.forEach(candidate => {
      this.iceCandidateCallback(candidate);
    });
  }
  async regRemoteDescription(sdp){
    await this.connection.setRemoteDescription(sdp);
  }
  async regRemoteCandidate(ice){
    return await this.connection.addIceCandidate(ice).catch(e => {
      console.eror("Receiver addIceCandidate error", e);
    });;
  }
  createDataChannel(){
    this.channel = this.connection.createDataChannel("channel");
    this.channel.addEventListener("message", e => {
      this.recievedMessages.push(e.data);
    });
    this.channel.addEventListener("open", e => {
      this.channelState.open = true;
    });
    this.channel.addEventListener("close", e => {
      this.channelState.open = false;
    });
  }
}

export class WebRTCSender extends WebRTC{
  constructor(config){
    super(config);
    this.createDataChannel();
  }
  async genSDPOffer(){
    let offerSDP = await this.connection.createOffer();
    this.connection.setLocalDescription(offerSDP);
    return offerSDP;
  }
}

export class WebRTCReciever extends WebRTC{
  async regRemoteDescription(SDPOffer){
    super.regRemoteDescription(SDPOffer);
    let answerSDP = await this.connection.createAnswer();
    this.connection.setLocalDescription(answerSDP);
    return answerSDP;
  }
}