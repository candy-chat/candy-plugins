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

/** Class: CandyShop.NameComplete
 * Allows for completion of a name in the roster
 */
CandyShop.NameComplete = (function(self, Candy, $) {
	/** Object: _options
	 * Options:
	 *   (String) nameIdentifier - Prefix to append to a name to look for. '@' now looks for '@NICK', '' looks for 'NICK', etc. Defaults to '@'
	 *   (Integer) completeKeyCode - Which key to use to complete
	 */
	var _options = {
		nameIdentifier: '@',
		completeKeyCode: 9
	};

	/** Array: _nicks
	 * An array of nicks to complete from
	 * Populated after 'candy:core.presence'
	 */
	var _nicks = [];

	/** Function: init
	 * Initialize the NameComplete plugin
	 * Show options for auto completion of names
	 *
	 * Parameters:
	 *   (Object) options - Options to apply to this plugin
	 */
	self.init = function(options) {
		// apply the supplied options to the defaults specified
		$.extend(true, _options, options);

		$(Candy.View.Pane).on('candy:core.presence, candy:view.room.afterShow', function() {
			self.populateNicks();
		});

		// listen for keydown when autocomplete options exist
		$(document).on('keydown', 'input[name="message"]', function(e) {
			// if we hear the key code for completion
			if (e.which == _options.completeKeyCode) {
				// set up the vars for this method
				// break it on spaces, and get the last word in the string
				var field = $(this);
				var msg = field.val();
				var msgParts = msg.split(' ');
				var lastWord = msgParts[msgParts.length - 1];

				// go through each of the nicks and compare it
				$(_nicks).each(function(index, item) {
					// if we have results
					if (item.match(lastWord) !== null) {
						// replace the last part with the item
						msgParts[msgParts.length - 1] = item;

						// put the string back together on spaces
						field.val(msgParts.join(' '));

						// prevent tabs from switching to the field
						if (_options.completeKeyCode == 9) {
							e.preventDefault();
						}
					}
				});
			}
		});
	}

	/** Function: populateNicks
	 * Populate the collection of nicks to autocomplete from
	 */
	self.populateNicks = function() {
		// clear the nick collection
		_nicks = [];

		// grab the roster in the current room
		var roster = Candy.Core.getRoom(Candy.View.getCurrent().roomJid).getRoster().getAll();

		// iterate and add the nicks to the collection
		$.each(roster, function(index, item) {
			_nicks.push(_options.nameIdentifier + item.getNick());
		});
	}

	return self;
}(CandyShop.NameComplete || {}, Candy, jQuery));