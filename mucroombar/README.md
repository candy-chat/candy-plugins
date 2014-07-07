# MUC Room Bar

A plugin for Candy Chat to enable a room bar that displays the room topic and allows moderators to edit it with a click.

With LeftTabs plugin:
![MUC Room Bar with LeftTabs Plugin](screenshot-left.png)

Without LeftTabs plugin:
![MUC Room Bar without LeftTabs Plugin](screenshot-normal.png)

## Usage
Include the JavaScript and CSS files:
```HTML
<script type="text/javascript" src="candyshop/mucroombar/mucroombar.js"></script>
<link rel="stylesheet" type="text/css" href="candyshop/mucroombar/mucroombar.css" />
```

To enable this plugin, add its `init` method after you `init` Candy:
```JavaScript
CandyShop.RoomBar.init();
```
