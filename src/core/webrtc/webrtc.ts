const wsUrl = import.meta.env.APP_WEBRTC_WS_URL;

enum WebRTCState {
  NO_CONNECT_SIGNALING_CHANNEL,
  CONNECTED_SIGNALING_CHANNEL
}

export default class WebRTCClient {
  private _videoStream: MediaStream | null = null;
  private _audioStream: MediaStream | null = null;
  private readonly _configuration: RTCConfiguration;
  private _signalingChannel: WebSocket | null = null;
  private _reconnectTimer?: any = null;
  private _heartbeatInterval = 20000;
  private _heartbeatTimer?: any = null;
  private _handleVideoTarck?:(name:string,stream:MediaStream)=>void;
  private _handleAudioTrack?:(name:string,stream:MediaStream)=>void;
  private _handleCloseTrack?: (name:string,admin:boolean)=>void;
  private _localConnection?: RTCPeerConnection;
  private _peers: Map<string,RTCPeerConnection> = new Map();
  private _chatChannels: Map<string,RTCDataChannel> = new Map(); 

  public user = "";
  public isAudioMuted = false;
  public isVideoMuted = false;
  public onchatmessage?:(name:string,message:string)=>void;
  public status = WebRTCState.NO_CONNECT_SIGNALING_CHANNEL;
  
  constructor() {
    this._configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
  }


  public getLocalVideoStream():MediaStream | null{
    return this._videoStream;
  }


  /**
   * 设置连接peer媒体流处理函数
   * @param ontrack 连接Peer数据流回调函数 0/视频流 1/音频流 2/关闭远程媒体流 3/聊天室销毁
   */
  public setListenerTrack(ontrack:(name:string,stream:MediaStream|null,type:number)=>void){
    this._handleVideoTarck = (name:string,stream:MediaStream)=>{
      ontrack(name,stream,0);
    };
    this._handleAudioTrack = (name:string,stream:MediaStream)=>{
      ontrack(name,stream,1);
    };
    this._handleCloseTrack = (name:string,admin:boolean)=>{
      admin?ontrack(name,null,3): ontrack(name,null,2);
    }
  }


  /**
   * 设置WebRTC捕获的画布元素
   * @param canvas WebRTC捕获画布元素Dom
   */
  public captureCanvasVideo(canvas: HTMLCanvasElement){
    this._videoStream = canvas.captureStream();
  }
  /**
   * 捕获音频流
   * @param deviceId 设备ID
   */
  public captureMicAudio(deviceId:W3C.ConstrainString | undefined){
      // 获取音频流
    navigator.mediaDevices.getUserMedia({ audio: { deviceId }  })
    .then((stream)=>this._audioStream = stream);
  }
  /**
   * 连接信令服务器
   */
  public connect(onSuccess?:()=>void){
    if(this.status == WebRTCState.CONNECTED_SIGNALING_CHANNEL){
      console.log("Aleary connected signaling channel!");
      onSuccess?.();
      return;
    }
    this._signalingChannel = new WebSocket(wsUrl);
    this._signalingChannel.onopen = () => {
      console.log('WebSocket connection established.');
      this.status = WebRTCState.CONNECTED_SIGNALING_CHANNEL;
      this.ping();
      onSuccess?.();
    };
    this._signalingChannel.onclose = (event) => {
      console.log('WebSocket connection closed:', event);
      console.log('Reconnecting...');
      this.status = WebRTCState.NO_CONNECT_SIGNALING_CHANNEL;
      // 重新连接，每隔1秒尝试一次
      this._reconnectTimer = setTimeout(() => {
          this.connect(onSuccess);
      }, 1000);
    };
  }

  /**
   * 创建房间
   * @param onSuccess 创建成功回调函数 room:房间号，user:用户ID
   * @param onWaked 成员唤醒回调函数
   */

  public createRoom(onSuccess?:(room:string)=>void,onWaked?:()=>void): void{
    if(this.status == WebRTCState.NO_CONNECT_SIGNALING_CHANNEL || !this._signalingChannel){
      return console.log("No connected signaling channel!")
    }
    this._signalingChannel.send(JSON.stringify({type:"create"}));
    this._signalingChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const {type, room} = data;
      if (type === "created") {
        return onSuccess?.(room);
      }
      if (type === "wake"){
        return onWaked?.();
      }
      if (type === "pong"){
        return this.ping();
      }
    }
  }
  /**
   * 发送聊天消息
   * @param message 消息字符串
   */
  public chat(message:string):void{
    console.log("channels",this._chatChannels)
    for (let channel of this._chatChannels.values()) {
      channel.send(message);
    }
  }
  public ping(){
    clearTimeout(this._heartbeatTimer);
    this._heartbeatTimer = null;
    this._heartbeatTimer = setTimeout(()=>{
      this._signalingChannel?.send(JSON.stringify({type:"ping"}));
    },this._heartbeatInterval);
  }

  public close(){
    this._signalingChannel?.close();
    clearTimeout(this._reconnectTimer);
    this._reconnectTimer = null;
  }

  public visit(room: string,onSuccess?:()=>void,onError?:(message:string)=>void){
    if(this.status == WebRTCState.NO_CONNECT_SIGNALING_CHANNEL || !this._signalingChannel){
      return console.log("No connected signaling channel!");
    }
    this._signalingChannel.send(JSON.stringify({type:"visit",room}));
    this._signalingChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.type==="error"){
        return onError?.(data.message);
      }
      if(data.type==="visited"){
        return onSuccess?.();
      }
    }
  }

  
  
  public joinRoom(room: string,onError?:(message:string)=>void): void {
    if(this.status == WebRTCState.NO_CONNECT_SIGNALING_CHANNEL || !this._signalingChannel){
      return console.log("No connected signaling channel!");
    }
    this._signalingChannel.send(JSON.stringify({type:"join",room}));
    this._signalingChannel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if(data.type==="error"){
        return onError?.(data.message);
      }
      this._handleSignalingMessages(data);
    }
  }

  
    public toggleAudioMute(): void {
      if (this._audioStream) {
        this._audioStream.getAudioTracks().forEach(track => {
          track.enabled = !this.isAudioMuted;
          this.isAudioMuted = !this.isAudioMuted;
        });
      }
    }
  
    public toggleVideoMute(): void {
      if (this._videoStream) {
        this._videoStream.getVideoTracks().forEach(track => {
          track.enabled = !this.isVideoMuted;
          this.isVideoMuted = !this.isVideoMuted;
        });
      }
    }
    private  _handleSignalingMessages(message: any): void {
      switch (message.type) {
        case 'joined':
          this._handleJoinMessage(message);
          break;
        case 'offer':
          this._handleOfferMessage(message);
          break;
        case 'answer':
          this._handleAnswerMessage(message);
          break;
        case 'candidate':
          this._handleCandidateMessage(message);
          break;
        case 'left':
          this._handleLeaveMessage(message);
          break;
        case 'pong':
          this.ping();
          break;
        default:
          break;
      }
    }

    private async _handleLeaveMessage(message: any): Promise<void>{
      const {user,admin} = message;
      const peer = this._peers.get(user);
      if (!peer) return;
      console.log(`user: ${user} / admin: ${admin} left !`);
      peer.close();
      peer.onicecandidate = null;
      peer.ontrack = null;
      this._peers.delete(user);
      this._handleCloseTrack?.(user,admin);
    }

    private async _handleJoinMessage(message: any): Promise<void>{
      const newUser = message.newUser;
      if(message.first){
        //第一次加入获取用户ID并与房间所有用户创建连接
        this.user = newUser;
        message.users.forEach(async (user:string)=>{
          await this._initPeerConnection(user,false);
        });
      }else if(this.user !== newUser){
        //新增用户处理
        await this._initPeerConnection(newUser,true);
      }
    }
    
    private async _handleOfferMessage(message: any): Promise<void> {
      const name = message.user;
      const peer = this._peers.get(name);
      if (!peer) return console.log(`${name} peer not found!`);
      // 6.接收远程SDP描述
      const offer = new RTCSessionDescription(message.offer);
      // 7.设置远程SDP
      await peer.setRemoteDescription(offer);
      // 8.创建答复
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      this._signalingChannel?.send(JSON.stringify({ type: 'answer',answer,sender:name }));
    }
    
    private async _handleAnswerMessage(message: any): Promise<void> {
      const name = message.user;
      const peer = this._peers.get(name);
      if (!peer) return;
      // 10.收到答复
      const answer = new RTCSessionDescription(message.answer);
      await peer.setRemoteDescription(answer);
    }

    private async _handleCandidateMessage(message: any): Promise<void> {
      const peer = this._peers.get(message.user);
      if (!peer) return;
      const candidate = new RTCIceCandidate(message.candidate);
      await peer.addIceCandidate(candidate);
    }
    /**
     * 创建数据传输通道
     * @param peer 对等连接对象
     * @param name 用户名
     */
    private _initChatChannel(peer:RTCPeerConnection,name:string){
      const sendChannel:RTCDataChannel = peer.createDataChannel("chat");
      sendChannel.onopen = (event) => {
        console.log(`${name} chat channel open =>`,event)
        this._chatChannels.set(name,sendChannel);
      };
      sendChannel.onclose = (event) => {
        console.log(`${name} chat channel close =>`,event)
        this._chatChannels.delete(name);
      };
      sendChannel.onerror = (error) => console.log(`chat channel error => `,error);
      peer.ondatachannel = (event) => this._receiveChannelCallback(name,event);
    }


    private async _initPeerConnection(name:string,createOffer:boolean): Promise<void> {
      // 1.创建Peer连接对象
      const peer =   new RTCPeerConnection(this._configuration);
      this._initChatChannel(peer,name);
      // 2.添加媒体流到连接
      this._audioStream?.getTracks().forEach(track=>{
        peer?.addTrack(track, this._audioStream!);
      })
      this._videoStream?.getTracks().forEach(track => {
        peer?.addTrack(track, this._videoStream!);
      });
      // 2.1.音视频通信
      peer.ontrack = event => {
        // 将远程视频和音频流添加到相应的元素
        if (event.track.kind === 'video') {
          this._handleVideoTarck?.(name,event.streams[0]);
        } else if (event.track.kind === 'audio') {
          this._handleAudioTrack?.(name,event.streams[0])
        }else{
          console.log("No identify track kind =>",event);
        }
      };
      // 2.2.ICE候选连接
      peer.onicecandidate = event => {
        if (event.candidate) {
          this._signalingChannel?.send(JSON.stringify({ type: 'candidate', candidate: event.candidate, from:name }));
        }
      };
      if(createOffer){
        // 3.创建SDP（Session Description Protocol）
        const offer = await peer.createOffer();
        // 4.设置本地SDP
        await peer.setLocalDescription(offer);
        // 5.交换SDP描述,将本地SDP发送给连接方
        this._signalingChannel?.send(JSON.stringify({ type: 'offer', offer, sender:name}));
      }
      console.log("ondatachannel",peer.ondatachannel)
      this._peers.set(name,peer);
    }

    private _receiveChannelCallback(name:string,event:RTCDataChannelEvent){
      const receiveChannel = event.channel;
      receiveChannel.onmessage = (event) =>
        this.onchatmessage?.(name,event.data);
      receiveChannel.onopen = ()=>
        this._handleReceiveChannelStatusChange(receiveChannel);
      receiveChannel.onclose = ()=>
        this._handleReceiveChannelStatusChange(receiveChannel);
     
    }

    private _handleReceiveChannelStatusChange(receiveChannel:RTCDataChannel) {
      if (receiveChannel) {
        console.log(
          `Receive channel's status has changed to ${receiveChannel.readyState}`,
        );
      }
    }
  }

  