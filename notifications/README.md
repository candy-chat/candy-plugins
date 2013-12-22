# Notifications
Send HTML5 Notifications when a message is received and the window is not in focus. This only works with webkit browsers.

## Usage
To enable *Notifications* you have to include its JavaScript code and stylesheet: 

```HTML
<script type="text/javascript" src="candyshop/notifications/candy.js"></script>
```

Call its `init()` method after Candy has been initialized: 

```JavaScript
Candy.init('/http-bind/');

CandyShop.Notifications.init(); 

Candy.Core.connect();
```
