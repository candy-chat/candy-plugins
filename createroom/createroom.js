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
      self.appendButton();
    });
  };

  self.appendButton = function(){
    if ($('#create-group').length === 0) {
      $('#chat-tabs').after(self.Template.create_button);
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

    $('#create-group-form').submit(function(event) {
      event.preventDefault();
      if ($('#create-group-form-name').val() === '') {
        // Notify that group name cannot be blank.
        $('.form-group.group-form-name-group').addClass('has-error');
        // Remove classes after user either starts typing or has pasted in a name.
        $('#create-group-form-name').focus(function() {
          $('.form-group.group-form-name-group').removeClass('has-error');
        });
      } else {
        var room_name = $('#create-group-form-name').val().trim();
        // Create a valid roomjid.
        var room_jid = room_name.replace(/[^A-Z0-9]+/ig, "_").toLowerCase() + '@conference.' +
                       Candy.Core.getConnection().domain;

        // Once we've joined the room, send configuration information.
        $(Candy).on('candy:view.room.after-add', function(ev, obj) {
          if (obj.roomJid.toUpperCase() === room_jid.toUpperCase()) {
            // Configuration items for setting room name.
            var config_form_type = $build('field', { 'var': 'FORM_TYPE' })
                                    .c('value').t('http://jabber.org/protocol/muc#roomconfig');
            var config_room_name = $build('field', { 'var': 'muc#roomconfig_roomname' }).c('value').t(room_name);
            var config = [config_form_type.tree(), config_room_name.tree()];
            // Send the configuration form to the server, and on success update our DOM.
            Candy.Core.getConnection().muc.saveConfiguration(room_jid, config, function(stanza) {
              var jid = $(stanza).attr('from');
              if (jid === room_jid) {
                Candy.View.Pane.Chat.getTab(room_jid).find('.label').html(room_name);
              }
            });
          }
        });

        // Join the room and close the modal.
        Candy.Core.Action.Jabber.Room.Join(room_jid, null);
        Candy.View.Pane.Chat.Modal.hide();
      }
    });
  };

  self.showModal = function(){
    Candy.View.Pane.Chat.Modal.show(self.Template.modal_form, true, false);
    self.addFormHandler();
  };

  self.Template = {
    create_button: '<div id="create-group"><div class="click">+ Create Room</div></div>',
    modal_form: '<h4>Create Room</h4><form id="create-group-form">' +
                '<div class="form-group group-form-name-group">' +
                '<label for="create-group-form-name" class="control-label">Name:</label>' +
                '<input class="form-control" type="text" name="room-name" id="create-group-form-name" />' +
                '</div><button type="submit">Create</button></form>'
  };

  return self;
}(CandyShop.CreateRoom || {}, Candy, jQuery));
