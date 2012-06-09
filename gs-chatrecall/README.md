# Clear chat plugin
This plugin will allow the user to type '/clear' or click the clear icon to clear the currently active room

### Usage
    <script type="text/javascript" src="path_to_plugins/gs-chatrecall/candy.js"></script>

    ...

    CandyShop.ChatRecall.init();

### Configuration options
messagesToKeep - Integer - The number of messages to store in history. Defaults to 10

### Example configurations

    // Store 25 messages for the user to scroll through
    CandyShop.ChatRecall.init({
        messagesToKeep: 25
    });