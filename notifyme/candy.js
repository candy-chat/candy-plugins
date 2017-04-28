/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Troy McCabe <troy.mccabe@geeksquad.com>
 *   - Melissa Adamaitis <madamei@mojolingo.com>
 *
 * Copyright:
 *   (c) 2014 Power Home Remodeling Group
 *   (c) 2012 Geek Squad. All rights reserved.
 */
RegExp.quote = function(str) {
    return (str+'').replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: CandyShop.NotifyMe
 * Notifies with a sound and highlights the text in the chat when a nick is called out
 */
CandyShop.NotifyMe = (function(self, Candy, $) {
  /** Object: _options
   * Options for this plugin's operation
   *
   * Options:
   *   (String) nameIdentifier - Prefix to append to a name to look for.
   *     '@' now looks for '@NICK', '' looks for 'NICK', etc. Defaults to '@'.
   *   (Boolean) playSound - Whether to play a sound when identified. Defaults to true.
   *   (Boolean) notifyNormalMessage - Notification on normalmessage. Defaults to false
   *   (Boolean) notifyPersonalMessage - Notification for private messages. Defaults to true
   *   (Boolean) notifyMention - Notification for mentions. Defaults to true
   *   (Integer) closeTime - Time until closing the Notification. (0 = Don't close) Defaults to 3000
   *   (String)  title - Title to be used in notification popup. Set to null to use the contact's name.
   *   (String)  icon - Path to use for image/icon for notification popup.
   */
  var _options = {
    nameIdentifier: '@',
    playSound: true,
    notifyNormalMessage: false,
    notifyPersonalMessage: true,
    notifyMention: true,
    notifyClassName: 'candy-notifyme-highlight',
    myNotifyClassName: 'candy-notifyme-highlight-me',
    closeTime: 3000,
    title: null,
    icon: window.location.origin + '/' + Candy.View.getOptions().assets + '/img/favicon.png'
  };

  self.getNotifyClassName = function() {
    return _options.notifyClassName;
  };

  self.getMyNotifyClassName = function() {
    return _options.myNotifyClassName;
  };

  /** Function: init
   * Initialize the NotifyMe plugin
   * Bind to beforeShow, play sound and higlight if specified
   *
   * Parameters:
   *   (Object) options - The options to apply to this plugin
   */
  self.init = function(options) {
    // Apply the supplied options to the defaults specified
    $.extend(true, _options, options);

    self.setupDesktopNotifications();
    self.Summary.init();

    $(Candy).on('candy:core:roster:fetched', function() {
      try { self.compileNameMatcher(); }
      catch(ex) {
        Candy.Core.error("Error compiling name matcher:", ex);
      }
    });

    // Search for names and wrap them with a span element.
    $(Candy).on('candy:view.message.before-render', function(e, args) {
      self.Summary.save(args);

      try {
        self.highlightMentions(args);
      } catch(ex) {
        Candy.Core.error("Error while handling message notification to highlight mentions. ", ex);
      }
    });

    // Show unread messages indicator
    $(Candy).on('candy:view.message.notify', function(e, args) {
      try {
        self.showNotifications(args);
      } catch(ex) {
        Candy.Core.error("Error while handling message notification to show notifications. ", ex);
      }
    });

    // Clear mention notifications on window focus.
    $(window).focus(function() {
      try {
        var roomJid = Candy.View.getCurrent().roomJid;
        if (roomJid) {
          self.Summary.removeRoom(roomJid);

          self.clearMentions(roomJid);
        }
      } catch(ex) {
        Candy.Core.error("Error trying to clear mentions for " + roomJid, ex);
      }
    });

    // Add a mention notification counter and set it at zero.
    $(Candy).on('candy:view.room.after-add', function(e, args) {
      Candy.View.Pane.Chat.rooms[args.roomJid].mentionsCount = 0;
    });

    // Clear mention notifications when moving to a window.
    $(Candy).on('candy:view.room.after-show', function(e, args) {
      self.Summary.removeRoom(args.roomJid);

      try { self.clearMentions(args.roomJid); }
      catch (ex) {
        Candy.Core.error("Error trying to clear mentions for room " + roomJid, ex);
      }
    });
  };

  self.setupDesktopNotifications = function() {
    // Just init if notifications are supported
    if (window.Notification) {
      // Setup Permissions (has to be kicked on with some user-events)
      jQuery(document).one('click keydown', self.requestDesktopNotificationPermission);
    }
  };

  /** Function: requestDesktopNotificationPermission
   * If allowed, ask the user for permission to notify them on their desktop
   *
   * @return void
   */
  self.requestDesktopNotificationPermission = function() {
    if (window.Notification.permission !== "granted") {
      window.Notification.requestPermission();
      Candy.Core.log('[CandyShop Notifications] requesting pop-up notification permissions.');
    }
  };

  self.Summary = function () {
    var storageKey = 'notification_summary';
    var summary = {
          chat: {},
          groupchat: {}
        };

    return {
      init: function () {
        if(!localStorage[storageKey]) {
          cacheSummary();
        }
        summary = loadFromCache();
      },

      save: function (args) {
        if (!self.isNewMessage(args.templateData.timestamp))
          return;

        var data = args.templateData,
            stanzaType = $(args.stanza).attr('type');

        if (stanzaType === 'chat') {
          summary.chat[data.roomjid] = data.displayName;
        } else if (self.mentionsMe(data.message)) {
          summary.groupchat[data.roomjid] = true;
        }
      },

      showDesktopNotification: function (args) {
        if (!shouldNotify())
          return;

        var notification = new window.Notification('Connect', {
          icon: _options.icon,
          body: notificationBody()
        });

        _options.closeTime !== 0 && window.setTimeout(function () {
            notification.close()
          }, _options.closeTime);

        cacheSummary();
      },

      removeRoom: function (roomJid) {
        delete summary.chat[roomJid];
        delete summary.groupchat[roomJid];
        cacheSummary();
      }
    };

    function notificationBody(a) {
      var dmSize = Object.keys(summary.chat).length;
      var mentionSize = Object.keys(summary.groupchat).length;

      return Mustache.to_html(bodyTemplate(), {
        hasDm: dmSize > 0,
        names: formattedNames(summary.chat),
        isOrAre: dmSize > 1 ? 'are' : 'is',
        namesCount: dmSize,
        hasMention: mentionSize > 0,
        roomCount: mentionSize,
        roomOrRooms: mentionSize > 1 ? 'rooms' : 'room',
      });
    }

    function formattedNames(dms) {
      var names = _.values(dms);
      if (names.length === 0)
        return false;

      names.sort();

      var size = names.length;
      if (size === 1) return names[0];

      return names.slice(0, size - 1).join(', ') + ' and ' + names[size - 1];
    }

    function shouldNotify() {
      if (document.hasFocus())
        return;

      var cachedSummary = loadFromCache();

      return Object.keys(cachedSummary.chat).length !== Object.keys(summary.chat).length
             || Object.keys(cachedSummary.groupchat).length !== Object.keys(summary.groupchat).length;
    }

    function cacheSummary() {
      localStorage[storageKey] = JSON.stringify(summary);
    }

    function loadFromCache() {
      return JSON.parse(localStorage[storageKey]);
    }

    function bodyTemplate() {
      var fullDm = '{{names}} {{isOrAre}} trying to Connect with you',
          compactDm = '{{namesCount}} people are trying to Connect with you';

      return  '' +
        '{{#hasDm}}' +
          (Object.keys(summary.chat).length > 3 ? compactDm : fullDm) +

          '{{#hasMention}}' +
            ', and you ' +
          '{{/hasMention}}' +
        '{{/hasDm}}' +

        '{{#hasMention}}' +
          '{{^hasDm}}' +
            'You ' +
          '{{/hasDm}}' +
        '{{/hasMention}}' +

        '{{#hasMention}}' +
          'are mentioned in {{roomCount}} {{roomOrRooms}}' +
        '{{/hasMention}}';
    }
  }();

  self.isNewMessage = function (time) {
    // Hack: only show notifications on new messages. This is a temporary fix until we can
    // modify Candy to help us know whether to notify on new messages
    // Only show notifications for messages that have come within the last 3 seconds
    var seconds = new Date() - new Date(time);
    return seconds < 3000;
  };

  self.shouldShowNotifications = function (args) {
    return !self.fromMe(args.from) && (
          _options.notifyNormalMessage ||
          (self.mentionsMe(args.message) && _options.notifyMention) ||
          (_options.notifyPersonalMessage && Candy.View.Pane.Chat.rooms[args.roomJid].type === 'chat')
        )
  };

  self.compileNameMatcher = function() {
    var names = [];

    $.each(Candy.Core.getRoster().getAll(), function(i, buddy) {
      // Ensure we don't add ourselves to this list
      if (buddy.getName() == Candy.Core.getUser().getNick()) {
        return true;
      }
      names.push(RegExp.quote(buddy.getName()));
      names.push(RegExp.quote(Strophe.getNodeFromJid(buddy.getJid())));
    });

    self.nameMatcher = self.matcherForNameList(names);
  };

  self.highlightMentions = function(args) {
    CandyShop.Hashtags.enhance(args.templateData.message, args.stanza);
  };

  self.matcherForNameList = function(names) {
    var regex = '(^|\\s|>)'; // Check for beginning of line or leading space or highlight tag
    if (_options.nameIdentifier) { regex += _options.nameIdentifier + '?' } // Look for optional prefix
    regex += '(' + names.join('|') + ')'; // Combine the list of names to find
    regex += '(:?)'; // Look for an optional trailing colon
    return new RegExp(regex, 'ig');
  }

  self.myNames = function() {
   return [
      RegExp.quote(Candy.Core.getUser().getNick()),
      RegExp.quote(Strophe.getNodeFromJid(Candy.Core.getUser().getJid())),
      RegExp.quote(Strophe.getBareJidFromJid(Candy.Core.getUser().getJid())),
      RegExp.quote('all')
    ];
  };

  self.showNotifications = function(args) {
    if (Candy.View.getCurrent().roomJid !== args.roomJid || !Candy.View.Pane.Window.hasFocus()) {
      if (!self.fromMe(args.from) && args.from !== Candy.View.getCurrent().roomJid) {
        self.increaseUnreadCount(args);
      }

      if (self.shouldShowNotifications(args)) {
        self.playNotificationSound();
        self.Summary.showDesktopNotification(args);
      }
    }
  };

  self.playNotificationSound = function () {
    if (!Candy.Util.getCookie('candy-nosound')) {
      try {
        new Audio('incoming_message.mp3').play();
      } catch(ex) {
        Candy.Core.error('Error attempting to play incoming_message.mp3 file.', ex);
      }
    }
  }

  self.increaseUnreadCount = function (args) {
    try {
      if (!self.isNewMessage(args.timestamp))
        return;
    } catch (ex) {
      Candy.Core.error("Error trying to notifications for the last three seconds.", ex);
    }

    // Display activity badges if the browser or room doesn't have focus
    // Ask for the nick each time because the nick can change.
    if (!self.fromMe(args.from) && self.matcherForNameList(self.myNames()).test(args.message)) {
      var tab = Candy.View.Pane.Chat.getTab(args.roomJid);

      try {
        // Increase the mentions count.
        Candy.View.Pane.Chat.rooms[args.roomJid].mentionsCount += 1;

        // Only insert one notification for mentions.
        $(tab).find('.unread').addClass('mentions');
      } catch(ex) {
        Candy.Core.error('Error increasing direct mentions.', ex);
      }
    }

    try {
      Candy.View.Pane.Chat.increaseUnreadMessages(args.roomJid);
    } catch (ex) {
      Candy.Core.error('Error attempting to increase unread mentions via Candy.View.', ex);
    }
  }

  self.fromMe = function(sender) {
    if (sender === null) {
      // No sender means that the message was from self - TODO: Why?
      return true;
    }
    var senderJid = Strophe.getBareJidFromJid(sender);
    var myJid = Strophe.getBareJidFromJid(Candy.Core.getUser().data.jid);
    return myJid === senderJid;
  }

  self.mentionsMe = function(message) {
    var message = message.toLowerCase(),
        nick = Candy.Core.getUser().getNick().toLowerCase(),
        cid = Strophe.getNodeFromJid(Candy.Core.getUser().getJid()).toLowerCase(),
        jid = Candy.Core.getUser().getJid().toLowerCase();
    if (message.indexOf(nick) === -1 &&
      message.indexOf(cid) === -1 &&
      message.indexOf(jid) === -1 &&
      message.indexOf(_options.nameIdentifier + "all") === -1) {
      return false;
    }
    return true;
  };

  self.clearMentions = function(roomJid) {
    var tab = Candy.View.Pane.Chat.getTab(roomJid);
    Candy.View.Pane.Chat.rooms[roomJid].mentionsCount = 0;
    $(tab).find('.unread').removeClass('mentions');
  };

  return self;
}(CandyShop.NotifyMe || {}, Candy, jQuery));
