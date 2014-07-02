/** File: candy.js
 * Candy join room over command
 * 
 * Authors:
 *	- Jonatan Männchen <jonatan.maennchen@amiadogroup.com>
 * 
 * Copyright:
 *	- (c) 2012 Amiado Group AG. All rights reserved.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.SlashCommands = (function(self, Candy, $) {
	/** Object: about
	 * About SlashCommands plugin
	 *
	 * Contains:
	 *	 (String) name - Candy Plugin SlashCommands
	 *	 (Float) version - andy Plugin Available Rooms version
	 */
	self.about = {
		name: 'Candy Plugin SlashCommands',
		version: '0.1.0'
	};

	self.commands = [
		'join',
		'clear',
	];
	
	/** Function: init
	 * Initializes the Slash Commands plugin with the default settings.
	 */
	self.init = function(){
		$(Candy).bind('candy:view.message.before-send', function(e, args) {
			try {
				// (strip colors)
				var input = args.message.replace(/\|c:\d+\|/, '');

				if (input[0] == '/') {
					var match = input.match(/^\/([^\s]+)(?:\s+(.*))?$/m);
					if (match != null) {
						console.log(match);
						var command = match[1];
						var data = match[2];
						
						// Match only whitelisted commands
						if ($.inArray(command, self.commands) != -1) {
							self[command](data);
						} else {
							// TODO: Better way to notify the user of the invalid command
							alert("Invalid command: " + command);
						}
					}
					args.message = '';
				}
			} catch (e) {
				// Without an exception catcher, the page will reload and the user will be logged out
				console.log(e);
			}
		});
	};
	
	/** Function: join
	 * Joins a room
	 * 
	 * Parameters:
	 *	 (String) args The name of the room and the optional password, separated by a space
	 */
	self.join = function(args) {
		args = args.split(' ');

		var room = args[0];
		var password = args[1];

		if(typeof room != 'undefined' && room != '') {
			if(room.indexOf("@") == -1) {
				room += "@conference." + Candy.Core.getConnection().domain;
			}
			if (typeof password != 'undefined' && password != '') {
				Candy.Core.Action.Jabber.Room.Join(room, password);
			} else {
				Candy.Core.Action.Jabber.Room.Join(room);
			}
		}
	};

	/** Function: clear
	 * Clear the current room's scrollback
	 */
	self.clear = function() {
		$('.room-pane').filter(':visible').find('.message-pane').empty();
	}
	
	return self;
}(CandyShop.SlashCommands || {}, Candy, jQuery));
