# Inline Videos Plugin
If a user posts a URL to a youtube video, that video gets rendered directly inside of Candy.

## Usage
Include the JavaScript file:

```HTML
<script type="text/javascript" src="path_to_plugins/inline-videos/candy.js"></script>
```

Call its `init()` method after Candy has been initialized:

```JavaScript
Candy.init('/http-bind/');

CandyShop.InlineVideos.init();

Candy.Core.connect();
```