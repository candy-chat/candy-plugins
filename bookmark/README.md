# Bookmark

A plugin for Candy Chat to allow managing MUC bookmarks

## Usage

Include the JavaScript file:

```HTML
<script type="text/javascript" src="candyshop/bookmark/bookmark.js"></script>
```

To enable this plugin, add its `init` method after you `init` Candy, but before `Candy.connect()`:

```JavaScript
CandyShop.Bookmark.init();
```

When you wish to bookmark a room, simply:

```JavaScript
CandyShop.Bookmark.add('someroom@conference.example.com');
```
