/** File: keyboardshortcutslefttabs.js
 * Candy Plugin Keyboard Shortcuts Left Tabs Compatibility
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.KeyboardShortcutsLeftTabs = (function(self, Candy, $) {
  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Keyboard Shortcuts Left Tabs Compatibility
   *  (Float) version - Candy Plugin Keyboard Shortcuts Left Tabs Compatibility
   */
  self.about = {
    name: 'Candy Plugin Keyboard Shortcuts Left Tabs Compatibility',
    version: '1.0'
  };

  /**
   * Initializes the KeyboardShortcutsLeftTabs plugin with the default settings.
   */
  self.init = function(){
    // Override the default behaviour in CandyShop.KeyboardShortcuts
    CandyShop.KeyboardShortcuts.showPane = self.showPane;
  };

  // Used to find and show room pane relative to current.
  // Because Candy.Core.getRooms() is a little broken, we need to use the DOM.
  self.showPane = function(number) {
    // The order of the selector is important here, because groupchats are visually above one on one chats.
    var rooms = $('#chat-tabs .roomtype-groupchat, #chat-tabs .roomtype-chat');

    var currentIndex = 0;

    for (var i = 0; i < rooms.length; i++) {
      if ($(rooms[i]).attr('data-roomjid') === Candy.View.getCurrent().roomJid) {
        currentIndex = i;
      }
    }

    var newIndex = currentIndex;

    if (number === '+1') {
      if ((currentIndex + 1) < rooms.length) {
        newIndex = currentIndex + 1;
      } else {
        newIndex = 0;
      }
    } else if (number === '-1') {
      if ((currentIndex - 1) >= 0) {
        newIndex = currentIndex - 1;
      } else {
        newIndex = rooms.length - 1;
      }
    } else {
      newIndex = number;
    }

    Candy.View.Pane.Room.show($(rooms[newIndex]).attr('data-roomjid'));
  };

  return self;
}(CandyShop.KeyboardShortcutsLeftTabs || {}, Candy, jQuery));
