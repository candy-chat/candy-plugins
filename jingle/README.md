# Jingle 
Candy plugin for one-to-one video calls between users, based on WebRTC and XEP-0166: Jingle.

After instalation a new `Video call` option will appear in drop-down context list, provided your browser has WebRTC support

## Installing

Copy jingle folder into your candy chat folder

Include the following lines into header section of your index.html ::

```HTML

<link rel="stylesheet" type="text/css" href="jingle/candy.css" />

<script type="text/javascript" src="jingle/strophe.jingle.js"></script>
<script type="text/javascript" src="jingle/strophe.jingle.session.js"></script>
<script type="text/javascript" src="jingle/strophe.jingle.sdp.js"></script>
<script type="text/javascript" src="jingle/strophe.jingle.adapter.js"></script>

<script type="text/javascript" src="jingle/candy.js"></script>

```

To enable the plugin, add it's `init` method to your bootstrap (usually index.html), after you `init` Candy, but before `Candy.connect()`,include  STUN/TURN servers of your choice ::

```JavaScript

			var helper_srv_config = {
		    	iceServers: [ 
                        	 {url: "stun:stun.services.mozilla.com"},
		        	 {url: "stun:stun.l.google.com:19302"}
			   	]
			};

			CandyShop.Jingle.init(helper_srv_config);

```
## Debug
To get complete trace of WebRTC session all you need is minor update inside ` jingle/candy.js ` plugin. 
Replace normal peerconnection with traceable one, as shown below:

```JavaScript

        	//RTCPeerconnection = RTC.peerconnection;
		RTCPeerconnection = TraceablePeerConnection;

```
Next, you can open Javascript console (F12 in Mozilla/Chrome) and issue console.log(JSON.stringify(Candy.Core.getConnection().jingle.getLog()));
to see consolidated logs of all active jingle/WebRTC sessions. 
