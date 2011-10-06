/*
 * inline-images
 * @version 1.0
 * @author Manuel Alabor (manuel@alabor.me)
 *
 * Display an image itself instead of its URL.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.InlineImages = (function(self, Candy, $) {
	
	var _fileExtensions = ['png','jpg','gif']
		,_originalLinkify = Candy.Util.Parser.linkify;
	
	/** Function: init
	 * Initializes the inline-images plugin.
	 */
	self.init = function() {
		Candy.View.Event.Message.beforeShow = handleBeforeShow;
		Candy.Util.Parser.linkify = linkify;
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
		var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		// http://farm6.static.flickr.com/5202/5355145448_93f2233180_t.jpg
		
		return message.replace(exp,'<img src="$1" />');
	};
	
	/** Function: linkify
	 * Is used to overwrite the original Candy.Util.Parser.linkify.
	 *
	 * Parameters:
	 *   (String) text - text to process
	 *
	 * Returns:
	 *   (String)
	 */
	var linkify = function(text) {
		return _originalLinkify(text);
	}
	

	return self;
}(CandyShop.InlineImages || {}, Candy, jQuery));
