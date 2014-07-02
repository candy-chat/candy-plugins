# Slash Commands Plugin
A plugin to provide a command-line interface to Candy actions.

## Examples
To use any of the following, just type them into the chat input text area. Note that any commands which are room-specific (`/topic`, `/kick`, etc) will work on/for the current room only.

* `/join room [password]` - Joins the MUC room "room" with an optional password
* `/clear` - Clears the scrollback in the current room

## Usage
Include the JavaScript file::

```HTML
<script type="text/javascript" src="candyshop/slash-commands/candy.js"></script>
```

To enable the Slash Commands Plugin, just add one of the ´init´ methods to your bootstrap:

```JavaScript
CandyShop.SlashCommands.init();
```
