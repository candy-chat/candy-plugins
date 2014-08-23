# Search Roster

A plugin for Candy Chat to allow you to search the roster when using the StaticLobby plugin.

## Dependencies

Assumes you're using the StaticLobby plugin.

## Usage
Include the JavaScript file:
```HTML
<script type="text/javascript" src="candyshop/searchroster/searchroster.js"></script>
```

To enable this plugin, add its `init` method after you `init` Candy:
```JavaScript
CandyShop.SearchRoster.init();
Candy.connect();
```
