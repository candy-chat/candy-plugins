/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors
 *   - ???
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: Colors
 * Allows the user to alter the text color of their message
 */
CandyShop.Colors = (function(self, Candy, $) {
	/** Object: _options
	 * Options:
	 *   (Integer) messagesToKeep - How many messages to keep in memory
	 */
	var _options = {
		colors: 8
	};

	/** Integer: _currentColor
	 * The holder for the current color that the user picked
	 */
	var _currentColor = 0;

	/** Function: init
	 * Initialize this plugin
	 *
	 * Parameters:
	 *   (Object) options - An options packet to apply to this plugin
	 */
	self.init = function(options) {
		// apply the options passed in to the current options
		$.extend(true, _options, options);

		// apply the translations
		self.applyTranslations();

		// Updated to new jQuery event model
		$(Candy.View.Pane).bind('candy:view.message.beforeSend', function(e, args) {
			// add the color before it's send
			if(_currentColor > 0 && $.trim(args.message) !== '') {
				args.message = '|c:'+ _currentColor +'|' + args.message;
			}
		});

		// Updated to new jQuery event model
		$(Candy.View.Pane).bind('candy:view.message.beforeShow', function(e, args) {
			// apply the color before it's shown
			args.message = args.message.replace(/^\|c:([0-9]{1,2})\|(.*)/gm, '<span class="colored color-$1">$2</span>');
		});

		// if we have the cookie
		if(Candy.Util.cookieExists('candyshop-colors-current')) {
			// grab the color
			var color = parseInt(Candy.Util.getCookie('candyshop-colors-current'), 10);
			// set the current color
			if(color > 0 && color < _options.colors) {
				_currentColor = color;
			}
		}
		//Add the icon and the click handler for it
		var html = '<li id="colors-control" data-tooltip="' + $.i18n._('candyshopColorsMessagecolor') + '"><span class="color-' + _currentColor + '" id="colors-control-indicator"></span></li>';
		$('#emoticons-icon').after(html);
		$('#colors-control').click(function(event) {
			CandyShop.Colors.showPicker(this);
		});
	};

	/** Function: showPicker
	 * Show the color picker in the item that's shown
	 *
	 * Parameters:
	 *   (Element) elem - The clicked element
	 */
	self.showPicker = function(elem) {
		// set up vars for this method
		elem = $(elem);
		var pos = elem.offset(),
			menu = $('#context-menu'),
			content = $('ul', menu),
			colors = '',
			i;

		// hide the tooltip
		$('#tooltip').hide();

		// build the grid of colors
		for(i = _options.colors-1; i >= 0; i--) {
			colors = '<span class="color-' + i + '" data-color="' + i + '"></span>' + colors;
		}
		// set the grid in the one list item we create
		content.html('<li class="colors">' + colors + '</li>');

		// listen for click
		content.find('span').click(function() {
			// set the current color, change the indicator, set the cookie, focus to the message input and hide the menu
			_currentColor = $(this).attr('data-color');
			$('#colors-control-indicator').attr('class', 'color-' + _currentColor);
			Candy.Util.setCookie('candyshop-colors-current', _currentColor, 365);
			Candy.View.Pane.Room.setFocusToForm(Candy.View.getCurrent().roomJid);
			menu.hide();
		});

		// get the proper position to show this
		var posLeft = Candy.Util.getPosLeftAccordingToWindowBounds(menu, pos.left),
			posTop  = Candy.Util.getPosTopAccordingToWindowBounds(menu, pos.top);

		// show the menu
		menu.css({'left': posLeft.px, 'top': posTop.px, backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment});
		menu.fadeIn('fast');

		return true;
	};

	/** Function: applyTranslations
	 * Apply the translations for this plugin
	 */
	self.applyTranslations = function() {
		Candy.View.Translation.en.candyshopColorsMessagecolor = 'Message color';
		Candy.View.Translation.de.candyshopColorsMessagecolor = 'Farbe für Nachrichten';
		Candy.View.Translation.fr.candyshopColorsMessagecolor = 'Couleur des messages';
		Candy.View.Translation.nl.candyshopColorsMessagecolor = 'Berichtkleur';
		Candy.View.Translation.es.candyshopColorsMessagecolor = 'Color de los mensajes';
	};

	return self;
}(CandyShop.Colors || {}, Candy, jQuery));
