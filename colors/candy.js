var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Colors = (function(self, Candy, $) {

	var _numColors,
		_currentColor = 0;

	self.init = function(numColors) {
		_numColors = numColors ? numColors : 8;

		self.applyTranslations();

		Candy.View.Event.Message.beforeSend = function(message) {
			if(_currentColor > 0 && $.trim(message) !== '') {
				return '|c:'+ _currentColor +'|' + message;
			}
			return message;
		};

		Candy.View.Event.Message.beforeShow = function(args) {
			var message = ($.type(args) !== 'string') ? /* Candy >= 1.0.4 */ args.message : /* Candy < 1.0.4 */ args;
			return message.replace(/^\|c:([0-9]{1,2})\|(.*)/gm, '<span class="colored color-$1">$2</span>');
		};

		if(Candy.Util.cookieExists('candyshop-colors-current')) {
			var color = parseInt(Candy.Util.getCookie('candyshop-colors-current'), 10);
			if(color > 0 && color < _numColors) {
				_currentColor = color;
			}
		}
		var html = '<li id="colors-control" data-tooltip="' + $.i18n._('candyshopColorsMessagecolor') + '"><span class="color-' + _currentColor + '" id="colors-control-indicator"></span></li>';
		$('#emoticons-icon').after(html);
		$('#colors-control').click(function(event) {
			CandyShop.Colors.showPicker(this);
		});
	};

	self.showPicker = function(elem) {
		elem = $(elem);
		var pos = elem.offset(),
			menu = $('#context-menu'),
			content = $('ul', menu),
			colors = '',
			i;

		$('#tooltip').hide();

		for(i = _numColors-1; i >= 0; i--) {
			colors = '<span class="color-' + i + '" data-color="' + i + '"></span>' + colors;
		}
		content.html('<li class="colors">' + colors + '</li>');
		content.find('span').click(function() {
			_currentColor = $(this).attr('data-color');
			$('#colors-control-indicator').attr('class', 'color-' + _currentColor);
			Candy.Util.setCookie('candyshop-colors-current', _currentColor, 365);
			Candy.View.Pane.Room.setFocusToForm(Candy.View.getCurrent().roomJid);
			menu.hide();
		});

		var posLeft = Candy.Util.getPosLeftAccordingToWindowBounds(menu, pos.left),
			posTop  = Candy.Util.getPosTopAccordingToWindowBounds(menu, pos.top);

		menu.css({'left': posLeft.px, 'top': posTop.px, backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment});
		menu.fadeIn('fast');

		return true;
	};

	self.applyTranslations = function() {
		Candy.View.Translation.en.candyshopColorsMessagecolor = 'Message color';
		Candy.View.Translation.de.candyshopColorsMessagecolor = 'Farbe für Nachrichten';
		Candy.View.Translation.fr.candyshopColorsMessagecolor = 'Couleur des messages';
		Candy.View.Translation.nl.candyshopColorsMessagecolor = 'Berichtkleur';
		Candy.View.Translation.es.candyshopColorsMessagecolor = 'Color de los mensajes';
	};

	return self;
}(CandyShop.Colors || {}, Candy, jQuery));