/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors
 *   - David Devlin (dave.devlin@gmail.com)
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: Timeago
 * Integrates the jQuery Timeago plugin (http://timeago.yarp.com/) with Candy.
 */
CandyShop.Timeago = (function(self, Candy, $) {
	/** Function: init
	 * Initialize the Timeago plugin
	 */
	self.init = function() {
		// override the message templates to
		Candy.View.Template.Chat['adminMessage'] = '<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd class="adminmessage"><span class="label">{{sender}}</span>{{subject}} {{message}}</dd>';
		Candy.View.Template.Chat['infoMessage'] = '<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd class="infomessage">{{subject}} {{message}}</dd>';
		Candy.View.Template.Room['subject'] = '<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd class="subject"><span class="label">{{roomName}}</span>{{_roomSubject}} {{subject}}</dd>';
		Candy.View.Template.Message['item'] = '<dt><abbr title="{{time}}">{{time}}</abbr></dt><dd><span class="label"><a href="#" class="name">{{displayName}}</a></span>{{{message}}}</dd>';

		// override the utility class to provide a new localizedTime
		Candy.Util.localizedTime = function(dateTime) {
			if (dateTime === undefined) {
				return undefined;
			}

			var date = Candy.Util.iso8601toDate(dateTime);
			return date.format($.i18n._('isoDateTime'));
		};

		// listen to the afterShow event
		$(Candy.View.Pane).on('candy:view.message.afterShow', function(e, args) {
			$('abbr').timeago();
		});

		// listen for admin messages
		$(Candy.View.Pane).on('candy:view.chat.admin-message', function(e, args) {
			$('abbr').timeago();
		});

		// listen for subject changes
		$(Candy.View.Pane).on('candy:view.room.afterSubjectChange', function(e, args) {
			$('abbr').timeago();
		});

		// listen for presence changes
		$(Candy.View.Pane).on('candy:view.presence.afterChange', function(e, args) {
			$('abbr').timeago();
		});
	};

	return self;
}(CandyShop.Timeago || {}, Candy, jQuery));