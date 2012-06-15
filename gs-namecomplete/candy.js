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

		// listen for keydown when autocomplete options exist
		$(document).on('keydown', 'input[name="message"]', function(e) {
			// if we hear the key code for completion
			if (e.which == _options.completeKeyCode) {
				// update the list of nicks to grab
				self.populateNicks();

				// set up the vars for this method
				// break it on spaces, and get the last word in the string
				var field = $(this);
				var msgParts = field.val().split(' ');
				var lastWord = msgParts[msgParts.length - 1];
				var matches = [];

				// go through each of the nicks and compare it
				$(_nicks).each(function(index, item) {
					// if we have results
					if (item.match(lastWord) !== null) {
						matches.push(item);
					}

				});

				// if we only have one match, no need to show the picker, just replace it
				// else show the picker of the name matches
				if (matches.length == 1) {
					self.replaceName(matches[0]);
				} else if (matches.length > 1) {
					self.showPicker(matches, field);
				}

				// don't perform any key actions
				e.preventDefault();
			}
		});
	};

	/** Function: keyDown
	 * The listener for keydown in the menu
	 *
	 * Parameters:
	 *   (Event) e - The keydown event
	 */
	self.keyDown = function(e) {
		// get the menu and the content element
		var menu = $('#context-menu'),
			content = menu.find('ul'),
			selected = content.find('li.selected');

		// switch the key code
		switch (e.which) {
			// up arrow
			case 38:
				// move the selected thing up
				var prev = selected.prev('li');
				if (prev.length > 0) {
					selected.removeClass('selected');
					prev.addClass('selected');
				}
				break;

			// down arrow
			case 40:
				// move the selected thing down
				var next = selected.next('li');
				if (next.length > 0) {
					selected.removeClass('selected');
					next.addClass('selected');
				}
				break;

			// the key code for completion
			case _options.completeKeyCode:
			// esc key
			case 27:
				if (e.which == _options.completeKeyCode) {
					// get the text of the selected item
					var val = content.find('li.selected').text();
					// replace the last item with the selected item
					self.replaceName(val);
				}

				// remove the listener on the field
				$(document).unbind('keydown', self.keyDown);

				// hide the menu
				menu.hide();
				break;
		}

		// stop the action of any keys
		e.preventDefault();
	};

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
	};

	/** Function: replaceName
	 * Replace the name in the message input
	 *
	 * Parameters:
	 *   (String) replaceText - Replace the last word in the message with this
	 */
	self.replaceName = function(replaceText) {
		// get the parts of the message
		var msgParts = $('input[name="message"]').val().split(' ');

		// replace the last part with the item
		msgParts[msgParts.length - 1] = replaceText;

		// put the string back together on spaces and focus back in the field
		$('input[name="message"]').val(msgParts.join(' ')).focus();
	};

	/** Function: showPicker
	 * Show the picker for the list of names that match
	 *
	 * Parameters:
	 *   (Array) matches - The matches that we found in the roster
	 *   (Element) elem - The input element that we're going to put the list over the top of
	 */
	self.showPicker = function(matches, elem) {
		// get the element
		elem = $(elem);

		// blur the field
		elem.blur();

		// get the necessary items
		var pos = elem.offset(),
			menu = $('#context-menu'),
			content = $('ul', menu),
			i;

		// clear the content if needed
		content.empty();

		// add the matches to the list
		for(i = 0; i < matches.length; i++) {
			content.append('<li class="gs-namecomplete-option">' + matches[i] + '</li>');
		}

		// select the first item
		$(content.find('li')[0]).addClass('selected');

		// bind the keydown to move around the menu
		$(document).bind('keydown', self.keyDown);

		// estimate the left to the # of chars * 7...not sure?
		// get the top of the box to put this thing at
		var posLeft = elem.val().length * 7,
			posTop  = Candy.Util.getPosTopAccordingToWindowBounds(menu, pos.top);

		// show it
		menu.css({'left': posLeft, 'top': posTop.px, backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment});
		menu.fadeIn('fast');

		return true;
	};

	return self;
}(CandyShop.NameComplete || {}, Candy, jQuery));