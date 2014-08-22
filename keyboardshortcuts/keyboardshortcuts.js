/** File: autojoininvites.js
 * Candy Plugin Keyboard Shortcuts
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.KeyboardShortcuts = (function(self, Candy, $) {
  /** Object: _options
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
  var _options = {
    joinNewRoom: {
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 78 // 'n'
    },
    toggleSound: {
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 83 // 's'
    },
    changeTopic: {
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 84 // 't'
    },
    closeCurrentTab: {
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 87 // 'w'
    },
    nextTab: {
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 40 // down arrow
    },
    previousTab: {
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 38 // up arrow
    },
    helpScreen: {
      altKey: true,
      ctrlKey: false,
      shiftKey: false,
      keyCode: 191 // '/'
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
    $.extend(true, _options, options);

    $(window).keydown(function(ev) {
      var keystrokes = {
        altKey: ev.altKey,
        ctrlKey: ev.ctrlKey,
        shiftKey: ev.shiftKey,
        keyCode: ev.keyCode
      };
      for (var option in _options) {
        if (self.isEquivalent(_options[option], keystrokes)) {
          window['CandyShop']['KeyboardShortcuts'][option]();
          ev.preventDefault();
        }
      }
    });
  };

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
    var html = "<h4>Keyboard Shortcuts</h4><ul><li><h6>Join new room:</h6> alt/option + n</li>" +
               "<li><h6>Toggle sound:</h6> alt/option + s</li><li><h6>Change topic:</h6> alt/option + t</li>" +
               "<li><h6>Close current tab:</h6> alt/option + w</li><li><h6>Next tab:</h6> alt/option + down arrow</li>" +
               "<li><h6>Previous tab:</h6> alt/option + up arrow</li><li><h6>Help screen:</h6> alt/option + ?</li></ul>";
    Candy.View.Pane.Chat.Modal.show(html, true, false);
  };

  // Used to find and show room pane relative to current.
  self.showPane = function(number) {
    var rooms = Candy.Core.getRooms(),
        room_names = Object.keys(rooms);

    // Push the lobby to the front of the room_names.
    room_names.unshift(CandyShop.StaticLobby.getLobbyFakeJid());

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
  self.isEquivalent = function(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a),
        bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different, objects are not equivalent
    if (aProps.length !== bProps.length) {
      return false;
    }

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal, objects are not equivalent
      if (a[propName] !== b[propName]) {
        return false;
      }
    }

    // If we made it this far, objects are considered equivalent
    return true;
  };

  return self;
}(CandyShop.KeyboardShortcuts || {}, Candy, jQuery));
