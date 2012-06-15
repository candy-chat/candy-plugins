/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors
 *   - ???
 */
var CandyShop = (function(self) {return self;}(CandyShop || {}));

/** Class: RoomPanel
 * Shows a list of rooms upon connection and adds a little icon to bring list of rooms
 */
CandyShop.RoomPanel = (function(self, Candy, Strophe, $) {
	/** Object: _options
	 * The options for this plugin
	 *
	 * Options:
	 *   (String) mucDomain - The domain of this MUC. Defaults to ''
	 *   (Array) roomList - The list of rooms for the dialog. Defaults to []
	 *   (Boolean) showIfAllTabClosed - Whether to show the dialog when the last room is closed. Defaults to true
	 *   (Boolean) autoDetectRooms - Whether to detect rooms from the XMPP server. Defaults to true
	 *   (Integer) roomCacheTime - Time in seconds before refreshing the room list. Defaults to 600 (10 minutes)
	 */
	var _options = {
		mucDomain: '',
		roomList: [],
		showIfAllTabClosed: true,
		autoDetectRooms: true,
		roomCacheTime: 600
	};

	/** Integer: _lastRoomUpdate
	 * The timestamp of the last update of rooms
	 */
	var _lastRoomUpdate = 0;

	/** Function: init
	 * Initialize this plugin
	 *
	 * Parameters:
	 *   (Object) options - The options to apply to this plugin
	 */
	self.init = function(options) {
		// Apply the passed in options to the defaults
		$.extend(_options, options);

		// Apply the translations required for this plugin
		self.applyTranslations();

		// Overwrite candy allTabsClosed function not to disconnect when all tags are closed
		if (_options.showIfAllTabClosed) {
			Candy.View.Pane.Chat.allTabsClosed = function () {
				CandyShop.RoomPanel.showRoomPanel();
				return;
			};
		}

		// Put the roompanel button in the toolbar
		// this currently puts it first
		var html = '<li id="roomPanel-control" data-tooltip="' + $.i18n._('candyshopRoomPanelListRoom') + '"></li>';
		$('#chat-toolbar').prepend(html);
		// show the roompanel when it's clicked
		$('#roomPanel-control').click(function() {
			CandyShop.RoomPanel.showRoomPanel();
		});

		// Add a listener to show the room panel if not in a room on update of the chat
		// only show it when connected, though
		$(Candy.Core.Event).on('candy:core.chat.connection', function(e, args) {
			if (args.status == Strophe.Status.CONNECTED) {
				// only show room window if not already in a room, timeout is to let some time for auto join to execute
				setTimeout(CandyShop.RoomPanel.showRoomPanelIfAllClosed, 500);
			}
		});

	};

	/** Function: showRoomPanelIfAllClosed
	 * Show the room panel if all the rooms are closed
	 */
	self.showRoomPanelIfAllClosed = function() {
		// get the count of rooms and the rooms Candy has registered
		var roomCount = 0,
			rooms = Candy.Core.getRooms();
		// only increment if it has the prop
		for (k in rooms) {
			if (rooms.hasOwnProperty(k)) {
				roomCount++;
			}
		}

		// if we dont have any rooms, show the panel
		if (roomCount == 0) {
			CandyShop.RoomPanel.showRoomPanel();
		}
	};

	/** Function: updateRoomList
	 * Update the room list from the XMPP server
	 *
	 * Parameters:
	 *   (iq) iq - The xml response from the server
	 */
	self.updateRoomList = function (iq) {
		// init a container for the new room list
		var newRoomList = [];

		// iterate over the items in the response
		$('item', iq).each(function (index, value) {
			var name = $(value).attr('name');
			var jid = $(value).attr('jid');

			// get the proper name if it's not defined
			if (typeof name == 'undefined') {
				name = jid.split('@')[0];
			}

			// add it to the list
			newRoomList.push({
				name: name,
				jid: jid
			});
		});

		// update the roomlist in the options and last update timestamp
		_options.roomList = newRoomList;
		_lastRoomUpdate = Math.round(new Date().getTime() / 1000);

		// show the panel
		self.showRoomPanel();
	};

	/** Function: showRoomPanel
	 * Shows the room panel
	 *
	 * Returns:
	 *   (Boolean)
	 */
	self.showRoomPanel = function() {
		// if the connecting modal is there, call until connecting modal is gone
		// else logic to show it
		if ($('#chat-modal').is(':visible')) {
			setTimeout(CandyShop.RoomPanel.showRoomPanel, 100);
		} else {
			// get the difference between now and the cache time
			var timeDiff = Math.round(new Date().getTime() / 1000) - _options.roomCacheTime;
			// if we auto detect rooms, and it's time to get new rooms, do so
			// else show the existing room list
			if (_options.autoDetectRooms && timeDiff > _lastRoomUpdate ) {
				// sends a request to get list of rooms user for the room
				var iq = $iq({type: 'get', from: Candy.Core.getUser().getJid(), to: _options.mucDomain  , id: 'findRooms1'})
					.c('query', {xmlns: Strophe.NS.DISCO_ITEMS}).tree();

				Candy.Core.getConnection().sendIQ(iq, self.updateRoomList);
			} else {
				// get the template and populate the stuff
				var html = Mustache.to_html(CandyShop.RoomPanel.Template.rooms, {
					title: $.i18n._('candyshopRoomPanelChooseRoom'),
					roomList: _options.roomList
				});
				// show the modal
				Candy.View.Pane.Chat.Modal.show(html, true);

				// bind to the room list items (links of room name) to join the room
				$('.roomList a').bind('click', function(e) {
					var roomJid = this.href.split('#')[1];
					Candy.Core.Action.Jabber.Room.Join(roomJid);
					Candy.View.Pane.Chat.Modal.hide();
					e.preventDefault();
				});
			}
		}

		return true;
	};

	/** Function: applyTranslations
	 * Apply the translations for this plugin
	 */
	self.applyTranslations = function() {
		Candy.View.Translation.en.candyshopRoomPanelListRoom = 'List Rooms';
		Candy.View.Translation.de.candyshopRoomPanelListRoom = 'Verfügbare Räume anzeigen';
		Candy.View.Translation.fr.candyshopRoomPanelListRoom = 'Liste des salles';
		Candy.View.Translation.nl.candyshopRoomPanelListRoom = 'List Rooms';
		Candy.View.Translation.es.candyshopRoomPanelListRoom = 'List Rooms';


		Candy.View.Translation.en.candyshopRoomPanelChooseRoom = 'Choose Room To Join';
		Candy.View.Translation.de.candyshopRoomPanelChooseRoom = 'Verfügbare Räume';
		Candy.View.Translation.fr.candyshopRoomPanelChooseRoom = 'Choisir une salle';
		Candy.View.Translation.nl.candyshopRoomPanelChooseRoom = 'Choose Room To Join';
		Candy.View.Translation.es.candyshopRoomPanelChooseRoom = 'Choose Room To Join';

	};

	return self;
}(CandyShop.RoomPanel || {}, Candy, Strophe, jQuery));

/** Class: RoomPanel.Template
 * The Template for the room panel
 */
CandyShop.RoomPanel.Template = (function (self) {
	var roomParts = [
		'<div class="roomList">',
			'<h2>{{title}}</h2>',
			'<ul>',
				'{{#roomList}}',
					'<li><a href="#{{jid}}">{{name}}</a></li>',
				'{{/roomList}}',
			'</ul>',
		'</div>'
	];

	self.rooms = roomParts.join('');

	return self;
})(CandyShop.RoomPanel.Template || {});