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

/** Class: CandyShop.StickySubject
 * This plugin makes it so the room subject is always visible
 */
CandyShop.StickySubject = (function(self, Candy, $) {
	/** Function: init
	 * Initialize the StickySubject plugin
	 */
	self.init = function() {
		// Listen for a subject change in the room
		$(Candy.View.Pane).on('candy:view.room.afterSubjectChange', function(e, data) {
			// get the current message pane and create the text
			var messagePane = $(Candy.View.Pane.Room.getPane(Candy.View.getCurrent().roomJid)),
				subjectText = $.i18n._('roomSubject') + ' ' + Candy.Util.Parser.linkify(data.subject);

			// if we don't have the subject container yet, add it
			// else just update the content
			if ($('.subject-container').length == 0) {
				messagePane.prepend('<div class="subject-container">' + subjectText + '</div>');
				messagePane.find('.message-pane-wrapper').addClass('has-subject');
			} else {
				messagePane.find('.subject-container').html(subjectText);
			}
		});
	};

	return self;
}(CandyShop.StickySubject || {}, Candy, jQuery));