# Notify me plugin
This plugin will notify you when your name is found in a message with a specific prefix

## Usage
Include the JavaScript and CSS files:

```HTML
<script type="text/javascript" src="path_to_plugins/gs-notifyme/candy.js"></script>
<link rel="stylesheet" type="text/css" href="path_to_plugins/gs-notifyme/candy.css" />
```

Call its `init()` method after Candy has been initialized:

```JavaScript
Candy.init('/http-bind/');

CandyShop.NotifyMe.init();

Candy.Core.connect();
````

## Configuration options
nameIdentifier - String - The identifier to look for in a string. Defaults to '@'
playSound - Boolean - Whether to play an audio notification when it's found. Defaults to true
highlightInRoom - Boolean - Whether to put the css highlight class around the found text. Defaults to true

## Example configurations
```JavaScript
// Just highlight the name when it's found with '+' in front
CandyShop.NotifyMe.init({
    nameIdentifier: '+',
    playSound: false
});

// Just play an audio notification when it's found with '-' in front
CandyShop.NotifyMe.init({
    nameIdentifier: '-',
    highlightInRoom: false
});
```