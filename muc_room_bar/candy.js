/** File: mucroombar.js
 * Candy Plugin Add MUC Management Bar
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 *
 * Compatible with CandyShop.MobileDisplay
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

  self._options = {
    clickToSetTopicMessage: 'Click here to set the topic.',
    noTopicSetMessage: 'No topic set.'
  };

  /**
   * Initializes the RoomBar plugin with the default settings.
   */
  self.init = function(options){
    // apply the supplied options to the defaults specified
    $.extend(true, self._options, options);

    // Add a room bar when the room is first created.
    $(Candy).on('candy:view.room.after-add', function(ev, obj) {
      CandyShop.RoomBar.addRoomBar(obj);
      CandyShop.RoomBar.appendInviteUsersButton(obj.roomJid);
      return undefined;
    });

    // Change the topic in the roombar when it is changed.
    $(Candy).on('candy:view.room.after-subject-change', function(ev, obj) {
      Candy.Core.log('[CandyShop RoomBar] recieved subject change for ' + obj.roomJid + ' to "' + obj.subject + '".');
      CandyShop.RoomBar.showTopic(obj.roomJid, obj.subject, obj.element);
    });

    // Remove the now-useless "Change Subject" menu item
    $(Candy).on('candy:view.roster.context-menu', function (ev, obj) {
      delete obj.menulinks.subject;
    });
  };

  self.addRoomBar = function(obj){
    if (obj.element.hasClass('roomtype-groupchat') || obj.element.hasClass('roomtype-chat')) {
      var roombarHtml;
      if (obj.element.hasClass('roomtype-chat')) {
        // one-on-one chat
        roombarHtml = self.Template.individual_roombar;
      } else {
        // group chat
        roombarHtml = self.Template.roombar;
      }
      obj.element.find('.message-pane-wrapper').prepend(roombarHtml + self.Template.historyloaded);
      if (typeof CandyShop.LeftPaneHead === 'object') {
        obj.element.find('.message-pane-wrapper .roombar .roomname').html(CandyShop.LeftPaneHead.getRoomName(obj.roomJid))
      } else {
        var roomName = $('#tab-'+obj.element[0].id+' .room-label').html();
        obj.element.find('.message-pane-wrapper .roombar .roomname').html(roomName);
      }
    }

    var element = '#' + obj.element.attr('id');
    self.showTopic(obj.roomJid, undefined, element);

    $(element + ' .message-pane-wrapper .roombar .topic').click(function() {
      var _this = $(this);
      if (_this.has('input').length === 0) {
        self.updateRoomTopic(obj.roomJid, obj.element.attr('id'), _this.html());
      }
    });
  };

  self.showTopic = function(roomJid, topic, element) {
    var isModerator = Candy.Core.getRoom(roomJid) !== null && Candy.Core.getRoom(roomJid).user !== null && Candy.Core.getRoom(roomJid).user.getRole() === 'moderator' ? true : false;

    if (!topic || topic.trim() === '') {
      topic = isModerator ? self._options.clickToSetTopicMessage : self._options.noTopicSetMessage;
      $(element).find('.message-pane-wrapper .roombar .topic').addClass('no-topic-set');
    }

    if (isModerator) {
      $(element).find('.message-pane-wrapper .roombar .topic').addClass('is-moderator');
    }

    $(element).find('.message-pane-wrapper .roombar .topic').html(topic);

    // FIXME: this CSS needs to be fixed so that we don't need to add an invisible space just to line up nicely.
    // see also: mobiledisplay.js
    if (CandyShop.MobileDisplay) {
      topic = topic || '&nbsp;';
      $('#mobile-top-bar .mobile-top-bar-roomtopic').html(topic);
    }
  };

  self.updateRoomTopic = function(roomJid, elementId, currentTopic) {
    // If we're a room moderator, be able to edit the room topic.
    if (Candy.Core.getRoom(roomJid) !== null && Candy.Core.getRoom(roomJid).user !== null && Candy.Core.getRoom(roomJid).user.getRole() === 'moderator') {
      // If there isn't an active input for room topic already, create input interface.
      if ($('#' + elementId + '.message-pane-wrapper .roombar .topic input').length === 0) {
        // Replace topic with an input field
        if (currentTopic.trim() === '' || currentTopic === self._options.clickToSetTopicMessage) { currentTopic = ''; }
        var field_html = '<input type="text" value="' + currentTopic + '" />';
        $('#' + elementId + ' .message-pane-wrapper .roombar .topic').html(field_html);
        // Add focus to the new element.
        var input = $('#' + elementId + ' .message-pane-wrapper .roombar .topic input');
        input.focus();
        input.select();
        // Set listener for on return press or lose focus.
        input.blur(function() {
          if(currentTopic !== $(this).val()) {
            CandyShop.RoomBar.sendNewTopic(roomJid, $(this).val());
          } else {
            $('#' + elementId + ' .message-pane-wrapper .roombar .topic').html(currentTopic);
          }
        });
        input.keydown(function(ev) {
          var keycode = (ev.keyCode ? ev.keyCode : ev.which);
          switch(keycode) {
          case 13: //enter key
            if(currentTopic !== $(this).val()) {
              CandyShop.RoomBar.sendNewTopic(roomJid, $(this).val());
            } else {
              $('#' + elementId + ' .message-pane-wrapper .roombar .topic').html(currentTopic);
            }
            break;
          case 27: // escape key
            $('#' + elementId + ' .message-pane-wrapper .roombar .topic').html(currentTopic);
            break;
          }
        });
      }
    }
  };

  self.appendInviteUsersButton = function(roomJid) {
    var pane_heading = $('#chat-rooms > div.roomtype-groupchat[data-roomjid="' + roomJid + '"] .roster-wrapper .pane-heading');
    if ($(pane_heading).find('.invite-users').length === 0) {
      var html = self.Template.invite_button;
      $(pane_heading).append(html);
      $(pane_heading).find('.invite-users').click(function() {
        CandyShop.UserSearch.showUserSearchModal(roomJid);
      });
    }
  };

  // Display the set topic modal and add submit handler.
  self.sendNewTopic = function(roomJid, topic) {
    if (topic === '') {
      topic = ' ';
    }

    Candy.Core.log('[CandyShop RoomBar] sending new topic of "' + topic + '" for ' + roomJid);
    // Even though it does the exact same thing, Candy.View.Pane.Room.setSubject(roomJid, topic) was not sending the stanza out.
    Candy.Core.getConnection().muc.setTopic(Candy.Util.escapeJid(roomJid), topic);
  };

  self.Template = {
    roombar: '<div class="roombar">' +
      '  <div class="roomname"></div>' +
      '  <div class="topic"></div>' +
      '</div>',
    individual_roombar: '<div class="roombar individual_roombar">' +
      '<div class="roomname individual_roomname"></div>' +
      '</div>',
    historyloaded: '<div class="history-loaded">Your history was successfully loaded</div>',
    invite_button: '<button class="invite-users btn btn-default btn-sm">Invite Users</button>'
  };

  return self;
}(CandyShop.RoomBar || {}, Candy, jQuery));
