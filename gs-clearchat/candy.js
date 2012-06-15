/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Troy McCabe <troy.mccabe@geeksquad.com>
 *
 * Copyright:
 *   (c) 2012 Geek Squad. All rights reserved.
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: CandyShop.ClearChat
 * Clears the chat window if either clicked or '/clear' is typed
 */
CandyShop.ClearChat = (function(self, Candy, $) {
	/** Object: _options
	 * Options:
	 *   (Boolean) showInToolbar - Whether to show the clear chat button in the toolbar
	 */
	var _options = {
		showInToolbar: true
	};

	/** Function: init
	 * Initialize the ClearChat plugin
	 * Bind event and if specified, add the icon to be clickable
	 *
	 * Parameters:
	 *   (Object) options - An options packet to apply to this plugin
	 */
    self.init = function(options) {
	    // apply the supplied options to the defaults specified
	    $.extend(true, _options, options);

        // add the translations
        self.applyTranslations();

	    // if it's specified to show the control,
	    // add it to the toolbar
	    if (_options.showInToolbar) {
	        var html = '<li id="clearchat-control" data-tooltip="' + $.i18n._('candyshopClearchat') + '"></li>';
	        $('#emoticons-icon').after(html);
	        $('#clearchat-control').click(function() {
	            self.clearCurrentTab();
	        });
	    }

	    // Attach to the beforeSend event
	    $(Candy.View.Pane).bind('candy:view.message.beforeSend', function(e, args) {
		    // (strip colors)
		    // if it matches '/clear', clear the chat window and don't send anything
            if (args.message.replace(/\|c:\d+\|/, '').toLowerCase() == '/clear') {
                self.clearCurrentTab();
	            args.message = '';
            }
        });
    };

	/** Function: clearCurrentTab
	 * Clear the current tab's content
	 */
    self.clearCurrentTab = function() {
        try {
	        // find the visible room, and empty the panel
            $('.room-pane').filter(':visible').find('.message-pane').empty();
        } catch (e) {
        }
    };

	/** Function: applyTranslations
	 * Apply translations to this plugin
	 */
    self.applyTranslations = function() {
        Candy.View.Translation.en.candyshopClearchat = 'Clear chat';
    };

    return self;
}(CandyShop.ClearChat || {}, Candy, jQuery));