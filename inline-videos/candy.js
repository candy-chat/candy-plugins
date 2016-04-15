/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors
 *   - Jonatan Männchen <jonatan.maennchen@amiadogroup.com>
 *   - Sudrien <_+github@sudrien.net>
 */

/* global Candy, jQuery */

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
	self.init = function() {
		// add a listener to these events
		$(Candy).on('candy:view.message.before-show', self.handleBeforeShow);
		self.appender = "";
	};

	/** Function: timeToSeconds
	 * converts youtube's t= parameter value to seconds
	 *
	 * Parameters:
	 *   (String) timeString - either seconds or 00h00m00s format
	 *
	 * Returns:
	 *   (Integer) - seconds
	 */
	var timeToSeconds = function(timeString) {
		var ret = 0;
		if(timeString == null) {
			return ret;
		}
		var times = timeString[1].match(/((\d+)h)?((\d+)m)?((\d+)s)?(\d+)?/);
		if(times[7]) {
			ret += parseInt(times[7]); //seconds only
		}
		else {
			ret += times[2] ? parseInt(times[2]) * 60 * 60 : 0; //hours
			ret += times[4] ? parseInt(times[4]) * 60 : 0; //minutes
			ret += times[6] ? parseInt(times[6]) : 0; //seconds
		}
		return ret;
	};	

	/** Function: linkReplace
	 * The logic to our link replacement, which uses browser link parsing
	 *
	 * Parameters:
	 *   (String) match - full match, requirement for call & return value in case of failure
	 *   (String) href - url to parse
	 *
	 * Returns:
	 *   (String) - The original link, or possibly a cleaned up link
	 *
	 * Side Effect:
	 *   (String) - self.appender - Can't return the embeded movie by normal means, because
	 *              order gets messed up. So put it elswhere so we can append later.
	 */
	var linkReplace = function(match, href) {
		var a = document.createElement('a');
		a.href = href;

		switch(a.hostname) { // a link with an href
		case "youtube.com":
		case "www.youtube.com":
		case "youtu.be":
			if(a.pathname == "/watch") {
				var v = a.search.match(/v=([a-zA-Z0-9_-]{11})/);
			}
			else {
				var v = a.pathname.match(/^\/([a-zA-Z0-9_-]{11})/);
			}
			var start = timeToSeconds(a.search.match(/t=([hms0-9]+)/));
			var list = a.search.match(/list=([^&]+)/);
			var main_url = "https://youtu.be/" + (v ? v[1] : "");
			var embed_url = "https://www.youtube.com/embed/" + (v ? v[1] : "");

			if(start || list) {
				main_url += "?";
				embed_url += "?";
			}
			if(start > 0) {
				main_url += "t=" + start;
				embed_url += "start=" + start;
			}
			if(start && list) {
				main_url += "&";
				embed_url += "&";
			}
			if(list) {
				main_url += "list=" + list[1];
				embed_url += "list=" + list[1];
			}
			var aspect = "16by9";
			break;
		case "vimeo.com":
		case "player.vimeo.com":
			if(a.pathname.match(/video/)) {
				var v = a.pathname.match(/\/video\/(\d+)/);
			}
			else {
				var v = a.pathname.match(/^\/(\d+)/);
			}
			var main_url = "https://vimeo.com/" + (v ? v[1] : "");
			var embed_url = "https://player.vimeo.com/video/" + (v ? v[1] : "");
			var aspect = "16by9";
			break;
		case "dailymotion.com":
		case "www.dailymotion.com":
			if(a.pathname.match(/video\/x/)) {
				var v = a.pathname.match(/\/video\/(x[\da-z]+)(_|$)/);
			}
			var main_url = "https://www.dailymotion.com/video/" + (v ? v[1] : "");
			var embed_url = "https://www.dailymotion.com/embed/video/" + (v ? v[1] : "");
			var aspect = "16by9";
			break;
		case "vine.co":
		case "www.vine.co":
			if(a.pathname.match(/v\//)) {
				var v = a.pathname.match(/v\/([\da-z]+)(\/|$)/i);
			}
			var main_url = "https://vine.co/v/" + (v ? v[1] : "");
			var embed_url = "https://vine.co/v/" + (v ? v[1] : "") + "/embed/simple";
			var aspect = "1by1";
			break;
		}
		
		if (v) {
			self.appender += "<div class='inline-video inline-video-" + aspect + "'><iframe src='" + embed_url + "' allowfullscreen='true'></iframe></div> ";
			return "<a href='" + main_url + "'>" + main_url + "</a>";
			}
		return match;
		}
	
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
		self.appender = "";

		if(args.xhtmlMessage) {
			args.xhtmlMessage = args.xhtmlMessage.replace(/\<a href="(.+?)".+?\<\/a\>/g, linkReplace);
			if(self.appender != "") {
				args.xhtmlMessage += "<br>";
				args.xhtmlMessage += self.appender;
			}
		}

		self.appender = "";

		args.message = args.message.replace(/\<a href="(.+?)".+?\<\/a\>/g, linkReplace);
		if(self.appender != "") {
			args.message += "<br>";
			args.message += self.appender;
		}
	};

	return self;
}(CandyShop.InlineVideos || {}, Candy, jQuery));


