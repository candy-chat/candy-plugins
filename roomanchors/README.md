# Room Anchors

A plugin for Candy Chat to create and listen to anchors in the URL for rooms.

## Usage
Include the JavaScript file:
```HTML
<script type="text/javascript" src="candyshop/roomanchors/roomanchors.js"></script>
```

To enable this plugin, add its `init` method after you `init` Candy:
```JavaScript
CandyShop.RoomAnchors.init();
Candy.connect();
```

To use this plugin, simply add the name of a room to the end of the URL, like `mydomain.com/chat#room-name` and it will join that room if it exists or create it if it doesn't.  When you change rooms, the name of the room you switch to will autopopulate into the address bar as well.
