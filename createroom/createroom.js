/** File: createroom.js
 * Candy Plugin Create Room
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

/* global Candy, jQuery */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.CreateRoom = (function(self, Candy, $) {
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
    if($('#create-group').length === 0) {
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
      if($('#create-group-form-name').val() === '') {
        // Notify that group name cannot be blank.
        var warning_html = '<label class="control-label" for="create-group-form-name">Name cannot be blank.</label>';
        $('#create-group-form-name').before(warning_html);
        $('.form-group.group-form-name-group').addClass('has-error');
        // Remove classes after user either starts typing or has pasted in a name.
        $('#create-group-form-name').focus(function() {
          $('.form-group.group-form-name-group').removeClass('has-error');
          $('.form-group.group-form-name-group label').remove();
        });
      } else {
        var roomJid = $('#create-group-form-name').val() + '@conference.' + Candy.Core.getConnection().domain;
        Candy.Core.Action.Jabber.Room.Join(roomJid, null);
        self.hideModal();
      }
    });
  };

  self.hideModal = function(){
    $('#group-form-wrapper').addClass('hidden');
    $('#group-form-wrapper').removeClass('show');
  };

  self.showModal = function(){
    $('#group-form-wrapper').removeClass('hidden');
    $('#group-form-wrapper').addClass('show');
    self.addFormHandler();
  };

  self.addModal = function(){
    if($('#group-form-wrapper').length === 0) {
      var modal_html = '<div id="group-form-wrapper" class="hidden group-form"><div class="inner-wrapper"><div class="inner-inner-wrapper"><form id="create-group-form"><div class="close-button">X</div><p>Name:</p><div class="form-group group-form-name-group"><input class="form-control" type="text" name="room-name" id="create-group-form-name" /></div><button type="submit">Create</button></form></div></div></div>';
      $('#candy').after(modal_html);
    }
  };

  return self;
}(CandyShop.CreateRoom || {}, Candy, jQuery));
