/** File: candy.js
 * Candy: show available rooms on conference server and add roster items
 * for private chats.
 * Fork of available-rooms plugin.
 *
 * Authors:
 *  - Jonatan Männchen <jonatan.maennchen@amiadogroup.com>
 *  - Georg Jansing <georg.jansing@hhu.de>
 *
 * Copyright:
 *  - (c) 2012 Amiado Group AG. All rights reserved.
 *  - (c) 2016 Georg Jansing. All rights reserved.
 */

/* global Candy, jQuery, Strophe */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.AvailableChats = (function(self, Candy, $) {
	self.about = {
		name: 'Candy Plugin Available Chats',
		version: '1.0',
	};

	self._options = {
		domain: null, /** Prefix (e.g. "conference") or complete MUC Domain
		                * to list rooms from. If domain ends with a dot (".")
		                * it will be interpreted as a prefix, otherweise as
		                * full domain. */
	}

	/** Array: rooms
	 * all rooms
	 *
	 * Contains:
	 *   (Object List) rooms
	 *     (String) jid
	 *     (String) name
	 *     (Integer) people (number of participants)
	 */
	self.rooms = [];

	/** Function: init
	 * Initializes the available-rooms plugin with the default settings.
	 */
	self.init = function(options) {
		$.extend(true, self._options, options);

		$(Candy).on('candy:core.chat.connection', function(e, args) {
			if (args.status === Strophe.Status.CONNECTED ||
					args.status === Strophe.Status.ATTACHED) {
					// Load rooms
					self.loadRooms();

					// Do it again all 10 seconds
					setInterval(self.loadRooms, 10000);
			}
		});

		// Add Handler
		$(Candy).on('candy:view.message.before-send', function(e, args) {
			// (strip colors)
			// if it matches '/list', show rooms and don't send anything
			if (args.message.replace(/\|c:\d+\|/, '').toLowerCase() === '/list') {
				self.showRooms();
				args.message = '';
			}
		});
		$(Candy).on('candy:view.room.after-add', self.loadRooms);
	};

	/** Function: loadRooms
	 * Load all public rooms
	 */
	self.loadRooms = function () {
		if(! self._options.domain) {
			self._options.domain = "conference." + Candy.Core.getConnection().domain;
		} else if (self._options.domain.charAt(self._options.domain.length - 1) == ".") {
			self._options.domain = self._options.domain +
					Candy.Core.getConnection().domain;
		}
		
		Candy.Core.getConnection().muc.listRooms(self._options.domain, function(roomsData) {
			CandyShop.AvailableChats.rooms = [];
			$.each($(roomsData).find('item'), function(item, room) {
				var allreadyIn = false;
				$.each(Candy.Core.getRooms(), function(item, roomSearch) {
					if(roomSearch.getJid() === $(room).attr('jid')) {
						allreadyIn = true;
						return false;
					}
				});
				if(! allreadyIn) {
					var name = $(room).attr('name');
					var people = 0;
					var pos = name.indexOf("(");
					if (pos != -1) {
						name = name.substr(0, name.indexOf('(') - 1);
						people = name.substr(pos + 1, name.length - pos - 2);
					}

					CandyShop.AvailableChats.rooms.push({
							jid: $(room).attr('jid'),
							name: name,
							people: people,
					});
				}
			});
			CandyShop.AvailableChats.rooms = CandyShop.AvailableChats.rooms.sort(function(a, b) {
				if(a.people === b.people) {
					return a.name < b.name ? -1 : 1;
				} else {
					return a.people < b.people ? 1 : -1;
				}
			});
			CandyShop.AvailableChats.placePlusTab();
		});
	};

	/** Function: placePlusTab
	 * placeTheTab
	 */
	self.placePlusTab = function() {
		if(self.rooms.length > 0) {
			if($('#add-room').length > 0) {
				$('#add-room').parent().remove();
			}
			$('#chat-tabs').children().last().after('<li class="roomtype-add"><a id="add-room" href="javascript:;" class="label" style="padding-right: 10px;">+</a></li>');
			$('#add-room').click(self.showRooms);
		} else {
			if($('#add-room').length > 0) {
				$('#add-room').parent().remove();
			}
		}
	};

	/** Function: showRooms
	 * Show all public rooms
	 */
	self.showRooms = function() {
		// get the element
		var elem = $('#add-room');

		// blur the field
		elem.blur();

		// get the necessary items
		var menu = $('#context-menu'),
			content = $('ul', menu);

		// clear the content if needed
		content.empty();

		// add the matches to the list
		for(var i in self.rooms) {
			var room = self.rooms[i];
			var people = "";
			if (room.people > 0) {
				people = " (" + room.people + " Personen)";
			}

			content.append('<li class="available-room-option" data-jid="'+ self.rooms[i].jid +'">' + self.rooms[i].name + people + '</li>');
		}

		content.find('li').click(self.joinChanel);

		var pos = elem.offset(),
				posLeft = Candy.Util.getPosLeftAccordingToWindowBounds(menu, pos.left + 7),
				posTop = Candy.Util.getPosTopAccordingToWindowBounds(menu, pos.top);

		menu.css({'left': posLeft.px, 'top': '7px', backgroundPosition: posLeft.backgroundPositionAlignment + ' ' + posTop.backgroundPositionAlignment});
		menu.fadeIn('fast');
	};

	/** Function: joinChanel
	 * Show all public rooms
	 *
	 * Parameters:
	 *   (Event) e
	 */
	self.joinChanel = function(e) {
		$('#context-menu').hide();
		Candy.Core.Action.Jabber.Room.Join($(e.currentTarget).attr('data-jid'));
		if($('#add-room').length > 0) {
			$('#add-room').parent().remove();
		}
		e.preventDefault();
	};

	return self;
}(CandyShop.AvailableChats || {}, Candy, jQuery));
