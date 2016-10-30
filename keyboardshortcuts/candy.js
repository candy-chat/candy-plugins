/** File: autojoininvites.js
 * Candy Plugin Keyboard Shortcuts
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 *
 * Optionally uses CandyShop.RoomBar for user invite modal.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.KeyboardShortcuts = (function(self, Candy, $) {
  /** Object: self._options
   * Options for this plugin's operation
   *
   * Options:
   *   (Boolean) notifyNormalMessage - Notification on normalmessage. Defaults to false
   *   (Boolean) notifyPersonalMessage - Notification for private messages. Defaults to true
   *   (Boolean) notifyMention - Notification for mentions. Defaults to true
   *   (Integer) closeTime - Time until closing the Notification. (0 = Don't close) Defaults to 3000
   *   (String)  title - Title to be used in notification popup. Set to null to use the contact's name.
   *   (String)  icon - Path to use for image/icon for notification popup.
   */
  self._options = {
    inviteUserToRoom: {
      name: 'Invite a user to the current room',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 73 // 'i'
    },
    joinNewRoom: {
      name: 'Join a new room',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 78 // 'n'
    },
    toggleSound: {
      name: 'Toggle sound',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 83 // 's'
    },
    changeTopic: {
      name: 'Change room topic',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 84 // 't'
    },
    closeCurrentTab: {
      name: 'Close current tab',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 87 // 'w'
    },
    nextTab: {
      name: 'Next tab',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 40, // down arrow
      specialKeyDisplay: 'Down Arrow'
    },
    previousTab: {
      name: 'Previous tab',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 38, // up arrow
      specialKeyDisplay: 'Up Arrow'
    },
    helpScreen: {
      name: 'Show the help screen',
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 191, // '/'
      specialKeyDisplay: '/'
    }
  };

  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Keyboard Shortcuts
   *  (Float) version - Candy Plugin Keyboard Shortcuts
   */
  self.about = {
    name: 'Candy Plugin Keyboard Shortcuts',
    version: '1.0'
  };

  /**
   * Initializes the KeyboardShortcuts plugin with the default settings.
   */
  self.init = function(options){
    // apply the supplied options to the defaults specified
    $.extend(true, self._options, options);

    $(window).keydown(function(ev) {
      var keystrokes = {
        altKey: ev.altKey,
        ctrlKey: ev.ctrlKey,
        shiftKey: ev.shiftKey,
        keyCode: ev.keyCode
      };
      for (var option in self._options) {
        if (self.isEquivalent(self._options[option], keystrokes)) {
          window['CandyShop']['KeyboardShortcuts'][option]();
          ev.preventDefault();
        }
      };
    });
  };

  self.addShortcut = function(name, shortcut) {
    self._options[name] = shortcut;
  }

  self.closeCurrentTab = function() {
    Candy.View.Pane.Room.close(Candy.View.getCurrent().roomJid);
  };

  self.joinNewRoom = function() {
    CandyShop.CreateRoom.showModal();
  };

  self.toggleSound = function() {
    Candy.View.Pane.Chat.Toolbar.onSoundControlClick();
  };

  self.changeTopic = function() {
    var currentJid   = Candy.View.getCurrent().roomJid,
        element      = Candy.View.Pane.Room.getPane(Candy.View.getCurrent().roomJid),
        currentTopic = element.find('.roombar .topic').html();
    CandyShop.RoomBar.updateRoomTopic(currentJid, $(element).attr('id'), currentTopic);
  };

  self.nextTab = function() {
    this.showPane('+1');
  };

  self.previousTab = function() {
    this.showPane('-1');
  };

  self.helpScreen = function() {
    var html = '<h4>Keyboard Shortcuts</h4><ul>';

    for (var shortcut in self._options) {
      shortcut = self._options[shortcut];
      var shortcutString = '';

      if (shortcut.ctrlKey) {
        shortcutString += 'Ctrl + ';
      }

      if (shortcut.altKey) {
        shortcutString += 'Alt/Option + ';
      }

      if (shortcut.shiftKey) {
        shortcutString += 'Shift + ';
      }

      shortcutString += shortcut.specialKeyDisplay || String.fromCharCode(shortcut.keyCode);

      html += Mustache.to_html(self.Template.listItem, {
        name: shortcut.name,
        shortcut: shortcutString
      });

    }

    html += '</ul>';

    Candy.View.Pane.Chat.Modal.show(html, true, false);
  };

  self.inviteUserToRoom = function() {
    // Only show the invite modal if we have access to it via CandyShop.RoomBar and if we are in a groupchat.
    if (CandyShop.RoomBar && Candy.Core.getRoom(Candy.View.getCurrent().roomJid)) {
      CandyShop.RoomBar.showInviteUsersModal(Candy.View.getCurrent().roomJid);
    }
  };

  // Used to find and show room pane relative to current.
  self.showPane = function(number) {
    var rooms = Candy.Core.getRooms(),
        room_names = Object.keys(rooms);

    var currentIndex = room_names.indexOf(Candy.View.getCurrent().roomJid),
        newIndex = currentIndex;

    if (number === '+1') {
      if ((currentIndex + 1) < room_names.length) {
        newIndex = currentIndex + 1;
      } else {
        newIndex = 0;
      }
    } else if (number === '-1') {
      if ((currentIndex - 1) >= 0) {
        newIndex = currentIndex - 1;
      } else {
        newIndex = room_names.length - 1;
      }
    } else {
      newIndex = number;
    }

    Candy.View.Pane.Room.show(room_names[newIndex]);
  };

  // Used to help JavaScript determine if two objects are identical.
  self.isEquivalent = function(options, incoming) {
    // Create arrays of property names
    var optionsProps = Object.getOwnPropertyNames(options);

    for (var i = 0; i < optionsProps.length; i++) {
      var propName = optionsProps[i];

      // If values of same property are not equal, objects are not equivalent
      if (propName !== 'name' && propName !== 'specialKeyDisplay' && options[propName] !== incoming[propName]) {
        return false;
      }
    }
    // If we made it this far, objects are considered equivalent
    return true;
  };

  self.Template = {
    listItem: '<li><h5>{{name}}</h5>{{shortcut}}</li>'
  };

  return self;
}(CandyShop.KeyboardShortcuts || {}, Candy, jQuery));
