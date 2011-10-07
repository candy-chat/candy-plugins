/*
 * inline-images
 * @version 1.0
 * @author Manuel Alabor (manuel@alabor.me)
 *
 * Display an image itself instead of its URL.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.InlineImages = (function(self, Candy, $) {
	
	var _fileExtensions = ['png','jpg','jpeg','gif']
		,_originalLinkify = Candy.Util.Parser.linkify
		,_urlRegex = new RegExp("\\b(https?:\\/\\/[-A-Z0-9+&@#\\/%?=~_|!:,.;]*[-A-Z0-9+&@#\\/%=~_|])",'ig');
	
	/** Function: init
	 * Initializes the inline-images plugin.
	 */
	self.init = function() {
		Candy.View.Event.Message.beforeShow = handleBeforeShow;
		Candy.Util.Parser.linkify = linkify;  // overwrite with own function
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
		var processed = message.replace(_urlRegex, replaceCallback);
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
	
	/** Function: replaceCallback
	 * This callback handles matches from the URL regex.
	 * If the callback detects an image URL, it returns the HTML code to
	 * display an image. If it is just a common URL, a link-tag gets returned.
	 *
	 * Paramters:
	 *   (String) match - matched URL
	 *
	 * Returns:
	 *   (String)
	 */
	var replaceCallback = function(match) {
		var result = match;

		var dotPosition = match.lastIndexOf(".");
		if(dotPosition > -1) {
			if(_fileExtensions.indexOf(match.substr(dotPosition+1)) != -1) {
				result = buildImageSource(match);
			} else {
				result = buildLinkSource(match);
			}
		}
		
		return result;
	}
	
	/** Function: buildImageSource
	 * Returns HTML source to show a URL as an image.
	 *
	 * Parameters:
	 *   (String) url - image url
	 * 
	 * Returns:
	 *   (String)
	 */
	var buildImageSource = function(url) {
		return '<a href="' + url + '" target="_blank" class="inlineimages-link"><img src="' + url + '" /></a>';
	}
	
	/** Function: buildLinkSource
	 * Returns HTML source to show a URL as a link.
	 *
	 * Parameters:
	 *   (String) url - url
	 * 
	 * Returns:
	 *   (String)
	 */
	var buildLinkSource = function(url) {
		return '<a href="' + url + '" target="_blank">' + url + '</a>';
	}

	return self;
}(CandyShop.InlineImages || {}, Candy, jQuery));
