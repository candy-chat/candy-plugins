# Text color plugin
This plugin will allow the user to select colors for the text

## Usage
Include the JavaScript file:

```HTML
<script type="text/javascript" src="path_to_plugins/colors/candy.js"></script>
```

Call its `init()` method after Candy has been initialized:

```JavaScript
Candy.init('/http-bind/');
CandyShop.Colors.init();
Candy.Core.connect();
```

## Configuration options
colors - Integer - The number of colors to allow. Defaults to 8

## Example configurations
```JavaScript
// Add only 4 colors
CandyShop.Colors.init({
    colors: 4
});
