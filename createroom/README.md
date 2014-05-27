# Create Room UI

A plugin for Candy Chat to enable a clickable UI for creating new chatrooms.

![Create Room UI](screenshot.png)

## Usage
Include the JavaScript and CSS files:
```HTML
<script type="text/javascript" src="candyshop/createroom/createroom.js"></script>
<link rel="stylesheet" type="text/css" href="candyshop/createroom/createroom.css" />
```

To enable this Left Tabs plugin, add its `init` method _before_ you `init` Candy:
```JavaScript
CandyShop.CreateRoom.init();
Candy.init('/http-bind', { ...
```
