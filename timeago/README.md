# Timeago plugin

This plugin replaces the exact time/date with 'fuzzy timestamps' (e.g. 'less than a minute ago', '2 minutes ago', 'about an hour ago'). The timestamps update dynamically. All the heavy lifting is done by Ryan McGeary's excellent jQuery Timeago plugin (http://timeago.yarp.com/).

## Usage
Include the JavaScript and CSS files:

```HTML
<script type="text/javascript" src="path_to_plugins/timeago/jquery.timeago.js"></script>
<script type="text/javascript" src="path_to_plugins/timeago/candy.js"></script>
<link rel="stylesheet" type="text/css" href="path_to_plugins/timeago/candy.css" />
```

Call its `init()` method after Candy has been initialized:

```JavaScript
Candy.init('/http-bind/');

CandyShop.Timeago.init();

>>>>>>> fixes/dev
Candy.Core.connect();
```
