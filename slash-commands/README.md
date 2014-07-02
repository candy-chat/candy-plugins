# Slash Commands Plugin
A plugin to provide a command-line interface to Candy actions.

## Examples
To use any of the following, just type them into the chat input text area. Note that any commands which are room-specific (`/topic`, `/kick`, etc) will work on/for the current room only.

* `/join room [password]` - Joins the MUC room "room" with an optional password
* `/clear` - Clears the scrollback in the current room

## Todo
* `/kick username` - Ejects the user "username" from the current room. Must be a MUC admin for this to work
* `/invite username[@domain]` - Invites the user "username" to the current room. If the optional domain is not provided, it is assumed to be the same domain as the current user
* `/topic This will be the new topic` - Sets the topic for the current room to "This will be the new topic"

## Usage
Include the JavaScript file::

```HTML
<script type="text/javascript" src="candyshop/slash-commands/slash-commands.js"></script>
```

To enable the Slash Commands Plugin, just add one of the ´init´ methods to your bootstrap:

```JavaScript
CandyShop.SlashCommands.init();
```
