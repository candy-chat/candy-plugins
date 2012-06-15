# Inline images plugin
If a user posts a URL to an image, that image gets rendered directly inside of Candy.

![Inline Images](/candy-chat/candy-plugins/raw/master/inline-images/screenshot.png)

## Usage
Include the JavaScript and CSS files:

```HTML
<script type="text/javascript" src="path_to_plugins/inlineimages/candy.js"></script>
<link rel="stylesheet" type="text/css" href="path_to_plugins/inlineimages/candy.css" />
```

Call its `init()` method after Candy has been initialized:

```JavaScript
Candy.init('/http-bind/');

CandyShop.InlineImages.init();

Candy.Core.connect();
```

## Configuration options
fileExtensions - Array - File extensions to turn into images
maxImageSize - Integer - The max height or width for an image

## Example configurations
```JavaScript
// Only use png and gif, and let them be 150px
CandyShop.InlineImages.init({
    fileExtensions: ['png', 'gif'],
    maxImageSize: 150
});
```