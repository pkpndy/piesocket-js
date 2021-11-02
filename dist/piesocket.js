var PieSocket;(()=>{var e={653:(e,t,n)=>{"use strict";n.d(t,{default:()=>h});class s{constructor(e){this.options=e}log(...e){this.options.consoleLogs&&console.log(...e)}warn(...e){this.options.consoleLogs&&console.warn(...e)}error(...e){this.options.consoleLogs&&console.error(...e)}}const i=JSON.parse('{"Mt":[{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"string","name":"transaction_hash","type":"string"}],"name":"Confirmed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"sender","type":"address"},{"indexed":true,"internalType":"string","name":"payload","type":"string"}],"name":"Sent","type":"event"},{"inputs":[{"internalType":"string","name":"payload","type":"string"}],"name":"send","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"transaction_hash","type":"string"}],"name":"confirm","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]}');class o{constructor(e,t){this.apiKey=e,this.channel=t,this.checkWeb3()&&this.init()}async init(){const e=new Web3(window.ethereum),t=await ethereum.request({method:"eth_requestAccounts"});this.account=t[0],this.contract=new e.eth.Contract(i.Mt,"0x2321c321828946153a845e69ee168f413e85c90d")}checkWeb3(){return"undefined"==typeof Web3?(console.error("Web.js is not installed!"),!1):void 0!==window.ethereum||(console.error("MetaMask is not installed!"),!1)}async confirm(e){return new Promise((async(t,n)=>{if(this.checkWeb3()){const s=this.contract.methods.confirm(e).send({from:this.account});s.on("transactionHash",t),s.on("error",(e=>{n(e)}))}}))}async send(e){return new Promise((async(t,n)=>{if(this.checkWeb3()){const s=await this.getTransactionHash(e),i=this.contract.methods.send(s.payload).send({from:this.account});i.on("transactionHash",(e=>{t({hash:e,id:s.transaction_id})})),i.on("error",(e=>{n(e)}))}else"undefined"==typeof Web3?n("Please install Web3.js"):n("Please install MetaMask")}))}async getTransactionHash(e){return new Promise(((t,n)=>{var s=new FormData;s.append("apiKey",this.apiKey),s.append("channel",this.channel),s.append("message",JSON.stringify(e));var i=new XMLHttpRequest;i.addEventListener("readystatechange",(function(){if(4===this.readyState)try{const e=JSON.parse(this.responseText);e.errors&&(console.error(`PieSocket Error: ${JSON.stringify(e.errors)}`),n()),e.success?t(e.success):n("Unknown error")}catch(e){console.error("Could not connect to Blockchain Messaging API, try later"),n()}})),i.addEventListener("error",(()=>{console.error("Blockchain Messaging API seems unreachable at the moment, try later"),n()})),i.open("POST","https://www.piesocket.com/api/blockchain/payloadHash"),i.setRequestHeader("Accept","application/json"),i.send(s)}))}}class r{constructor(e,t,n=!0){this.events={},this.listeners={},n&&this.init(e,t)}init(e,t){this.endpoint=e,this.identity=t,this.connection=this.connect(),this.shouldReconnect=!1,this.logger=new s(t)}connect(){var e=new WebSocket(this.endpoint);return e.onmessage=this.onMessage.bind(this),e.onopen=this.onOpen.bind(this),e.onerror=this.onError.bind(this),e.onclose=this.onClose.bind(this),e}on(e,t){this.events[e]=t}listen(e,t){this.listeners[e]=t}send(e){return this.connection.send(e)}publish(e,t,n){return n&&n.blockchain?this.sendOnBlockchain(e,t,n):this.connection.send(JSON.stringify({event:e,data:t,meta:n}))}sendOnBlockchain(e,t,n){this.blockchain||(this.blockchain=new o(this.identity.apiKey,this.identity.channelId)),this.blockchain.send(t).then((s=>(this.events["blockchain-hash"]&&this.events["blockchain-hash"].bind(this)({event:e,data:t,meta:n,transactionHash:s.hash}),this.connection.send(JSON.stringify({event:e,data:t,meta:{...n,transaction_id:s.id,transaction_hash:s.hash}}))))).catch((e=>{this.events["blockchain-error"]&&this.events["blockchain-error"].bind(this)(e)}))}confirmOnBlockchain(e,t){this.blockchain||(this.blockchain=new o(identity.apiKey,identity.channelId)),this.blockchain.confirm(t).then((n=>(this.events["blockchain-hash"]&&this.events["blockchain-hash"].bind(this)({event:e,confirmationHash:t,transactionHash:n}),this.connection.send(JSON.stringify({event:e,data:t,meta:{transaction_hash:n}}))))).catch((e=>{this.events["blockchain-error"]&&this.events["blockchain-error"].bind(this)(e)}))}onMessage(e){this.logger.log("Channel message:",e);try{var t=JSON.parse(e.data);t.error&&t.error.length&&(this.shouldReconnect=!1),t.event&&(this.listeners[t.event]&&this.listeners[t.event].bind(this)(t.data,t.meta),this.listeners["*"]&&this.listeners["*"].bind(this)(t.event,t.data,t.meta))}catch(e){console.error(e)}this.events.message&&this.events.message.bind(this)(e)}onOpen(e){this.logger.log("Channel connected:",e),this.shouldReconnect=!0,this.events.open&&this.events.open.bind(this)(e)}onError(e){this.logger.error("Channel error:",e),this.connection.close(),this.events.error&&this.events.error.bind(this)(e)}onClose(e){this.logger.warn("Channel closed:",e),this.reconnect(),this.events.close&&this.events.close.bind(this)(e)}reconnect(){this.shouldReconnect&&(this.logger.log("Reconnecting"),this.connect())}}class a{constructor(e,t="InvalidAuthException"){this.message="Auth endpoint did not return a valid JWT Token, please see: https://www.piesocket.com/docs/3.0/authentication",this.name=t}}const c={version:3,clusterId:"demo",apiKey:"oCdCMcMPQpbvNjUIzqtvF1d2X2okWpDQj4AwARJuAgtjhzKxVEjQU6IdCjwm",consoleLogs:!1,notifySelf:0,jwt:null,presence:0,authEndpoint:"/broadcasting/auth",authHeaders:{},forceAuth:!1,userId:null};class h{constructor(e){e=e||{},this.options={...c,...e},this.connections={},this.logger=new s(this.options)}subscribe(e){var t=this.getEndpoint(e);if(this.connections[e])return this.logger.log("Returning existing channel",e),this.connections[e];this.logger.log("Creating new channel",e);var n=new r(null,null,!1);return t.then((t=>{n.init(t,{channelId:e,...this.options})})),this.connections[e]=n,n}unsubscribe(e){return!!this.connections[e]&&(this.connections[e].shouldReconnect=!1,this.connections[e].connection.close(),delete this.connections[e],!0)}getConnections(){return this.connections}async getAuthToken(e){return new Promise(((t,n)=>{var s=new FormData;s.append("channel_name",e);var i=new XMLHttpRequest;i.withCredentials=!0,i.addEventListener("readystatechange",(function(){if(4===this.readyState)try{const e=JSON.parse(this.responseText);t(e)}catch(e){n(new a("Could not fetch auth token","AuthEndpointResponseError"))}})),i.addEventListener("error",(()=>{n(new a("Could not fetch auth token","AuthEndpointError"))})),i.open("POST",this.options.authEndpoint),Object.keys(this.options.authHeaders).forEach((e=>{i.setRequestHeader(e,this.options.authHeaders[e])})),i.send(s)}))}isGuarded(e){return!!this.options.forceAuth||(""+e).startsWith("private-")}async getEndpoint(e){let t=`wss://${this.options.clusterId}.piesocket.com/v${this.options.version}/${e}?api_key=${this.options.apiKey}&notify_self=${this.options.notifySelf}&source=jssdk&v=1.3.4&presence=${this.options.presence}`;if(this.options.jwt)t=t+"&jwt="+this.options.jwt;else if(this.isGuarded(e)){const n=await this.getAuthToken(e);n.auth&&(t=t+"&jwt="+n.auth)}return this.options.userId&&(t=t+"&user="+this.options.userId),t}}},138:(e,t,n)=>{e.exports=n(653).default}},t={};function n(s){var i=t[s];if(void 0!==i)return i.exports;var o=t[s]={exports:{}};return e[s](o,o.exports,n),o.exports}n.d=(e,t)=>{for(var s in t)n.o(t,s)&&!n.o(e,s)&&Object.defineProperty(e,s,{enumerable:!0,get:t[s]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t);var s=n(138);PieSocket=s})();