# Join Plugin
Candy Plugin for Video Conferencing based on XEP-0166: Jingle.

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
