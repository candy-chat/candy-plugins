/*
 * inline-images
 * @version 1.0
 * @author Manuel Alabor (manuel@alabor.me)
 *
 * Display an image itself instead of its URL.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.InlineImages = (function(self, Candy, $) {
	
	var _fileExtensions = ['png','jpe?g','gif']
		,_originalLinkify = Candy.Util.Parser.linkify
		,_imageRegex;
	
	/** Function: init
	 * Initializes the inline-images plugin.
	 */
	self.init = function() {
		Candy.View.Event.Message.beforeShow = handleBeforeShow;
		Candy.Util.Parser.linkify = linkify;
		_imageRegex =  buildImageRegex(_fileExtensions);
	};
	
	/** Function: buildImageRegex
	 * Creates a RegExp to match URL's to an image inside a string.
	 * Pass an array with file extensions you want to identify as image.
	 *
	 * Paramters:
	 *   (String Array) forFileExtensions - image file extensions (png, jpg, ...)
	 *
	 * Returns:
	 *   (RegExp)
	 */
	var buildImageRegex = function(forFileExtensions) {
		var pattern = "\\b(https?:\\/\\/[-A-Z0-9+&@#\\/%?=~_|!:,.;]*[-A-Z0-9+&@#\\/%=~_|].";
		pattern += buildExtensionPattern(forFileExtensions);
		pattern += ')';
		
		return new RegExp(pattern,'ig');
	}
	
	/** Function: buildExtensionPattern
	 * Takes an array with file extensions and creates an alternative regex
	 * pattern out of it.
	 * Example: ['jpg','png','gif'] => '(jpg|png|gif)'
	 *
	 * Paramters:
	 *   (String array) extensions - File extensions
	 * 
	 * Returns:
	 *  (String)
	 */
	var buildExtensionPattern = function(extensions) {
		var extensions = '(';
		for(var i = 0, l = _fileExtensions.length; i < l; i++) {
			extensions += _fileExtensions[i];
			if(i < l-1) extensions += '|';
		}
		extensions += ')';
		
		return extensions;
	}
	
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
		// http://farm6.static.flickr.com/5202/5355145448_93f2233180_t.jpg
		var processed = message.replace(_imageRegex,'<img src="$1" />');
		
		return processed;
	};
	
	/** Function: linkify
	 * Is used to overwrite the original Candy.Util.Parser.linkify.
	 * This implementation prevents the parsing of URL's by the Candy core.
	 * inline-images handles this on itself by handleBeforeShow.
	 *
	 * Parameters:
	 *   (String) text - text to process
	 *
	 * Returns:
	 *   (String)
	 */
	var linkify = function(text) {
		return text;
	}
	

	return self;
}(CandyShop.InlineImages || {}, Candy, jQuery));
