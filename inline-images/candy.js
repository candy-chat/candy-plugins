/*
 * inline-images
 * @version 1.0
 * @author Manuel Alabor (manuel@alabor.me)
 *
 * Display an image itself instead of its URL.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.InlineImages = (function(self, Candy, $) {
	
	var _fileExtensions = ['png','jpg','gif'];
	
	/** Function: init
	 * Initializes the inline-images plugin.
	 */
	self.init = function() {
		Candy.View.Event.Message.beforeShow = handleBeforeShow;
	};
	
	/** Function: handleBeforeShow
	 * Handles the beforeShow event of a message.
	 *
	 * Paramteres:
	 *   (String) message - the message to process
	 *
	 * Returns:
	 *   (String)
	 */
	var handleBeforeShow = function(message) {
		return message;
	};
	

	return self;
}(CandyShop.InlineImages || {}, Candy, jQuery));
