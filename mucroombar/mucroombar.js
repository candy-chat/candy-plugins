/** File: mucroombar.js
 * Candy Plugin Auto-Join Incoming MUC Invites
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.RoomBar = (function(self, Candy, $) {
  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Add MUC Management Bar
   *  (Float) version - Candy Plugin Add MUC Management Bar
   */
  self.about = {
    name: 'Candy Plugin Add MUC Management Bar',
    version: '1.0'
  };

  /**
   * Initializes the RoomBar plugin with the default settings.
   */
  self.init = function(){
    // Add a room bar when the room is first created.
    $(Candy).on('candy:view.room.after-show', function(ev, obj) {
      CandyShop.RoomBar.addRoomBar(obj);
      return undefined;
    });

    // Change the topic in the roombar when it is changed.
    $(Candy).on('candy:view.room.after-subject-change', function(ev, obj) {
      CandyShop.RoomBar.showTopic(obj.subject, obj.element);
    });
  };

  self.addRoomBar = function(obj){
    if($('div.room-pane.roomtype-groupchat[data-roomjid="' + obj.roomJid + '"] .message-pane-wrapper .roombar').length === 0) {
      var roombar_html = '<div class="roombar"><div class="topic"></div></div>';
      $('div.room-pane.roomtype-groupchat[data-roomjid="' + obj.roomJid + '"] .message-pane-wrapper').prepend(roombar_html);
    }
    $('#' + obj.element.context.id + ' .message-pane-wrapper .roombar .topic').click(function() {
      self.updateRoomTopic(obj.roomJid, obj.element, $(this).html());
    });
  };

  self.showTopic = function(topic, element) {
    $(element).find(' .message-pane-wrapper .roombar .topic').html(topic);
  }

  self.updateRoomTopic = function(roomJid, element, current_topic) {
    // If we're a room moderator, be able to edit the room topic.
    if(Candy.Core.getRoom(roomJid) !== null && Candy.Core.getRoom(roomJid).user !== null && Candy.Core.getRoom(roomJid).user.getRole() === 'moderator') {
      // If there isn't an active input for room topic already, create input interface.
      if($('#' + element.context.id + ' .message-pane-wrapper .roombar .topic input').length === 0) {
        // Replace topic with an input field
        if(current_topic === ' ') { current_topic = ''; }
        var field_html = '<input type="text" value="' + current_topic + '" />';
        $('#' + element.context.id + ' .message-pane-wrapper .roombar .topic').html(field_html);
        // Add focus to the new element.
        $('#' + element.context.id + ' .message-pane-wrapper .roombar .topic input').focus();
        // Set listener for on return press or lose focus.
        $('#' + element.context.id + ' .message-pane-wrapper .roombar .topic input').blur(function() {
          if(current_topic !== $(this).val()) {
            CandyShop.RoomBar.sendNewTopic(roomJid, $(this).val());
          } else {
            $('#' + element.context.id + ' .message-pane-wrapper .roombar .topic').html(current_topic);
          }
        });
        $('#' + element.context.id + ' .message-pane-wrapper .roombar .topic input').keypress(function(ev) {
          var keycode = (ev.keyCode ? ev.keyCode : ev.which);
          if(keycode === 13) {
            if(current_topic !== $(this).val()) {
              CandyShop.RoomBar.sendNewTopic(roomJid, $(this).val());
            } else {
              $('#' + element.context.id + ' .message-pane-wrapper .roombar .topic').html(current_topic);
            }
          }
        });
      }
    }
  }

  // Display the set topic modal and add submit handler.
  self.sendNewTopic = function(roomJid, topic) {
    if(topic === '') { topic = ' '; }
    // Even though it does the exact same thing, Candy.View.Pane.Room.setSubject(roomJid, topic) was not sending the stanza out.
    Candy.Core.getConnection().muc.setTopic(Candy.Util.escapeJid(roomJid), topic);
  }
  return self;
}(CandyShop.RoomBar || {}, Candy, jQuery));
