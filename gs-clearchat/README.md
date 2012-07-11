# Clear chat plugin
This plugin will allow the user to type '/clear' or click the clear icon to clear the currently active room

## Usage
Include the JavaScript and CSS files:

```HTML
<script type="text/javascript" src="path_to_plugins/gs-clearchat/candy.js"></script>
<link rel="stylesheet" type="text/css" href="path_to_plugins/gs-clearchat/candy.css" />
```

Call its `init()` method after Candy has been initialized:

```JavaScript
Candy.init('/http-bind/');

CandyShop.ClearChat.init();

Candy.Core.connect();
```

## Configuration options
showInToolbar - Boolean - Whether to add the 'Clear Chat' button to the toolbar. Defaults to true

## Example configurations
```JavaScript
// Don't show the button in the toolbar
CandyShop.ClearChat.init({
    showInToolbar: false
});
```