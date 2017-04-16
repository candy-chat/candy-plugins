/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *  - Troy McCabe <troy.mccabe@geeksquad.com>
 *  - Ben Klang <bklang@mojolingo.com>
 *
 * Copyright:
 *  (c) 2012 Geek Squad. All rights reserved.
 *  (c) 2014 Power Home Remodeling Group. All rights reserved.
 */

/* global document, Candy, jQuery */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: CandyShop.NameComplete
 * Allows for completion of a name in the roster
 */
CandyShop.NameComplete = (function(self, Candy, $) {
	/** Object: _options
	 * Options:
	 *  (String) nameIdentifier - Prefix to append to a name to look for. '@' now looks for '@NICK', '' looks for 'NICK', etc. Defaults to '@'
	 *  (Integer) completeKeyCode - Which key to use to complete
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

	/** String: _selector
	 * The selector for the visible message box
	 */
	var _selector = 'input[name="message"]:visible';

	/** Boolean:_autocompleteStarted
	 * Keeps track of whether we're in the middle of autocompleting a name
	 */
	var _autocompleteStarted = false;

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
		$(document).on('input', _selector, function(e) {
			if (event.target.value.slice(-1) === _options.nameIdentifier) {
				_autocompleteStarted = true;
			}

			if (_autocompleteStarted) {
				// update the list of nicks to grab
				self.populateNicks();

				// set up the vars for this method
				// break it on spaces, and get the last word in the string
				var field = $(this);
				var msgParts = field.val().split(_options.nameIdentifier);
				var lastWord = new RegExp( "^" + _options.nameIdentifier + msgParts[msgParts.length - 1], "i");
				var matches = [];

				// go through each of the nicks and compare it
				$(_nicks).each(function(index, item) {
					// if we have results
					if (item.match(lastWord) !== null) {
						matches.push(item);
					}

				});

				self.showPicker(matches, field);
			}
		});
	};

	/** Function: keyDown
	 * The listener for keydown in the menu
	 */
	self.keyDown = function(e) {
		// get the menu and the content element
		var menu = $('#context-menu');
		var content = menu.find('ul');
		var selected = content.find('li.selected');

		if(menu.css('display') === 'none') {
			$(document).unbind('keydown', self.keyDown);
			return;
		}

		// switch the key code
		switch (e.which) {
			// up arrow
			case 38:
			// down arrow
			case 40:
				var newEl;
				if (e.which === 38) {
					// move the selected thing up
					newEl = selected.prev();
				} else {
					// move the selected thing down
					newEl = selected.next();
				}
				// Prevent going off either end of the list
				if ($(newEl).length > 0) {
					selected.removeClass('selected');
					newEl.addClass('selected');
				}
				// don't perform any key actions
				e.preventDefault();
				break;

			// esc key
			case 27:
			// delete Key
			case 8:
			case 46:
				self.endAutocomplete();
				break;

			// the key code for completion
			case _options.completeKeyCode:
			case 13:
				// get the text of the selected item
				var val = content.find('li.selected').text();
				// replace the last item with the selected item
				self.replaceName(val);
				// don't perform any key actions
				e.preventDefault();
				break;
		}
	};

	/** Function: endAutocomplete
	 * Disables autocomplete mode, hiding the context menu
	 */
	self.endAutocomplete = function() {
		_autocompleteStarted = false;
		$(_selector).unbind('keydown', self.keyDown);
		$('#context-menu').hide();
	};

	/** Function: selectOnClick
	 * The listener for click on decision in the menu
	 *
	 * Parameters:
	 *   (Event) e - The click event
	 */
	self.selectOnClick = function(e) {
		self.replaceName($(e.currentTarget).text());
		$(_selector).focus();
		e.preventDefault();
	};

	/** Function: populateNicks
	 * Populate the collection of nicks to autocomplete from
	 */
	self.populateNicks = function() {
		// clear the nick collection
		_nicks = [];

		// grab the roster in the current room
		var room = Candy.Core.getRoom(Candy.View.getCurrent().roomJid);
		if (room !== null) {
			var roster = room.getRoster().getAll();

			// iterate and add the nicks to the collection
			$.each(roster, function(index, item) {
				_nicks.push(_options.nameIdentifier + item.getNick());
			});
		}
	};

	/** Function: replaceName
	 *
	 */
	self.replaceName = function(replaceText) {
		// get the parts of the message
		var $msgBox = $(_selector);
		var value = $msgBox.val();

		// If the name is the first word, add a colon to the end
		if (value[0] == _options.nameIdentifier) {
			replaceText += ": ";
		} else {
			replaceText = " " + replaceText + " ";
		}

		// put the string back
		$msgBox.val(value.substr(0, value.lastIndexOf(_options.nameIdentifier)) + replaceText);
		self.endAutocomplete();
	};

	/** Function: showPicker
	 * Show the picker for the list of names that match
	 */
	self.showPicker = function(matches, elem) {
		// get the element
		elem = $(elem);

		// get the necessary items
		var pos = elem.offset(),
			menu = $('#context-menu'),
			content = $('ul', menu),
			i;

		// clear the content if needed
		content.empty();

		// add the matches to the list
		for(i = 0; i < matches.length; i++) {
			content.append('<li class="candy-namecomplete-option">' + matches[i] + '</li>');
		}

		// select the first item
		$(content.find('li')[0]).addClass('selected');

		content.find('li').click(self.selectOnClick);

		// bind the keydown to move around the menu
		$(_selector).bind('keydown', self.keyDown);

		var posLeft = '16%',
			posTop	= Candy.Util.getPosTopAccordingToWindowBounds(menu, pos.top);

		// show it
		menu.css({'left': posLeft, 'top': posTop.px, backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment});
		menu.fadeIn('fast');

		return true;
	};

	return self;
}(CandyShop.NameComplete || {}, Candy, jQuery));
