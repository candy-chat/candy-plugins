/** File: createroom.js
 * Candy Plugin Create Room
 * Author: Melissa Adamaitis <melissa@melissanoelle.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.CreateRoom = (function(self, Candy, $) {
  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Create Room
   *  (Float) version - Candy Plugin Create Room
   */
  self.about = {
    name: 'Candy Plugin Create Room',
    version: '0.1'
  };

  /**
   * Initializes the CreateRoom plugin with the default settings.
   */
  self.init = function(){
    $(Candy).on('candy:view.room.after-add', function() {
      self.addModal();
      self.appendButton();
    });
  };

  self.appendButton = function(){
    if($('#create-group').length == 0) {
      var create_room_html = '<div id="create-group"><div class="click">+ Create Group</div></div>';
      $('#chat-tabs').after(create_room_html);
      $('#create-group').click(function () {
        self.showModal();
        $('#group-form-wrapper').click(function() {
          self.hideModal();
        });
        $('#create-group-form').click(function(event) {
          event.stopPropagation();
        });
        $('#create-group-form .close-button').click(function() {
          self.hideModal();
        });
      });
    }
  };

  self.addFormHandler = function(){
    $('#create-group-form').submit(function(event) {
      event.preventDefault();
      var roomJid = $('#create-group-form-name').val() + '@conference.powerhrg.com';
      if(roomJid != '@conference.powerhrg.com') {
        Candy.Core.Action.Jabber.Room.Join(roomJid, null);
      }
      self.hideModal();
    });
  }

  self.hideModal = function(){
    $('#group-form-wrapper').addClass('hidden');
    $('#group-form-wrapper').removeClass('show');
  }

  self.showModal = function(){
    $('#group-form-wrapper').removeClass('hidden');
    $('#group-form-wrapper').addClass('show');
    self.addFormHandler();
  }

  self.addModal = function(){
    if($('#group-form-wrapper').length == 0) {
      var modal_html = '<div id="group-form-wrapper" class="hidden group-form"><div class="inner-wrapper"><div class="inner-inner-wrapper"><form id="create-group-form"><div class="close-button">X</div><p>Name:</p><input type="text" name="room-name" id="create-group-form-name" /><button type="submit">Create</button></form></div></div></div>';
      $('#candy').after(modal_html);
    }
  };

  return self;
}(CandyShop.CreateRoom || {}, Candy, jQuery));
