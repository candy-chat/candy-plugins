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
	};

	
	
	/** Function: timeToSeconds
	 * converts youtube's t= parameter value to seconds
	 *
	 * Parameters:
	 *   (String) timeString - either seconds os 00h00m00s format
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
		console.info(timeString, times, ret);
		return ret;
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
		args.message = jQuery.parseHTML(args.message).map(function(a) {
			if(a.outerHTML){ //dom element of any sort
				switch(a.hostname) { // a link with an href
				case "youtube.com":
				case "www.youtube.com":
					if(a.pathname == "/watch") {
						var v = a.search.match(/v=([a-zA-Z0-9_-]{11})/);
						if(v) {
							var start = timeToSeconds(a.search.match(/t=([hms0-9]+)/));
							var list = a.search.match(/list=([^&]+)/);
							var main_url = "https://youtu.be/" + (v ? v[1] : "") + "?start=" + (start ? start : "") + "&list=" + (list ? list[1] : "");
							var embed_url = "https://www.youtube.com/embed/" + (v ? v[1] : "") + "?start=" + (start ? start[1] : "") + "&list=" + (list ? list[1] : "");
							return "<a href='" + main_url + "'>" + main_url + "<br /><iframe width='300' height='200' src='" + embed_url + "' frameborder='0' allowfullscreen></iframe></a>";
						}
						else {
							return a.outerHTML;
						}
					}
					else {
						return a.outerHTML;
					}
					break;
				case "youtu.be":
					var v = a.pathname.match(/\/([a-zA-Z0-9_-]{11})/);
					var start = timeToSeconds(a.search.match(/t=([hms0-9]+)/));
					var list = a.search.match(/list=([^&]+)/); 
					var main_url = "https://youtu.be/" + (v ? v[1] : "") + "?start=" + (start ? start : "") + "&list=" + (list ? list[1] : "");
					var embed_url = "https://www.youtube.com/embed/" + (v ? v[1] : "") + "?start=" + (start ? start[1] : "") + "&list=" + (list ? list[1] : "");
					return "<a href='" + main_url + "'>" + main_url + "<br /><iframe width='300' height='200' src='" + embed_url + "' frameborder='0' allowfullscreen></iframe></a>";
					break;
				default:  //undefined - not a link
					return a.outerHTML;
				}
			}
			else { //this is a string that has to be wrapped in somthing
				return a.textContent;
			}
		}).join("");
	};

	return self;
}(CandyShop.InlineVideos || {}, Candy, jQuery));

