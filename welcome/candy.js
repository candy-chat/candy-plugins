/** File: welcome.js
 * Candy Plugin Welcome Screen
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Welcome = (function(self, Candy, $) {
  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Welcome Screen
   *  (Float) version - Candy Plugin Welcome Screen
   */
  self.about = {
    name: 'Candy Plugin Welcome Screen',
    version: '1.0'
  };

  /**
   * Initializes the Welcome plugin with the default settings.
   */
  self.init = function(){
    $(Candy).on('candy:view.room.after-show', self.setTitle);

    self.showWelcome();

    $(Candy).on('candy:view.room.after-close', self.showWelcome);
    $(Candy).on('candy:view.room.after-show', self.showWelcome);
  };

  self.showWelcome = function(){
    // Show the welcome info again.
    if ($('#chat-rooms .room-pane:visible').length === 0) {
      if ($('#chat-rooms #welcome-pane').length === 0) {
        $('#chat-rooms').prepend(self.Template.welcome);
      }
    } else {
      $('#welcome-pane').remove();
    }
    return true;
  };

  self.Template = {
    welcome: '<div id="welcome-pane" class="room-pane" style="display:block;"><h3>Welcome!</h3><p>Click on More on the left to add a room or start a chat with another user.</p></div>'
  };

  return self;
}(CandyShop.Welcome || {}, Candy, jQuery));


