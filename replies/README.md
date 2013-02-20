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

## Known Issues

If people have subset usernames, like "drew" and "drewww", there will be some confusion for the user with the shorter name. I thought about some workarounds (look for '@username?' where ? is [ ,.!-]) but it seems like those will cause more false negatives than we're likely to see false positives right now in normal naming situations. If it's a problem in your community, let me know if you have an idea for a good approach!