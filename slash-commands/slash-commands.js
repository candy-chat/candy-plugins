/** File: candy.js
 * Make several Candy actions accessible via the message box when prefixed with a slash "/"
 *
 * Authors:
 *  - Ben Klang <bklang@mojolingo.com>
 *
 * Contributors:
 *  - Troy McCabe <troy.mccabe@geeksquad.com>
 *  - Jonatan Männchen <jonatan.maennchen@amiadogroup.com>
 *  - Sudrien <_+github@sudrien.net>
 *
 * Copyright:
 *  - (c) 2014 Mojo Lingo LLC. All rights reserved.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.SlashCommands = (function(self, Candy, $) {
  /** Object: about
   * About SlashCommands plugin
   *
   * Contains:
   *   (String) name - Candy Plugin SlashCommands
   *   (Float) version - Candy Plugin Available Rooms version
   */
  self.about = {
    name: 'Candy Plugin SlashCommands',
    version: '0.2.0'
  };

  self.commands = [
    'join',
    'part',
    'clear',
    'topic',
    'available',
    'away',
    'dnd',
    'nick',
    'leave',
    'invite',
    'kick'
  ];
  
  /* This is not a command. me-does can handle /me formatting */
  self.passthrough = [
    'me',
  ];

  self.defaultConferenceDomain = null;

  /** Function: init
   * Initializes the Slash Commands plugin with the default settings.
   */
  self.init = function(){

    $(Candy).on('candy:view.connection.status-5', function() {
      // When connected to the server, default the conference domain if unspecified
      if (!self.defaultConferenceDomain) {
        self.defaultConferenceDomain = "@conference." + Candy.Core.getConnection().domain;
      }

      // Ensure we have a leading "@"
      if (self.defaultConferenceDomain.indexOf('@') == -1) {
        self.defaultConferenceDomain = "@" + self.defaultConferenceDomain;
      }
    });

    $(Candy).bind('candy:view.message.before-send', function(e, args) {
      try {
        // (strip colors)
        var input = args.message.replace(/\|c:\d+\|/, '');

        if (input[0] == '/') {
          var match = input.match(/^\/([^\s]+)(?:\s+(.*))?$/m);
          if (match !== null) {
            var command = match[1];
            var data = match[2];

            // pass though some commands, they only merit formatting elsewhere
            if ($.inArray(command, self.passthrough) != -1) { } 
            // Match only whitelisted commands
            else if ($.inArray(command, self.commands) != -1) {
              self[command](data);
              args.message = '';
            }
            else {
              Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "Invalid command: " + command);
              args.message = '';
            }
          }
          
        }
      } catch (ex) {
        // Without an exception catcher, the page will reload and the user will be logged out
        Candy.Core.log(ex);
      }
    });
  };

  /** Function: join
   * Joins a room
   *
   * Parameters:
   *   (String) args The name of the room and the optional password, separated by a space
   */
  self.join = function(args) {
    if(args === undefined || args == ''){
      Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "usage: /join room [roomPassword] ");
      return false;
    }
    args = args.split(' ');

    var room = args[0];
    var password = args[1];

    if(typeof room != 'undefined' && room !== '') {
      if(room.indexOf("@") == -1) {
        room += self.defaultConferenceDomain;
      }
      if (typeof password !== 'undefined' && password !== '') {
        Candy.Core.Action.Jabber.Room.Join(room, password);
      } else {
        Candy.Core.Action.Jabber.Room.Join(room);
      }
    }
  };
  
  
  /** Function: nick
   * Sets Nickname
   *
   * Parameters:
   *   (String) args The name of the room and the optional password, separated by a space
   */
  self.nick = function(args) {
    if(args !== undefined && args != '') {
      Candy.Core.Action.Jabber.SetNickname(args);
    }
    else {
      Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "usage: /nick newNickname");
    }
  };

  /** Function: part
   * Exits the current chat room
   *
   */
  self.part = function() {
    Candy.Core.Action.Jabber.Room.Leave(self.currentRoom());
  };
  
  /** Function: leave
   * Exits the current chat room
   *
   */
  self.leave = function() {
    Candy.Core.Action.Jabber.Room.Leave(self.currentRoom());
  };

  /** Function: topic
   * Sets the topic (subject) for the current chat room
   *
   * Parameters:
   *   (String) topic The new topic for the room
   */
  self.topic = function(topic) {
    // TODO: .isModerator() && allowed checks
    Candy.Core.Action.Jabber.Room.Admin.SetSubject(self.currentRoom(), topic);
  };

  /** Function: clear
   * Clear the current room's scrollback
   */
  self.clear = function() {
    $('.room-pane:visible').find('.message-pane').empty();
  };

  /** Function: available
   * Change the current user's XMPP status to "available" with an optional message
   * Parameters:
   *   (String) message Optional message to set with availability
   */
  self.available = function(message) {
    // TODO: The message field is currently unsupported by Candy.Core.Action.Jabber.Presence
    Candy.Core.Action.Jabber.Presence();
  };

  /** Function: away
   * Change the current user's XMPP status to "away" with an optional message
   * Parameters:
   *   (String) message Optional message to set with availability
   */
  self.away = function(message) {
    // TODO: The message field is currently unsupported by Candy.Core.Action.Jabber.Presence
    Candy.Core.Action.Jabber.Presence(null, $build('show', 'away'));
  };

  /** Function: dnd
   * Change the current user's XMPP status to "dnd" with an optional message
   * Parameters:
   *   (String) message Optional message to set with availability
   */
  self.dnd = function(message) {
    // TODO: The message field is currently unsupported by Candy.Core.Action.Jabber.Presence
    Candy.Core.Action.Jabber.Presence(null, $build('show', 'dnd'));
  };
  
  /** Function: invite
   * invite another user to the current chat room, with lookups for real room & user jids
   *
   *Parameters:
   *  (String) user Nickname of user, or JID - all currently connected rooms will be checked
   *  (String) room Optional room name, must already exist
   *  (String) password Optional room password, if room requires one
   */
  self.invite = function(args) {
    if(args === undefined || args == ''){
      Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "usage: /invite user [room] [roomPassword] ");
      return false;
    }
    args = args.split(' ');

    var user = new RegExp("^" + args[0] + "$", "i");
    var userJid = null;
    var room = new RegExp("^" + args[1] + "$", "i");
    var roomJid = null;
    var password = args[2];
    
    // loop through all rooms with current connections
    $.each(Candy.Core.getRooms(), function(roomName, roomData) {
      if( !roomJid && roomData && roomData.room.name.match(room) ) {
        roomJid = roomName;
        }
      if( !roomJid && roomName.match(room) ) {
        roomJid = roomName;
        }

      // loop through all users in a room
      // compare jids, nicks and previous nicks
      $.each(roomData.roster.getAll(), function(userName, userData) { 
        if( !userJid && userData.getJid().match(user) ) {
          userJid = userData.data.jid;
          }
        if( !userJid && userData.getNick().match(user) ){
          userJid = userData.data.jid;
          }
        if( !userJid && userData.getPreviousNick() !== undefined && userData.getPreviousNick().match(user) ) {
          userJid = userData.data.jid;
          }
        });
      });


    if(userJid !== undefined && userJid !== null && userJid !== '') {
      if(room !== undefined && room !== '') {
        if(password !== undefined && password !== '') {
          Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "Invited " + userJid + " to " + roomJid + " (with password)");
          var stanza = $msg({'from': Candy.Core.getUser().data.jid, 'to': userJid, 'xmlns': 'jabber:client'}).c('x', {'xmlns': 'jabber:x:conference', 'jid': roomJid});
          stanza.c("password").t(password);
          Candy.Core.getConnection().send(stanza.tree());
        }
        else {
          Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "Invited " + userJid + " to " + roomJid);
          var stanza = $msg({'from': Candy.Core.getUser().data.jid, 'to': userJid, 'xmlns': 'jabber:client'}).c('x', {'xmlns': 'jabber:x:conference', 'jid': roomJid});
          Candy.Core.getConnection().send(stanza.tree());
        }
      }
      else {
        Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "Invited " + userJid + " to " + self.currentRoom());
        var stanza = $msg({'from': Candy.Core.getUser().data.jid, 'to': userJid, 'xmlns': 'jabber:client'}).c('x', {'xmlns': 'jabber:x:conference', 'jid': self.currentRoom()});
        Candy.Core.getConnection().send(stanza.tree());
      }
    }
    else {
      Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "Could not find " + args[0] + " to invite");
    }

  };

  /** Function: kick
   * Kick user from current room. Admins only. 
   *
   * Parameters:
   *   (String) user Nickname of user, or JID - all currently connected rooms will be checked
   *  (String) comment Optional comment as to why they were kicked
   */
  self.kick = function(args) {
    if(args === undefined || args == ''){
      Candy.View.Pane.Chat.onInfoMessage(self.currentRoom(), '', "usage: /kick nickname [comment] ");
      return false;
    }
    args = args.split(' ');
    
    var user = new RegExp("^" + args[0] + "$", "i");
    var userJid = null;
    var comment = args[1];
   
   
    $.each(Candy.Core.getRooms()[self.currentRoom()].roster.getAll(), function(userName, userData) { 
      if( !userJid && userData.getJid().match(user) ) {
        userJid = userData.data.jid;
        }
      if( !userJid && userData.getNick().match(user) ){
        userJid = userData.data.jid;
        }
      if( !userJid && userData.getPreviousNick() !== undefined && userData.getPreviousNick().match(user) ) {
        userJid = userData.data.jid;
        }
      });
   

    if(userJid !== undefined && userJid !== null && userJid !== '') {
      Candy.Core.Action.Jabber.Room.Admin.UserAction(self.currentRoom(), userJid, "kick", comment);
    }
  };

  
  /** Function: currentRoom
   * Helper function to get the current room
   */
  self.currentRoom = function() {
    return Candy.View.getCurrent().roomJid;
  };
  
  return self;
}(CandyShop.SlashCommands || {}, Candy, jQuery));
