var PieSocket;(()=>{"use strict";var t={d:(e,n)=>{for(var s in n)t.o(n,s)&&!t.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:n[s]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};(()=>{t.r(e),t.d(e,{default:()=>S});class n{constructor(t){this.options=t}log(...t){this.options.consoleLogs&&console.log(...t)}warn(...t){this.options.consoleLogs&&console.warn(...t)}error(...t){this.options.consoleLogs&&console.error(...t)}}const s=JSON.parse('{"Mt":[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"string","name":"transaction_hash","type":"string"}],"name":"Confirmed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"string","name":"payload","type":"string"}],"name":"Sent","type":"event"},{"inputs":[{"internalType":"string","name":"payload","type":"string"}],"name":"send","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"transaction_hash","type":"string"}],"name":"confirm","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]}');class i{constructor(t){this.options=t,this.apiKey=this.options.apiKey,this.channel=this.options.channelId,this.blockchainTestMode=this.options.blockchainTestMode,this.blockchainGasFee=this.options.blockchainGasFee,this.blockchainTestMode?this.contractAddress="0x2321c321828946153a845e69ee168f413e85c90d":this.contractAddress="0x2a840CA40E082DbF24610B62a978900BfCaB23D3"}async init(){const t=new Web3(window.ethereum),e=await ethereum.request({method:"eth_requestAccounts"});this.account=e[0],this.contract=new t.eth.Contract(s.Mt,this.contractAddress)}checkWeb3(){return"undefined"==typeof Web3?(console.log("Web3.js is not installed!"),!1):void 0!==window.ethereum||(console.log("MetaMask is not installed!"),!1)}async confirm(t){return new Promise((async(e,n)=>{if(this.checkWeb3()){this.contract||await this.init();const s=this.contract.methods.confirm(t).send({from:this.account,gas:this.blockchainGasFee});s.on("transactionHash",e),s.on("error",(t=>{n(t)}))}}))}async send(t){return new Promise((async(e,n)=>{if(this.checkWeb3()){this.contract||await this.init();const s=await this.getTransactionHash(t),i=this.contract.methods.send(s.payload).send({from:this.account,gas:this.blockchainGasFee});i.on("transactionHash",(t=>{e({hash:t,id:s.transaction_id})})),i.on("error",(t=>{n(t)}))}else"undefined"==typeof Web3?n("Please install Web3.js"):n("Please install MetaMask")}))}async getTransactionHash(t){return new Promise(((e,n)=>{const s=new FormData;s.append("apiKey",this.apiKey),s.append("channel",this.channel),s.append("message",JSON.stringify(t)),s.append("contract",this.contractAddress);const i=new XMLHttpRequest;i.addEventListener("readystatechange",(function(){if(4===this.readyState)try{const t=JSON.parse(this.responseText);t.errors&&(console.error(`PieSocket Error: ${JSON.stringify(t.errors)}`),n()),t.success?e(t.success):n("Unknown error")}catch(t){console.error("Could not connect to Blockchain Messaging API, try later"),n()}})),i.addEventListener("error",(()=>{console.error("Blockchain Messaging API seems unreachable at the moment, try later"),n()})),i.open("POST","https://www.piesocket.com/api/blockchain/payloadHash"),i.setRequestHeader("Accept","application/json"),i.send(s)}))}}const o=WebSocket||{};class r{constructor(t,e,n=!0){this.events={},this.listeners={},this.members=[],this.portal=null,this.uuid=null,this.onSocketConnected=()=>{},this.onSocketError=()=>{},n&&this.init(t,e)}init(t,e){this.endpoint=t,this.identity=e,this.connection=this.connect(),this.shouldReconnect=!1,this.logger=new n(e)}getMemberByUUID(t){let e=null;for(let n=0;n<this.members.length;n++)if(this.members[n].uuid==t){e=this.members[n];break}return e}getCurrentMember(){return this.getMemberByUUID(this.uuid)}connect(){const t=new o(this.endpoint);return t.onmessage=this.onMessage.bind(this),t.onopen=this.onOpen.bind(this),t.onerror=this.onError.bind(this),t.onclose=this.onClose.bind(this),this.identity.onSocketConnected&&(this.onSocketConnected=this.identity.onSocketConnected),this.identity.onSocketError&&(this.onSocketError=this.identity.onSocketError),t}on(t,e){this.events[t]=e}listen(t,e){this.listeners[t]=e}send(t){return this.connection.send(t)}async publish(t,e,n){return n&&n.blockchain?await this.sendOnBlockchain(t,e,n):this.connection.send(JSON.stringify({event:t,data:e,meta:n}))}async sendOnBlockchain(t,e,n){this.blockchain||(this.blockchain=new i(this.identity));try{const s=await this.blockchain.send(e);return this.events["blockchain-hash"]&&this.events["blockchain-hash"].bind(this)({event:t,data:e,meta:n,transactionHash:s.hash}),this.connection.send(JSON.stringify({event:t,data:e,meta:{...n,transaction_id:s.id,transaction_hash:s.hash}}))}catch(t){this.events["blockchain-error"]&&this.events["blockchain-error"].bind(this)(t)}}async confirmOnBlockchain(t,e){this.blockchain||(this.blockchain=new i(this.identity));try{const n=await this.blockchain.confirm(e);return this.events["blockchain-hash"]&&this.events["blockchain-hash"].bind(this)({event:t,confirmationHash:e,transactionHash:n}),this.connection.send(JSON.stringify({event:t,data:e,meta:{transaction_id:1,transaction_hash:n}}))}catch(t){this.events["blockchain-error"]&&this.events["blockchain-error"].bind(this)(t)}}onMessage(t){this.logger.log("Channel message:",t);try{const e=JSON.parse(t.data);e.error&&e.error.length&&(this.shouldReconnect=!1),e.event&&(this.handleMemberHandshake(e),this.listeners[e.event]&&this.listeners[e.event].bind(this)(e.data,e.meta),this.listeners["*"]&&this.listeners["*"].bind(this)(e.event,e.data,e.meta))}catch(t){console.error(t)}this.events.message&&this.events.message.bind(this)(t)}handleMemberHandshake(t){"system:member_list"==t.event||"system:member_joined"==t.event?this.members=t.data.members:"system:member_left"==t.event?(this.members=t.data.members,this.portal&&this.portal.removeParticipant(t.data.member.uuid)):"system:portal_broadcaster"==t.event&&t.data.from!=this.uuid?this.portal.requestOfferFromPeer(t.data):"system:portal_watcher"==t.event&&t.data.from!=this.uuid||"system:video_request"==t.event&&t.data.from!=this.uuid?this.portal.shareVideo(t.data):"system:portal_candidate"==t.event&&t.data.to==this.uuid?this.portal.addIceCandidate(t.data):"system:video_offer"==t.event&&t.data.to==this.uuid?this.portal.createAnswer(t.data):"system:video_answer"==t.event&&t.data.to==this.uuid&&this.portal.handleAnswer(t.data)}onOpen(t){this.logger.log("Channel connected:",t),this.shouldReconnect=!0,this.onSocketConnected(t)}onError(t){this.logger.error("Channel error:",t),this.connection.close(),this.onSocketError(t),this.events.error&&this.events.error.bind(this)(t)}onClose(t){this.logger.warn("Channel closed:",t),this.reconnect(),this.events.close&&this.events.close.bind(this)(t)}reconnect(){this.shouldReconnect&&(this.logger.log("Reconnecting"),this.connection=this.connect())}}const a=RTCIceCandidate||{},c=RTCPeerConnection||{},h=RTCSessionDescription||{},d={shouldBroadcast:!0,portal:!0,video:!1,audio:!0};class l{constructor(t,e){this.channel=t,this.logger=new n(e),this.identity={...d,...e},this.localStream=null,this.peerConnectionConfig={iceServers:[{urls:"stun:stun.stunprotocol.org:3478"},{urls:"stun:stun.l.google.com:19302"}]},this.constraints={video:e.video,audio:e.audio},this.participants=[],this.isNegotiating=[],this.logger.log("Initializing video room"),this.init()}init(){if(this.constraints.video||this.constraints.audio)return"undefined"!=typeof navigator&&navigator.mediaDevices.getUserMedia?(navigator.mediaDevices.getUserMedia(this.constraints).then(this.getUserMediaSuccess.bind(this)).catch(this.errorHandler.bind(this)),!0):(this.logger.error("Your browser does not support getUserMedia API"),!1);this.requestPeerVideo()}shareVideo(t,e=!0){if(!this.identity.shouldBroadcast&&e&&!t.isBroadcasting)return void console.log("Refusing to call, denied broadcast request");console.log("peer connection",c);const n=new c(this.peerConnectionConfig);n.onicecandidate=e=>{null!=e.candidate&&this.channel.publish("system:portal_candidate",{from:this.channel.uuid,to:t.from,ice:e.candidate})},n.ontrack=e=>{"video"==e.track.kind&&(this.participants[t.from].streams=e.streams,"function"==typeof this.identity.onParticipantJoined&&this.identity.onParticipantJoined(t.from,e.streams[0]))},n.onsignalingstatechange=e=>{this.isNegotiating[t.from]="stable"!=n.signalingState},this.localStream&&this.localStream.getTracks().forEach((t=>{n.addTrack(t,this.localStream)})),this.isNegotiating[t.from]=!1,n.onnegotiationneeded=async()=>{await this.sendVideoOffer(t,n,e)},this.participants[t.from]={rtc:n}}async sendVideoOffer(t,e,n){if(!n)return;if(this.isNegotiating[t.from])return void console.log("SKIP nested negotiations");this.isNegotiating[t.from]=!0;const s=await e.createOffer();await e.setLocalDescription(s),console.log("Making offer"),this.channel.publish("system:video_offer",{from:this.channel.uuid,to:t.from,sdp:e.localDescription})}removeParticipant(t){delete this.participants[t],"function"==typeof this.identity.onParticipantLeft&&this.identity.onParticipantLeft(t)}addIceCandidate(t){this.participants[t.from].rtc.addIceCandidate(new a(t.ice))}createAnswer(t){return new Promise((async(e,n)=>{if(this.participants[t.from]&&this.participants[t.from].rtc||(console.log("Starting call in createAnswer"),this.shareVideo(t,!1)),await this.participants[t.from].rtc.setRemoteDescription(new h(t.sdp)),"offer"==t.sdp.type){this.logger.log("Got an offer from "+t.from,t);const n=await this.participants[t.from].rtc.createAnswer();await this.participants[t.from].rtc.setLocalDescription(n),this.channel.publish("system:video_answer",{from:this.channel.uuid,to:t.from,sdp:this.participants[t.from].rtc.localDescription}),e()}else this.logger.log("Got an asnwer from "+t.from),e()}))}handleAnswer(t){this.participants[t.from].rtc.setRemoteDescription(new h(t.sdp))}getUserMediaSuccess(t){this.localStream=t,"function"==typeof this.identity.onLocalVideo&&this.identity.onLocalVideo(t,this),this.requestPeerVideo()}requestPeerVideo(){var t="system:portal_broadcaster";this.identity.shouldBroadcast||(t="system:portal_watcher"),this.channel.publish(t,{from:this.channel.uuid,isBroadcasting:this.identity.shouldBroadcast})}requestOfferFromPeer(){this.channel.publish("system:video_request",{from:this.channel.uuid,isBroadcasting:this.identity.shouldBroadcast})}errorHandler(t){this.logger.error("Portal error",t)}}class u{constructor(t=null,e="InvalidAuthException"){this.message=t||"Auth endpoint did not return a valid JWT Token, please see: https://www.piesocket.com/docs/3.0/authentication",this.name=e}}const p={version:3,clusterId:"demo",clusterDomain:null,apiKey:"oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQj4AwARJuAgtjhzKxVEjQU6IdCjwm",consoleLogs:!1,notifySelf:0,jwt:null,presence:0,authEndpoint:"/broadcasting/auth",authHeaders:{},forceAuth:!1,userId:null,blockchainTestMode:!1,blockchainGasFee:41e3};var m,g=new Uint8Array(16);function f(){if(!m&&!(m="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return m(g)}const y=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;for(var b=[],v=0;v<256;++v)b.push((v+256).toString(16).substr(1));const w=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=(b[t[e+0]]+b[t[e+1]]+b[t[e+2]]+b[t[e+3]]+"-"+b[t[e+4]]+b[t[e+5]]+"-"+b[t[e+6]]+b[t[e+7]]+"-"+b[t[e+8]]+b[t[e+9]]+"-"+b[t[e+10]]+b[t[e+11]]+b[t[e+12]]+b[t[e+13]]+b[t[e+14]]+b[t[e+15]]).toLowerCase();if(!function(t){return"string"==typeof t&&y.test(t)}(n))throw TypeError("Stringified UUID is invalid");return n},k=function(t,e,n){var s=(t=t||{}).random||(t.rng||f)();if(s[6]=15&s[6]|64,s[8]=63&s[8]|128,e){n=n||0;for(var i=0;i<16;++i)e[n+i]=s[i];return e}return w(s)},S=class{constructor(t){t=t||{},this.options={...p,...t},this.connections={},this.logger=new n(this.options)}async subscribe(t,e={}){return new Promise((async(n,s)=>{(e.video||e.audio||e.portal)&&(this.options.notifySelf=!0);const i=k(),o=await this.getEndpoint(t,i);if(this.connections[t])this.logger.log("Returning existing channel",t),n(this.connections[t]);else{this.logger.log("Creating new channel",t);const a=new r(o,{channelId:t,onSocketConnected:()=>{a.uuid=i,(e.video||e.audio||e.portal)&&(a.portal=new l(a,{...this.options,...e})),this.connections[t]=a,n(a)},onSocketError:()=>{s("Failed to make websocket connection")},...this.options});"undefined"==typeof WebSocket&&(a.uuid=i,this.connections[t]=a,n(a))}}))}unsubscribe(t){return!!this.connections[t]&&(this.connections[t].shouldReconnect=!1,this.connections[t].connection.close(),delete this.connections[t],!0)}getConnections(){return this.connections}async getAuthToken(t){return new Promise(((e,n)=>{const s=new FormData;s.append("channel_name",t);const i=new XMLHttpRequest;i.withCredentials=!0,i.addEventListener("readystatechange",(function(){if(4===this.readyState)try{const t=JSON.parse(this.responseText);e(t)}catch(t){n(new u("Could not fetch auth token","AuthEndpointResponseError"))}})),i.addEventListener("error",(()=>{n(new u("Could not fetch auth token","AuthEndpointError"))})),i.open("POST",this.options.authEndpoint),Object.keys(this.options.authHeaders).forEach((t=>{i.setRequestHeader(t,this.options.authHeaders[t])})),i.send(s)}))}isGuarded(t){return!!this.options.forceAuth||(""+t).startsWith("private-")}async getEndpoint(t,e){let n=`wss://${null==this.options.clusterDomain?`${this.options.clusterId}.piesocket.com`:this.options.clusterDomain}/v${this.options.version}/${t}?api_key=${this.options.apiKey}&notify_self=${this.options.notifySelf}&source=jssdk&v=5.0.8&presence=${this.options.presence}`;if(this.options.jwt)n=n+"&jwt="+this.options.jwt;else if(this.isGuarded(t)){const e=await this.getAuthToken(t);e.auth&&(n=n+"&jwt="+e.auth)}return this.options.userId&&(n=n+"&user="+this.options.userId),n=n+"&uuid="+e,n}}})(),PieSocket=e})();