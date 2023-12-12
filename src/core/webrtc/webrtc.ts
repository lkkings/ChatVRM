export default class WebRTCClient {
    private _peerConnection: RTCPeerConnection | null = null;
    private _localStream: MediaStream | null = null;
    private readonly _configuration: RTCConfiguration;
    private _signalingChannel: WebSocket | null = null;
    private _timer?: any = null;


    public isAudioMuted = false;
    public isVideoMuted = false;
  
    constructor() {
      this._configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
    }

    public setup(canvas: HTMLCanvasElement){
      this._localStream = canvas.captureStream(30);
    }

    public setupSignalingChannel(onSuccess?:(roomId:string)=>void){
       this._signalingChannel = new WebSocket(import.meta.env.APP_WEBRTC_WS_URL);
       this._signalingChannel.onopen = () => {
        console.log('WebSocket connection established.');
       };
       this._signalingChannel.onclose = (event) => {
       console.log('WebSocket connection closed:', event);
        console.log('Reconnecting...');
        // 重新连接，每隔1秒尝试一次
        this._timer = setTimeout(() => {
            this.setupSignalingChannel(onSuccess);
        }, 1000);
       };
       this._signalingChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "success") {
            onSuccess?.(message["room"]);
        }
        this._handleSignalingMessages(message);
       }

    }

    public closeSignalingChannel(){
        this._signalingChannel?.close();
        clearTimeout(this._timer);
        this._timer = null;
    }
  
    public async joinRoom(roomId: string): Promise<void> {
      try {
        this._peerConnection = new RTCPeerConnection(this._configuration);
        this._localStream?.getTracks().forEach(track => {
          this._peerConnection?.addTrack(track, this._localStream!);
        });
        this._peerConnection.onicecandidate = event => {
          if (event.candidate) {
            this._signalingChannel?.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
          }
        };
        this._peerConnection.ontrack = event => {
          const remoteVideo = document.getElementById('remoteVideo') as HTMLVideoElement;
          if (remoteVideo) remoteVideo.srcObject = event.streams[0];
        };
  
        const offer = await this._peerConnection.createOffer();
        await this._peerConnection.setLocalDescription(offer);
  
        this._signalingChannel?.send(JSON.stringify({ type: 'join', room: roomId, sdp: this._peerConnection.localDescription }));
      } catch (error) {
        console.error('Error joining room:', error);
      }
    }
  
    public async leaveRoom(): Promise<void> {
      if (this._peerConnection) {
        this._peerConnection.close();
        this._peerConnection = null;
      }
      if (this._localStream) {
        this._localStream.getTracks().forEach(track => track.stop());
        this._localStream = null;
      }
    }
  
    public toggleAudioMute(): void {
      if (this._localStream) {
        this._localStream.getAudioTracks().forEach(track => {
          track.enabled = !this.isAudioMuted;
          this.isAudioMuted = !this.isAudioMuted;
        });
      }
    }
  
    public toggleVideoMute(): void {
      if (this._localStream) {
        this._localStream.getVideoTracks().forEach(track => {
          track.enabled = !this.isVideoMuted;
          this.isVideoMuted = !this.isVideoMuted;
        });
      }
    }
    private _handleSignalingMessages(message: any): void {
      switch (message.type) {
        case 'offer':
        this._handleOfferMessage(message);
        break;
        case 'answer':
        this._handleAnswerMessage(message);
        break;
        case 'candidate':
        this._handleCandidateMessage(message);
        break;
        default:
        break;
    }
    }
    
    private async _handleOfferMessage(message: any): Promise<void> {
      if (!this._peerConnection) return;
      const offer = new RTCSessionDescription(message.sdp);
      await this._peerConnection.setRemoteDescription(offer);

      const answer = await this._peerConnection.createAnswer();
      await this._peerConnection.setLocalDescription(answer);

      this._signalingChannel?.send(JSON.stringify({ type: 'answer', sdp: this._peerConnection.localDescription }));
    }
    
    private async _handleAnswerMessage(message: any): Promise<void> {
      if (!this._peerConnection) return;
      const answer = new RTCSessionDescription(message.sdp);
      await this._peerConnection.setRemoteDescription(answer);
    }

    private async _handleCandidateMessage(message: any): Promise<void> {
      if (!this._peerConnection) return;
      const candidate = new RTCIceCandidate(message.candidate);
      await this._peerConnection.addIceCandidate(candidate);
    }
  }

  