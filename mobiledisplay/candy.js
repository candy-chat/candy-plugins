/** File: mobiledisplay.js
 * Candy Plugin Mobile Display
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.MobileDisplay = (function(self, Candy, $) {

  self._options = {
    smallnessThreshold: 620
  };

  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Auto-Join Incoming MUC Invites
   *  (Float) version - Candy Plugin Auto-Join Incoming MUC Invites
   */
  self.about = {
    name: 'Candy Plugin Auto-Join Incoming MUC Invites',
    version: '1.0'
  };

  /**
   * Initializes the MobileDisplay plugin with the default settings.
   */
  self.init = function(options) {
    // Apply the supplied options to the defaults specified
    $.extend(true, self._options, options);

    self.setup();
    self.resizeHandler();

    $(Candy).on('candy:view.connection.status-' + Strophe.Status.CONNECTED, self.setup);
    $(Candy).on('candy:view.connection.status-' + Strophe.Status.ATTACHED, self.setup);

    $(Candy).on('candy:view.message.after-show', self.handleNotifications);

    // Listen to the size of the window.
    $(window).resize($.debounce(250, self.resizeHandler));

    // Listen for the name of the room to keep it current.
    $(Candy).on('candy:view.room.after-show', self.resizeHandler);
    $(Candy).on('candy:view.private-room.after-open', self.resizeHandler);

    // Clear mention notifications on window focus.
    $(window).focus(self.clearNotifications);
  };

  self.setup = function() {
    // Add bar to dom.
    if ($('#mobile-top-bar').length === 0) {
      $('#header.connect').append(self.Template.chatbar);
    }
    self.initPikabu();
  };

  self.initPikabu = function() {
    if (typeof(self.pikabu) === 'undefined') {
      self.pikabu = new Pikabu({
        viewportSelector: '.body-connect',
        widths: {
          left: '90%',
          right: '90%'
        },
        selectors: {
          element: '#candy'
        },
        onOpened: function() {
          $('#mobile-top-bar').css({zIndex: 0});
        },
        onClosed: function() {
          $('#mobile-top-bar').css({zIndex: 1});
        }
      });
    }
  }

  self.resizeHandler = function() {
    self.clearNotifications();
    if ($(window).width() < self._options.smallnessThreshold) {
      Candy.Core.log('[CandyShop MobileDisplay] switching to mobile view.');
      self.setupDrawers();
      self.setRightDrawer();

      $('#candy').addClass('mobile-respond-small');

      $('.room-pane > div:first-of-type').addClass('full-width');
      $('#chat-rooms-wrapper').addClass('full-width');

      // Show the mobile top bar.
      $('#mobile-top-bar').show();

      // On screen small, attach input bar to bottom of screen.
      $('.message-form-wrapper').css({
        position: 'fixed',
        bottom: '0'
      });

      // On screen small, hide the toolbar and side panels.
      $('#chat-toolbar').hide();
      $('#chat-modal-overlay').hide();
      $('.roombar,.individual_roombar').hide();

      // Set sidebar content.
      $('#left-menu-wrapper').addClass('m-pikabu-sidebar m-pikabu-left');
      $('.m-pikabu-left').css('top', $('#header.connect').height());

      // Add close pane buttons to sidebar content.
      if ($('#left-menu-wrapper .menu-main-head a.m-pikabu-nav-toggle').length === 0) {
        $('#left-menu-wrapper .menu-main-head').prepend(Mustache.to_html(self.Template.close, { position: 'left' }));
      }

      // Add click listeners to sidebar content to close drawer.
      $('#left-menu-wrapper .menu-main-head a.m-pikabu-nav-toggle').click(function() {
        self.pikabu.closeSidebars();
        $('#mobile-top-bar').css({zIndex: 1});
      });
    } else {
      Candy.Core.log('[CandyShop MobileDisplay] switching to desktop view.');
      $('#candy').removeClass('mobile-respond-small');
      $('.room-pane > div:first-of-type').removeClass('full-width');
      $('#chat-rooms-wrapper').removeClass('full-width');

      // Hide the mobile top bar.
      $('#mobile-top-bar').hide();

      // On screen big, let the input bar do whatever it wants.
      $('.message-form-wrapper').css({
        position: 'initial',
        bottom: 'initial'
      });

      // Unset sidebar content.
      $('.m-pikabu-left').css('top', 0);
      $('#left-menu-wrapper').removeClass('m-pikabu-sidebar m-pikabu-left');
      $('.roster-wrapper').removeClass('m-pikabu-sidebar m-pikabu-right');

      // On screen big, show the toolbar and side panels.
      $('#chat-toolbar').show();
      $('.roster-wrapper').show();
      $('#left-menu-wrapper').show();
      $('.room-pane:visible .roombar,.room-pane:visible .individual_roombar').show();

      // Remove close pane buttons from sidebar content.
      $('#left-menu-wrapper .menu-main-head a.m-pikabu-nav-toggle').remove();
      $('.roster-wrapper .pane-heading a.m-pikabu-nav-toggle').remove();
    }
    CandyShop.LeftTabs.adjustTextareaWidth();
    CandyShop.LeftTabs.resetHeight();
    CandyShop.LeftTabs.scheduleResetHeight(400);
  };

  self.setRightDrawer = function() {
    $('.roster-wrapper').filter(':hidden').removeClass('m-pikabu-sidebar m-pikabu-right');
    $('.roster-wrapper').filter(':visible').addClass('m-pikabu-sidebar m-pikabu-right');
    $('.roster-wrapper a.m-pikabu-nav-toggle').remove();
    if ($('.roster-wrapper:visible .pane-heading a.m-pikabu-nav-toggle').length === 0) {
      $('.roster-wrapper:visible .pane-heading').append(Mustache.to_html(self.Template.close, { position: 'right' }));
      $('.roster-wrapper:visible .pane-heading a.m-pikabu-nav-toggle').click(function() {
        self.pikabu.closeSidebars();
      });
    }
  };

  self.setupDrawers = function() {
    self.pikabu.closeSidebars();
    if (Candy.View.getCurrent().roomJid) {
      var roomName;
      // If it's a one-on-one handle the name differently.
      if ($('.room-pane.roomtype-chat:visible').length === 0) {
        roomName = CandyShop.LeftPaneHead.getRoomName(Candy.View.getCurrent().roomJid);
      } else {
        if (Candy.Core.getRoster().get(Candy.View.getCurrent().roomJid)) {
          roomName = Candy.Core.getRoster().get(Candy.View.getCurrent().roomJid).getNick();
        } else {
          roomName = Candy.View.Pane.Chat.getTab(Candy.View.getCurrent().roomJid).find('.room-label').html();
        }
      }
      $('#mobile-top-bar .mobile-top-bar-roomname').html(roomName);
      // FIXME: this CSS needs to be fixed so that we don't need to add an invisible space just to line up nicely.
      // see also: mucroombar.js
      var roomTopic = $('.room-pane:visible .roombar .topic').html() || "&nbsp;";
      $('#mobile-top-bar .mobile-top-bar-roomtopic').html(roomTopic);
    }
  };

  self.handleNotifications = function(e, args) {
    if ($('small.unread:visible').length > 0 && args.message) {
      var $button = $('#mobile-top-bar a.toggle-mobile-chat-drawer[data-role="left"] button');

      if (self.mentionsMe(args.message) || $button.hasClass('direct-mentions')) {
        $button.addClass('direct-mentions');
      } else {
        $button.addClass('mentions');
      }

      // Pulse the color.
      if ($button.hasClass('pulse-notification') || $button.hasClass('pulse-notification-dm')) {
        $button.removeClass('pulse-notification pulse-notification-dm');
        // Use a settimeout to allow "ample" time to go on before reapplying the pulse class so that it reanimates.
        setTimeout(function() {
          if (self.mentionsMe(args.message)) {
            $button.addClass('pulse-notification-dm');
          } else {
            $button.addClass('pulse-notification');
          }
        }, 50);
      } else {
        if (self.mentionsMe(args.message)) {
          $button.addClass('pulse-notification-dm');
        } else {
          $button.addClass('pulse-notification');
        }
      }
    }
  };

  self.clearNotifications = function() {
    if ($('small.unread:visible').length === 0) {
      $('a.toggle-mobile-chat-drawer[data-role="left"] button').removeClass('pulse-notification mentions direct-mentions');
    }
  };

  self.mentionsMe = function( message ) {
    message = message.toLowerCase();
    var nick = Candy.Core.getUser().getNick().toLowerCase();
    var cid = Strophe.getNodeFromJid(Candy.Core.getUser().getJid()).toLowerCase();
    var jid = Candy.Core.getUser().getJid().toLowerCase();

    if (message.indexOf(nick) === -1 &&
      message.indexOf(cid) === -1 &&
      message.indexOf(jid) === -1) {
      return false;
    }

    return true;
  };

  self.Template = {
    chatbar: "<div id='mobile-top-bar' class='row' style='display: none;'>" +
             "<a class='toggle-mobile-chat-drawer m-pikabu-nav-toggle' data-role='left'>" +
               "<button class='btn btn-default btn-s'><span class='glyphicon glyphicon-comment'></button></span></a>" +
             "<a class='toggle-mobile-people-drawer m-pikabu-nav-toggle' data-role='right'>" +
               "<button class='btn btn-default btn-s'><span class='glyphicon glyphicon-list'></button></span></a>" +
             "<span class='mobile-top-bar-roomname'>" +
             "</span><span class='mobile-top-bar-roomtopic'>&nbsp;</span></div>",
    close: "<a class='toggle-mobile-chat-drawer m-pikabu-nav-toggle' data-role='{{position}}'><button class='btn btn-default btn-xs'><span class='glyphicon glyphicon-remove'></button></a>"
  };

  return self;
}(CandyShop.MobileDisplay || {}, Candy, jQuery));
