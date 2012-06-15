# Name completion plugin
This plugin will complete the names of users in the room when a specified key is pressed.

## Usage
Include the JavaScript and CSS files:

```HTML
<script type="text/javascript" src="path_to_plugins/gs-namecomplete/candy.js"></script>
<link rel="stylesheet" type="text/css" href="path_to_plugins/gs-namecomplete/candy.css" />
```

Call its `init()` method after Candy has been initialized:

```JavaScript
Candy.init('/http-bind/');

CandyShop.NameComplete.init();

Candy.Core.connect();
```

## Configuration options
nameIdentifier - String - The identifier to look for in a string. Defaults to '@'
completeKeyCode - Integer - The key code of the key to use. Defaults to 9 (tab)

## Example configurations
```JavaScript
// complete the name when the user types +nick and hits the right arrow
// +troymcc -> +troymccabe
CandyShop.NameComplete.init({
    nameIdentifier: '+',
    completeKeyCode: '39'
});

// complete the name when the user types -nick and hits the up arrow
// +troymcc ^ +troymccabe
CandyShop.NameComplete.init({
    nameIdentifier: '-',
    completeKeyCode: '38'
});
```