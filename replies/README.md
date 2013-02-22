# Reply Highlighting

To better support conversations in high-activity rooms, this plugin highlights any message that contains "@yourusername"

## Usage

```HTML
<script type="text/javascript" src="candyshop/replies/candy.js"></script>
<link rel="stylesheet" type="text/css" href="candyshop/replies/candy.css" />
```

```JavaScript
CandyShop.Replies.init();
```

The default behavior for this plugin is to override the onClick behavior for names in the chat transcript. Instead of bringing up a private message window, it will instead copy that user's name into your input field for easy @reply-ing. If you would prefer that it not do this, you can initialize it like so:

```JavaScipt
CandyShop.Replies.init({clickToReply:false});
```` 
