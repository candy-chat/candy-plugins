/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors
 *   - Jonatan Männchen <jonatan.maennchen@amiadogroup.com>
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: InlineVideos
 * If a user posts a URL to a video, that video gets rendered directly
 * inside of Candy.
 */
CandyShop.InlineVideos = (function(self, Candy, $) {
	/** Function: init
	 * Initializes the inline-videos plugin with the default settings.
	 *
	 * Parameters:
	 *   (Object) options - An options packet to apply to this plugin
	 */
	self.init = function(options) {
		// add a listener to these events
		$(Candy).on('candy:view.message.before-show', self.handleBeforeShow);
	};
	
	/** Function: handleBeforeShow
	 * Handles the beforeShow event of a message.
	 *
	 * Parameters:
	 *   (String) message - the message to process
	 *
	 * Returns:
	 *   (String)
	 */
	self.handleBeforeShow = function(e, args) {
		args.message = args.message.replace(/\>(https?:\/\/w{0,3}\.?youtube.com\/watch\?v=([^\s^&]*)([^\s]*))\<\/a\>/i, '>$1<br /><iframe width="300" height="200" src="//www.youtube.com/embed/$2" frameborder="0" allowfullscreen></iframe></a><br />');
	};

	return self;
}(CandyShop.InlineVideos || {}, Candy, jQuery));
