/** File: createroom.js
 * Candy Plugin Create Room
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
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
    version: '1.0'
  };

  /**
   * Initializes the CreateRoom plugin with the default settings.
   */
  self.init = function(){
    $(Candy).on('candy:view.room.after-add', function() {
//      self.appendButton();
    });
  };

  self.appendButton = function(){
    if ($('#create-group').length === 0) {
      var createRoomHtml = '<div id="create-group"><div class="click">+ Create Room</div></div>';
      $('#chat-tabs').after(createRoomHtml);
      $('#create-group').click(function () {
        self.showModal();
        $('#create-group-form').click(function(event) {
          event.stopPropagation();
        });
      });
    }
  };

  self.addFormHandler = function(){
    // Add focus to the form element when it's shown.
    $('#create-group-form-name').focus();

    $('#create-room-link').click(function(){
      $('#create-group-form').submit();
    });

    // When we press the enter/return key in the form, submit the form.
    $('#create-group-form input').keypress(function(event) {
      if (event.which === 13 || event.keyCode === 13) {
        event.preventDefault();
        $('#create-group-form').submit();
      }
    });

    $('#create-group-form').submit(function(event) {
      event.preventDefault();
      if ($('#create-group-form-name').val() === '') {
        // Notify that group name cannot be blank.
        $('#create-group-form-name').addClass('has-error');
        $('#create-room-error-dialog').html('Room name cannot be blank').removeClass('hide');
        // Remove classes after user either starts typing or has pasted in a name.
        $('#create-group-form-name').focus(function() {
          $('#create-group-form-name').removeClass('has-error');
          $('#create-room-error-dialog').html('').addClass('hide');
        });
      } else {
        var roomName = $('#create-group-form-name').val().trim();
        var roomTopic = $('#create-group-form-topic').val().trim();
        var isPrivate = $('#create-group-form-is_private').prop('checked') ? 1 : 0;

        // Create a valid conference domain.
        var conferenceDomain = '@' + Candy.Core.getOptions().conferenceDomain + '.' + Candy.Core.getConnection().domain;

        // Create a valid roomjid.
        var roomJid = roomName.replace(/[^A-Z0-9]+/ig, '_').toLowerCase() + conferenceDomain;

        // Once we've joined the room, send configuration information.
        $(Candy).on('candy:view.room.after-add', function(ev, obj) {
          if (obj.roomJid.toUpperCase() === roomJid.toUpperCase()) {
            // Configuration items for setting room name.
            var configFormType = $build('field', { 'var': 'FORM_TYPE' })
                                    .c('value').t('http://jabber.org/protocol/muc#roomconfig');
            var configRoomName = $build('field', { 'var': 'muc#roomconfig_roomname' }).c('value').t(roomName);
            var configRoomMembersOnly = $build('field', { 'var': 'much#roomconfig_membersonly' }).c('value').t(isPrivate);
            var config = [configFormType.tree(), configRoomName.tree(), configRoomMembersOnly.tree()];

            // Send the configuration form to the server, and on success update our DOM.
            Candy.Core.log('[CandyShop CreateRoom] sending new room configuration for ' + roomJid);
            Candy.Core.getConnection().muc.saveConfiguration(roomJid, config, function(stanza) {
              var jid = $(stanza).attr('from');

              if (jid === roomJid) {
                Candy.View.Pane.Chat.getTab(roomJid).find('.room-label').html(roomName);
                Candy.Core.Action.Jabber.Room.Admin.SetSubject(roomJid, roomTopic);
              }

              if (isPrivate) {
                Candy.View.Pane.Chat.getTab(roomJid).find('i.connect-group-chat-icon').removeClass('connect-group-chat-icon').addClass('fa fa-lock');
              }

              // Add it to the roomlist in leftpanehead
              if (typeof CandyShop.LeftPaneHead === 'object') {
                CandyShop.LeftPaneHead.RoomList.AddRoom(roomJid, roomName, isPrivate);
              }
            });
          }
        });

        Candy.Core.log('[CandyShop CreateRoom] joining room created through form: ' + roomJid);
        // Join the room and close the modal.
        // Candy.Core.Action.Jabber.Room.Join(roomJid, null);
        CandyShop.JoinOnResponse.joinRoom({ roomJid: roomJid, isPrivate: !!isPrivate, topic: roomTopic }, true);
        Candy.View.Pane.Chat.Modal.hide();
      }
    });
  };

  self.showModal = function(){
    var filterString = $('#candy .room-list-filter').val()
    var templateData = {
      create_private_room_permission: CONNECT_PERMISSIONS.create_private_room
    };
    Candy.View.Pane.Chat.Modal.show(Mustache.to_html(self.Template.modalForm, templateData), true, false);
    // Default the new room name to whatever they were looking for
    $('#create-group-form-name').val(filterString);
    self.addFormHandler();
  };

  self.Template = {
    modalForm: '<div class="modal-head">Create Room</div>' +
      '<div class="modal-body">' +
        '<div class="alert alert-danger hide" id="create-room-error-dialog"></div>' +
          '<form id="create-group-form">' +
            '<div class="form-group group-form-name-group">' +
              '<input class="modal-form-input" type="text" name="room-name" placeholder="Room Name" id="create-group-form-name" />' +
              '<input class="modal-form-input" type="text" name="room-topic" placeholder="Room Topic" id="create-group-form-topic" />' +
              '{{#create_private_room_permission}}Private <input class="modal-form-input" type="checkbox" name="room-is_private" id="create-group-form-is_private" />{{/create_private_room_permission}}' +
            '</div>' +
          '</form>' +
        '</div>' +
      '<div class="modal-foot"><button class="btn btn-xs btn-primary" id="create-room-link">Create Room</button></div>'
  };

  return self;
}(CandyShop.CreateRoom || {}, Candy, jQuery));
