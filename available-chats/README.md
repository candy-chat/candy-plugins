# Available Chats Plugin
A plugin to join public rooms and start private chats with roster entries.

## Usage
Include the JavaScript and CSS files:

```HTML
<script type="text/javascript" src="candyshop/available-chats/candy.js"></script>
```

To enable the Available Chats Plugin, just add one of the ´init´ methods to your bootstrap (uses conference.your.domain as MUC domain):

```JavaScript
CandyShop.AvailableChats.init();
```

To set the MUC domain use
```JavaScript
CandyShop.AvailableChats.init({ domain: "chats.capulet.net" });
```

To set a MUC subdomain use (end with a dot ("."); will use the connection's domain as base.
```JavaScript
CandyShop.AvailableChats.init({ domain: "chats." });
```

## Screenshot
![Screenshot](https://github.com/amiadogroup/candy-plugins/raw/master/available-rooms/screenshot.png)
