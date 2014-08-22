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

  /**
   * Initializes the LeftTabs plugin with the default settings.
   */
  self.init = function(){
    // Override the scrollToBottom method since our DOM is changed.
    Candy.View.Pane.Room.scrollToBottom = function(roomJid) {
      var messagePane = Candy.View.Pane.Room.getPane(roomJid, '.message-pane');
      messagePane.scrollTop(messagePane.prop('scrollHeight'));
    };

    Candy.View.Translation.en.dateFormat = 'mm/dd/yyyy';
    Candy.View.Translation.en.timeFormat = 'h:MM tt';
    Candy.View.Template.Roster = {
      pane: '<div class="pane-heading"><span class="title">People</span></div><div class="search-roster hide"><div class="input-group"><input type="text" class="form-control" placeholder="Search" id="search-roster-value" data-toggle="tooltip" title="Searches either name or jid!"><span class="input-group-btn"><button class="btn btn-default" type="button" id="search-roster-value-btn"><i class="glyphicon glyphicon-remove"></i></button></span></div></div><div class="roster-pane"></div>',
      user: '<div class="user role-{{role}} affiliation-{{affiliation}}{{#me}} me{{/me}}"' +
          ' id="user-{{roomId}}-{{userId}}" data-jid="{{userJid}}" data-real-jid="{{realJid}}"' +
          ' data-nick="{{nick}}" data-role="{{role}}" data-affiliation="{{affiliation}}">' +
           '<span class="context" id="context-{{roomId}}-{{userId}}">&#x25BE;</span>&nbsp;' +
          '<div class="label">{{displayNick}}</div><ul>' +
          '<li class="role role-{{role}} affiliation-{{affiliation}}" data-tooltip="{{tooltipRole}}"></li>' +
          '<li class="ignore" data-tooltip="{{tooltipIgnored}}"></li></ul></div>'
    };
    Candy.View.Template.Message = {
      pane: '<div class="message-pane-wrapper"><ul class="message-pane"></ul></div>',
      item: '<li class="message">' +
            '<a class="label name" href="#">{{displayName}}</a>' +
            '<span class="label timestamp">{{time}}</span>' +
            '<span class="message-body">{{{message}}}</span>' +
            '</li>'
    };
    Candy.View.Template.Room = {
      pane: '<div class="room-pane roomtype-{{roomType}}" id="chat-room-{{roomId}}" data-roomjid="{{roomJid}}" data-roomtype="{{roomType}}">' +
        '<div class="col-md-9 full-height">{{> messages}}{{> form}}</div><div class="col-md-3 full-height roster-wrapper">{{> roster}}</div></div>',
      subject: '<li class="message subject">' +
               '<span class="label timestamp">{{time}}</span>' +
               '<span class="message-body">{{_roomSubject}} {{{subject}}}</span>' +
                '</li>',
      form: '<div class="message-form-wrapper">' +
          '<form method="post" class="message-form">' +
          '<input name="message" class="field" type="text" aria-label="Message Form Text Field" autocomplete="off" maxlength="1000" />' +
          '<input type="submit" class="submit" name="submit" value="{{_messageSubmit}}" />' +
          '</form>' +
          '</div>'
    };
    Candy.View.Template.Chat = {
      pane: '<div class="row" id="chat-pane">{{> tabs}}{{> rooms}}{{> toolbar}}</div>{{> modal}}',
      rooms: '<div id="chat-rooms-wrapper" class="col-md-10 full-height"><div id="chat-rooms" class="row rooms"></div></div>',
      tabs: '<div id="left-menu-wrapper" class="col-md-2 full-height"><div class="pane-heading">Chats</div><ul id="chat-tabs" class="nav nav-tabs nav-stacked"></ul></div>',
      tab: '<li class="roomtype-{{roomType}}" data-roomjid="{{roomJid}}" data-roomtype="{{roomType}}">' +
          '<a href="#" class="close">\u00D7</a>' +
          '<a href="#" class="label">{{#privateUserChat}}<span class="glyphicon glyphicon-user"></span> {{/privateUserChat}}{{name}}</a>' +
          '<small class="unread"></small></li>',
      modal: '<div id="chat-modal"><a id="admin-message-cancel" class="close" href="#">\u00D7</a>' +
          '<span id="chat-modal-body"></span>' +
          '<img src="{{assetsPath}}img/modal-spinner.gif" id="chat-modal-spinner" />' +
          '</div><div id="chat-modal-overlay"></div>',
      adminMessage: '<li class="message adminmessage">' +
                    '<span class="label">{{sender}}</span>' +
                    '<span class="label timestamp">{{time}}</span>' +
                    '<span class="message-body">{{subject}} {{{message}}}</span>' +
                    '</li>',
      infoMessage: '<li class="message infomessage">' +
                    '<span class="label timestamp">{{time}}</span>' +
                    '<span class="message-body">{{subject}} {{{message}}}</span>' +
                    '</li>',
      toolbar: '<ul id="chat-toolbar">' +
          '<li id="emoticons-icon" data-tooltip="{{tooltipEmoticons}}"><span class="glyphicon glyphicon-asterisk"></span></li>' +
          '<li id="chat-sound-control" class="checked" data-tooltip="{{tooltipSound}}"><span class="glyphicon glyphicon-volume-up"></span><span class="glyphicon glyphicon-volume-off"></span>{{> soundcontrol}}</li>' +
          '<li id="chat-autoscroll-control" class="checked" data-tooltip="{{tooltipAutoscroll}}"><span class="glyphicon glyphicon-arrow-down"></span><span class="glyphicon glyphicon-ban-circle"></span></li>' +
          '<li class="checked" id="chat-statusmessage-control" data-tooltip="{{tooltipStatusmessage}}"><span class="glyphicon glyphicon-info-sign"></span><span class="glyphicon glyphicon-ban-circle"></span></li>' +
          '<li class="context" data-tooltip="{{tooltipAdministration}}"></li>' +
          '<li class="usercount" data-tooltip="{{tooltipUsercount}}"><span class="glyphicon glyphicon-user"></span>' +
          '<span id="chat-usercount"></span></li></ul>',
      soundcontrol: '<script type="text/javascript">var audioplayerListener = new Object();' +
              ' audioplayerListener.onInit = function() { };' +
              '</script><object id="chat-sound-player" type="application/x-shockwave-flash" data="{{assetsPath}}audioplayer.swf"' +
              ' width="0" height="0"><param name="movie" value="{{assetsPath}}audioplayer.swf" /><param name="AllowScriptAccess"' +
              ' value="always" /><param name="FlashVars" value="listener=audioplayerListener&amp;mp3={{assetsPath}}notify.mp3" />' +
              '</object>',
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

    $(Candy).on('candy:view.room.after-add', function() {
      if(typeof CandyShop.CreateRoom === "object") {
        self.createRoomPluginCompatibility();
        self.resetHeight();
      }
    });

    $(Candy).on('candy:view.connection.status-5', self.scheduleResetHeight);
    $(Candy).on('candy:view.connection.status-8', self.scheduleResetHeight);

    $(window).resize(function() {
      if($(window).width() > 992) {
        self.resetHeight();
      } else {
        self.resetHeight('100%');
      }
    });
  };

  self.scheduleResetHeight = function() {
    // FIXME: Is there a better way?!
    // This happens before the roster loads, but the only roster callback we get would be invoked once for each roster entry, which is far too much.
    // Use this hack to correct the viewport a few seconds after login, just in case.
    setTimeout(self.resetHeight, 10000);
  };

  self.createRoomPluginCompatibility = function() {
    $('#create-group-form button').addClass('btn');
    $('#create-group-form .close-button').html('<span class="glyphicon glyphicon-remove"></span>');
  };

  self.resetHeight = function(value) {
    if (typeof value === 'undefined' || value === '') {
      value = $(window).height();
    }
    $('.full-height').css({height: value});
  };

  return self;
}(CandyShop.LeftTabs || {}, Candy, jQuery));
