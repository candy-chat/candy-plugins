/** File: candy.js
 * Candy Show Available Rooms
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

CandyShop.AvailableRooms = (function(self, Candy, $) {
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
	self.init = function(){
		  $(Candy).on('candy:core.chat.connection', function(e, args) {
			 if(args.status === Strophe.Status.CONNECTED ||
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
		Candy.Core.getConnection().muc.listRooms('conference.' + Candy.Core.getConnection().domain, function(roomsData) {
			CandyShop.AvailableRooms.rooms = [];
			$.each($(roomsData).find('item'), function(item, room) {
				var allreadyIn = false;
				$.each(Candy.Core.getRooms(), function(item, roomSearch) {
					if(roomSearch.getJid() === $(room).attr('jid')) {
						allreadyIn = true;
						return false;
					}
				});
				if(!allreadyIn) {
					var name = $(room).attr('name');
					var people = 0;
					var pos = name.indexOf("(");
					if (pos != -1) {
						name = name.substr(0, name.indexOf('(') - 1);
						people = name.substr(pos + 1, name.length - pos - 2);
					}

					CandyShop.AvailableRooms.rooms.push({
							jid: $(room).attr('jid'),
							name: name,
							people: people,
					});
				}
			});
			CandyShop.AvailableRooms.rooms = CandyShop.AvailableRooms.rooms.sort(function(a, b) {
				if(a.people === b.people) {
					return a.name < b.name ? -1 : 1;
				} else {
					return a.people < b.people ? 1 : -1;
				}
			});
			CandyShop.AvailableRooms.placePlusTab();
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
}(CandyShop.AvailableRooms || {}, Candy, jQuery));
