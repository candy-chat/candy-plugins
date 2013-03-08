# Reply Highlighting

To better support conversations in high-activity rooms, this plugin adds support for @username replies. Any message that contains @yourusername will be highlighted, as will any outgoing messages you send @otherusers. This makes it easier to see messages related to conversations that you're involved in.

The plugin provides two other minor quality of life improvements for conversations. Mousing over a user's name in the message pane will highlight all that user's messages. Clicking on a user's name in the message pane will add @thatusersname to your chat input field, making it easy to address a message to them.

It is perhaps a little bit beyond the purview of a conversation-oriented plugin, but there are a few tools included in this package to make it easier for moderators to be heard in the midst of large conversations. Any user with the moderator role will have their a very light purple background on their chat messages. Any message from a moderator like "QUESTION: " or "TOPIC: " will have a darker background and a border. Any word preceding the colon is fine - but it must be an all caps word followed by a colon. This makes it easier for moderators to mark transition points in a conversation and guide participants in a new direction by visually getting their attention.

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
