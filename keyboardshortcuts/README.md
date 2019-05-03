# Keyboard Shortcuts

A plugin for Candy Chat to allow keyboard shortcuts for interacting with Candy.

## Usage

Include the JavaScript file:

```HTML
<script type="text/javascript" src="candyshop/keyboardshortcuts/keyboardshortcuts.js"></script>
```

To enable this plugin, add its `init` method after you `init` Candy, but before `Candy.connect()`:

```JavaScript
CandyShop.KeyboardShortcuts.init();
```

You could also pass in your own keyboard shortcuts:

```JavaScript
var options = {
  uniqueShortcutName: {
    altKey: (boolean),
    ctrlKey: (boolean),
    shiftKey: (boolean),
    keyCode: (integer)
  }
}
```

The plugin will then match the name of the `uniqueShortcutName` provided as the key to an identically named function inside itself, so you'll need to add a matching function inside the plugin itself.
