# Drag and Drop

A plugin for Candy Chat to allow drag and drop file uploads.

Requires jquery-fileupload/basic.

## Usage

Include the JavaScript file:

```HTML
<script type="text/javascript" src="candyshop/dragdrop/dragdrop.js"></script>
```

To enable this plugin, add its `init` method after you `init` Candy, but before `Candy.connect()`:

```JavaScript
CandyShop.DragDrop.init();
```
