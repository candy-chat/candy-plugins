# Clear chat plugin
This plugin will allow the user to type '/clear' or click the clear icon to clear the currently active room

### Usage
    <script type="text/javascript" src="path_to_plugins/gs-clearchat/candy.js"></script>
    <link rel="stylesheet" type="text/css" href="path_to_plugins/gs-clearchat/candy.css" />

    ...

    CandyShop.ClearChat.init();

### Configuration options
showInToolbar - Boolean - Whether to add the 'Clear Chat' button to the toolbar. Defaults to true

### Example configurations

    // Don't show it in the toolbar
    CandyShop.ClearChat.init({
        showInToolbar: false
    });