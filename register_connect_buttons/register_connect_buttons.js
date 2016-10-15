/** File: register_connect_buttons.js
 * Candy Plugin Register Connect Buttons
 * Author: Gérald Sédrati-Dinet <gibus@sedrati-dinet.net>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.RegisterConnectButtons = (function(self, Candy, $) {
  /** PrivateVariable: _deconnectionSrc
   * Origin of the connection: click on connect button, on register button, or other reason.
   */
	var _deconnectionSrc = null;

  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Register Connect Buttons
   *  (Float) version - Candy Plugin Register Connect Buttons
   */
  self.about = {
    name: 'Candy Plugin Register Connect Buttons',
    version: '0.1'
  };

  /**
   * Initializes the RegisterConnectButtons plugin with the default settings.
   */
  self.init = function(options){
    // Apply the supplied options to the defaults specified
    $.extend(true, self._options, options);

    // Add the translations
    self.applyTranslations();

    // Add buttons after joining the room
    $(Candy).on('candy:core.presence.room', function(event, eventData) {
      // Add buttons only when current user is joining the room
      if (eventData.action == 'join' && eventData.currentUser.getJid() == eventData.user.getJid()) {
        self.appendButtons(event, eventData);
      }
    });

    // Process deconnection to display proper modal form
    $(Candy).on('candy:view.connection.status-6', function() {
      if (self._deconnectionSrc != null) {
        // Display login form without any message when disconnected from connect button
        if (self._deconnectionSrc == 'connect-button') {
          Candy.View.Pane.Chat.Modal.showLoginForm();
        }
        // Display registration form when disconnected from register button
        else if (self._deconnectionSrc == 'register-button') {
          CandyShop.Register.init();
          CandyShop.Register.showRegistrationForm();
        }
        // Reset deconnection source
        self._deconnectionSrc = null;
        return false;
      }
      // Continue view process when not disconnected from connect nor register button
      else {
        return true;
      }
    });
  };

  self.appendButtons = function(event, eventData) {
    if (eventData.user.getRole() == 'visitor') {
      if ($('#register-connect-buttons').length === 0) {
        $('.message-form-wrapper').html(Mustache.to_html(self.Template.registerConnectButtons, {
          _registerConnectMsg: $.i18n._("registerConnectMsg"),
          _loginSubmit: $.i18n._("loginSubmit"),
          _registrationSubmit: $.i18n._("registrationSubmit")
        }));
      }

      $('#connect-button').click(function() {
        $('.message-form-wrapper').html(Mustache.to_html(self.Template.initialMsgForm, {
          _messageSubmit: $.i18n._('messageSubmit')
        }));
        self._deconnectionSrc = 'connect-button';
        self.leaveRoom();
      });
      $('#register-button').click(function() {
        self._deconnectionSrc = 'register-button';
        self.leaveRoom();
      });
    }
  };

  /** Function: leaveRoom
   * leaveRoom to disconnect visitor
   */
  self.leaveRoom = function() {
    var roomJid = Candy.View.getCurrent().roomJid,
    room = Candy.Core.getRoom(roomJid),
    roomName = room.getName(),
    roster = room.getRoster(),
    user = room.getUser() ? room.getUser() : Candy.Core.getUser();

    roster.remove(user.getJid());
    Candy.Core.removeRoom(roomJid);
    $(Candy).triggerHandler("candy:core.presence.leave", {
      roomJid: roomJid,
      roomName: roomName,
      type: 'leave',
      user: user
    });
  };

  /** Function: applyTranslations
   * Apply translations to this plugin
   */
  self.applyTranslations = function() {
    var registerTranslations = {
      'registerConnectMsg': {
        'en': "In order to discuss in the room, please register and login",
        'fr': "Pour discuter dans le salon, inscrivez-vous et connectez-vous"
      }
    };

    $.each(registerTranslations, function(key, val) {
      $.each(val, function(k, v) {
        if(Candy.View.Translation[k]) {
          Candy.View.Translation[k][key] = v;
        }
      });
    });
  };

  self.Template = {
    registerConnectButtons: '<div id="register-connect-buttons"><!--<div id="register-connect-msg">{{_registerConnectMsg}}</div>--><div id="connect-button" class="click">{{_loginSubmit}}</div><div id="register-button" class="click">{{_registrationSubmit}}</div>',
    initialMsgForm: '<form method="post" class="message-form">' +
            				'<input name="message" class="field" type="text" aria-label="Message Form Text Field" autocomplete="off" maxlength="1000" />' +
				            '<input type="submit" class="submit" name="submit" value="{{_messageSubmit}}" /></form>'
  };

  return self;
}(CandyShop.RegisterConnectButtons || {}, Candy, jQuery));
