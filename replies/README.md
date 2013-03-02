# Reply Highlighting

To better support conversations in high-activity rooms, this plugin adds support for @username replies. Any message that contains @yourusername will be highlighted, as will any outgoing messages you send @otherusers. This makes it easier to see messages related to conversations that you're involved in.

The plugin also provides two other minor quality of life improvements for conversations. Mousing over a user's name in the message pane will highlight all that user's messages. Clicking on a user's name in the message pane will add @thatusersname to your chat input field, making it easy to address a message to them.

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


## Known Issues

At the moment, there is an issue with usernames longer than about 12 characters. Those usernames get truncated in the message pane, which breaks the click-to-@reply feature, and makes it difficult for users to know the full usernames of others in the room without checking the roster.

There is a fix for this issue here: 
https://github.com/drewww/candy/tree/message-metadata 

Hopefully it will be merged into the mainline master soon. In the interim, if this functionality is important to you, I recommend using my candy branch or encouraging users to use relatively concise names.
