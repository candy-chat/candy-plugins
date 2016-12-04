/** File: lefttabs.js
 * Candy Plugin Left Tabs + Bootstrap3 Layout
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.LeftTabs = (function(self, Candy, $) {
  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Layout with Left Tabs + Bootstrap3
   *  (Float) version - Candy Plugin Layout with Left Tabs + Bootstrap3
   */
  self.about = {
    name: 'Candy Plugin Layout with Left Tabs + Bootstrap3',
    version: '1.0'
  };

  self.autoScroll = true;

  /**
   * Initializes the LeftTabs plugin with the default settings.
   */
  self.init = function(){
    // Attempt to detect when a mobile keyboard is shown and adjust the height
    $(Candy).on('candy:view.room.after-add', function(ev, obj) {
      var form = obj.element.find('form.message-form'),
          input = form.find('textarea[name="message"]'),
          messagePane = obj.element.find('.message-pane'),

          resetHeightOfPane = function (messagePane, height) {
            messagePane.height('calc(100% - ' + (height || input.outerHeight()) + 'px)');

            return {
              andScrollToBottom: function () {
                messagePane.scrollTop(messagePane[0].scrollHeight);
              }
            };
          };

      resetHeightOfPane(messagePane);

      form.bind('submit', function(e) {
        var roomPane = $(e.target).closest('.room-pane');
        var messagePane = $('.message-pane', roomPane);

        resetHeightOfPane(messagePane).andScrollToBottom();
      });

      input.bind('focus', self.resetHeight);
      input.bind('blur',  self.resetHeight);

      input.on('input', $.throttle(500, function() {
        this.style.height = '2em';
        var newHeight = Math.min(this.scrollHeight, '168') + 'px';
        this.style.height = newHeight;

        var messagePane = $('.room-pane[data-roomjid="' + Candy.View.getCurrent().roomJid + '"] .message-pane-wrapper .message-pane');
        resetHeightOfPane(messagePane, newHeight)

      })).on('keydown', function(ev) {
        if (ev.which === 13) { // enter
          if (input.data('ready-to-send')) {
            form.submit();
          } else {
            // Allow other plugins to delay sending of the message
            ev.preventDefault();
          }
          return false;
        }
      });


      form.on('submit', function(ev) {
        $(ev.currentTarget).find('textarea').css('height', '2em');
        resetHeightOfPane(messagePane);
      });

      // Hide emoticons option for now.
      obj.element.find('#emoticons-icon').hide();

      $(Candy).on('candy:view.connection.status-' + Strophe.Status.CONNFAIL, function() {
        sweetAlert({
          customClass: 'status-2',
          title: 'Whoops!',
          text: 'Connection failed, reconnecting...'
        });
        return false;
      });

      $(Candy).on('candy:view.connection.status-' + Strophe.Status.CONNECTED, function() {
        if ($('.sweet-alert.status-2').length > 0) {
          sweetAlert.close();
        }
      })
    });

    $(Candy).on('candy:view.room.after-show', function(ev, obj) {
      var messagePane = obj.element.find('.message-pane');
      self.adjustTextareaWidth(messagePane);
    });

    // Monkeypatch: No need to calculate width for vertically-stacked tabs
    // CSS fixes it at 100%
    Candy.View.Pane.Chat.fitTabs = function() { return; }

    Candy.View.Translation.en.dateFormat = 'mmm-dd h:MM tt';
    Candy.View.Translation.en.timeFormat = 'h:MM tt';

    Candy.View.Template.Roster = {
      pane: '<div class="pane-heading menu-main-head"><span class="title">People</span></div><div class="roster-pane directory-listing"></div>',
      user: '<div class="user role-{{role}} affiliation-{{affiliation}}{{#me}} me{{/me}}"' +
          ' id="user-{{roomId}}-{{userId}}" data-jid="{{userJid}}" data-real-jid="{{realJid}}"' +
          ' data-nick="{{nick}}" data-role="{{role}}" data-affiliation="{{affiliation}}" data-status="{{status}}">' +
          '<span class="context" id="context-{{roomId}}-{{userId}}">&#x25BE;</span>&nbsp;' +
          '<i class="roster-status {{status}}" data-real-jid="{{realJid}}">{{displayNick}}</i>' +
          '<ul><li class="role role-{{role}} affiliation-{{affiliation}}" data-tooltip="{{tooltipRole}}"></li>' +
          '<li class="ignore" data-tooltip="{{tooltipIgnored}}"></li></ul></div>'
    };
    Candy.View.Template.Message = {
      pane: '<div class="message-pane-wrapper"><ul class="message-pane"></ul></div>',
      item: '<li class="message normal-message row {{isMe}}" data-message-id="{{id}}" data-sender="{{from}}" data-sender-name="{{displayName}}" data-timestamp="{{timestamp}}"><div class="col-md-1">{{{avatar}}}</div>' +
            '<div class="col-md-11 message-bubble"><div class="upper"><a class="label name" href="#">{{displayName}}</a>' +
            '<span class="label timestamp">{{time}}</span></div><span class="message-body">{{{message}}}</span>' +
            '</div></li>'
    };

    Candy.View.Template.Room = {
      pane: '<div class="room-pane roomtype-{{roomType}}" id="chat-room-{{roomId}}" data-roomjid="{{roomJid}}" data-roomtype="{{roomType}}">' +
            '<div class="col-md-9 col-xs-8 full-height">{{> messages}}{{> form}}</div>' +
            '<div class="col-md-3 col-xs-4 full-height roster-wrapper">{{> roster}}</div></div>',
      subject: '<li class="message subject">' +
               '<span class="label timestamp" data-timestamp="{{timestamp}}">{{time}}</span>' +
               '<span class="message-body">{{_roomSubject}} {{{subject}}}</span>' +
                '</li>',
      form: '<div class="message-form-wrapper">' +
          '<form method="post" class="message-form">' +
          '<a id="emoticons-icon"><span class="smiley-face">&#9786</span></a>' +
          '<textarea name="message" class="field form-control" aria-label="Message Form Text Field" autocomplete="off" placeholder="Type a Message" data-ready-to-send=true></textarea>' +
          '</form>' +
          '</div>'
    };


    Candy.View.Template.Chat = {
      pane: '<div id="chat-pane">' +
        '</div>' +
        '<div class="row">{{> tabs}}{{> rooms}}</div>' +
        '{{> toolbar}}{{> modal}}',
      rooms: '<div id="chat-rooms-wrapper" class="col-xs-9 full-height"><div id="chat-rooms" class="row rooms"></div></div>',
      tabs: '<div id="left-menu-wrapper" class="col-xs-3 full-height"><div id="mobile-rooms-header" class="menu-main-head pane-heading"><span class="title">Conversations</span></div><ul id="chat-tabs" class="nav nav-tabs nav-stacked">' +
        '<li id="rooms-head" class="nav-head" style="position:relative;"><div class="pull-left">Rooms</div><div class="more pull-right" id="rooms-icon">More</div></li><li id="people-head" class="nav-head"><div class="pull-left">People</div></li></ul></div>',
      tab: '<li class="roomtype-{{roomType}}" data-roomjid="{{roomJid}}" data-roomtype="{{roomType}}" id="tab-chat-room-{{roomId}}">' +
          '<i class="connect-group-chat-icon pull-left"></i><a href="#" class="close"><i class="fa fa-close pull-right"></i></a>' +
          '<div class="mentions-div"></div>' +
          '<div class="room-label-div" title="{{name}}" data-real-jid="{{realJid}}">'+
            '<p class="room-label">{{name}}</p>' +
            '<i class="roster-status {{status}}" data-real-jid="{{realJid}}"></i>' +
            '<span class="roster-status-text">{{formattedStatus}}</span>' +
          '</div>' +
          '<small class="unread" style="display: none;"></small></li>',
      modal: '<div id="chat-modal" tabindex="0"><a id="admin-message-cancel" class="close" href="#">\u00D7</a>' +
          '<span id="chat-modal-body"></span>' +
          '</div><div id="chat-modal-overlay"></div>',
      adminMessage: '<li class="message adminmessage">' +
                    '<span class="label">{{sender}}</span>' +
                    '<span class="label timestamp" data-timestamp="{{timestamp}}">{{time}}</span>' +
                    '<span class="message-body">{{subject}} {{{message}}}</span>' +
                    '</li>',
      infoMessage: '<li class="message infomessage">' +
                    '<span class="label timestamp" data-timestamp="{{timestamp}}">{{time}}</span>' +
                    '<span class="message-body">{{subject}} {{{message}}}</span>' +
                    '</li>',
      toolbar: '<ul id="chat-toolbar">' +
          '<li id="chat-sound-control" class="checked" data-tooltip="{{tooltipSound}}"><span class="glyphicon glyphicon-volume-up"></span><span class="glyphicon glyphicon-volume-off"></span></li>' +
          '<li class="checked" id="chat-statusmessage-control" data-tooltip="{{tooltipStatusmessage}}"><span class="glyphicon glyphicon-info-sign"></span><span class="glyphicon glyphicon-ban-circle"></span></li>' +
          '<li class="context" data-tooltip="{{tooltipAdministration}}"></li>' +
          '<li class="usercount" data-tooltip="{{tooltipUsercount}}"><span class="glyphicon glyphicon-user"></span>' +
          '<span id="chat-usercount"></span></li></ul>',
      Context: {
        menu: '<div id="context-menu"><i class="arrow arrow-top"></i>' +
          '<ul></ul><i class="arrow arrow-bottom"></i></div>',
        menulinks: '<li class="{{class}}" id="context-menu-{{id}}">{{label}}</li>',
        contextModalForm: '<form action="#" id="context-modal-form">' +
                '<label for="context-modal-label">{{_label}}</label>' +
                '<input type="text" name="contextModalField" id="context-modal-field" />' +
                '<input type="submit" class="button" name="send" value="{{_submit}}" /></form>',
        adminMessageReason: '<a id="admin-message-cancel" class="close" href="#">×</a>' +
                '<p>{{_action}}</p>{{#reason}}<p>{{_reason}}</p>{{/reason}}'
      },
      tooltip: '<div id="tooltip"><i class="arrow arrow-top"></i>' +
            '<div></div><i class="arrow arrow-bottom"></i></div>'
    };

    $(Candy).on('candy:view.room.after-add', function(ev, room) {
      if (typeof CandyShop.CreateRoom === 'object') {
        self.resetHeight();

        var roomId = '#tab-' + room.element[0].id;

        if (room.type === 'groupchat'){
          // Rooms stay above the divider
          $('#chat-tabs #people-head').before($(roomId));
          if (typeof CandyShop.LeftPaneHead === 'object') {
            // See if it's a private/members-only muc, if so give it a lock icon.
            if (CandyShop.LeftPaneHead.isMembersOnly(room.roomJid)) {
              $(roomId + ' i.connect-group-chat-icon').removeClass('connect-group-chat-icon').addClass('fa fa-lock');
            }
          }
        } else if (room.type === 'chat'){
          // Personal rooms move  below to people tabs
          $('#chat-tabs').append($(roomId));
          $(roomId + ' i.connect-group-chat-icon').removeClass('connect-group-chat-icon').addClass('fa fa-user');
        }
      }
    });

    $(Candy).on('candy:view.connection.status-' + Strophe.Status.CONNECTED, self.scheduleResetHeight);
    $(Candy).on('candy:view.connection.status-' + Strophe.Status.ATTACHED, self.scheduleResetHeight);

    $(window).resize(function() {
      self.resetHeight();
      self.adjustTextareaWidth();
    });
  };

  self.scheduleResetHeight = function(timeout) {
    timeout = timeout || 10000
    // FIXME: Is there a better way?!
    // This happens before the roster loads, but the only roster callback we get would be invoked once for each roster entry, which is far too much.
    // Use this hack to correct the viewport a few seconds after login, just in case.
    setTimeout(self.resetHeight, timeout);
  };

  self.resetHeight = function(value) {
    if (typeof value === 'undefined' || value === '') {
      value = $(window).height();
    }
    value = value - $('#header.connect').height();
    $('.full-height').css({height: value});
  };

  self.adjustTextareaWidth = function(messagePane) {
    messagePane = messagePane || $('.room-pane[data-roomjid="' + Candy.View.getCurrent().roomJid + '"] .message-pane-wrapper .message-pane');
    $('textarea[name="message"]').width(messagePane.width() - 20); // margin/padding/border consideration
  };

  return self;
}(CandyShop.LeftTabs || {}, Candy, jQuery));
