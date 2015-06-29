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
   *   (Boolean) highlightInRoom - Whether to highlight the name in the room. Defaults to true.
   */
  var _options = {
    nameIdentifier: '@',
    playSound: true,
    highlightInRoom: true
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

    // Search for names and wrap them with a span element.
    $(Candy).on('candy:view.message.before-render', function(e, args) {
      // Ask for the nick each time because the nick can change.
      var nickSearch = _options.nameIdentifier + Candy.Core.getUser().getNick(),
          jidSearch  = Candy.Core.getUser().getJid(),
          cidSearch  = _options.nameIdentifier + Strophe.getNodeFromJid(Candy.Core.getUser().getJid()),
          nickRegExp = new RegExp(nickSearch, 'ig'),
          jidRegExp  = new RegExp(jidSearch, 'ig'),
          cidRegExp  = new RegExp(cidSearch, 'ig');

      // If it's in the message and it's not from me, do stuff
      if (args.templateData.name !== Candy.Core.getUser().getNick() &&
          self.containsMe(args.templateData.message)) {
        // Highlight my name if configured to do so.
        if (_options.highlightInRoom) {
          args.templateData.message = args.templateData.message
            .replace(nickRegExp, Mustache.to_html(self.Template.highlight, {message: nickSearch}))
            .replace(jidRegExp, Mustache.to_html(self.Template.highlight, {message: jidSearch}))
            .replace(cidRegExp, Mustache.to_html(self.Template.highlight, {message: cidSearch}));
        }
        // Play a notification sound if configured to do so.
        if (_options.playSound) {
          Candy.View.Pane.Chat.Toolbar.playSound();
        }
      }
    });

    // If I'm mentioned, display a special nofitication for the room.
    $(Candy).on('candy:view.message.before-show', function(e, args) {
      if ((!Candy.View.Pane.Window.hasFocus() ||
          !Candy.View.Pane.Room.getPane(args.roomJid).is(':visible')) &&
          self.containsMe(args.message)) {
        var tab = Candy.View.Pane.Chat.getTab(args.roomJid);

        // Increase the mentions count.
        Candy.View.Pane.Chat.rooms[args.roomJid].mentionsCount += 1;

        // Only insert one notification for mentions.
        if ($(tab).find('.mentions').length <= 0) {
          $(tab).find('.label').after(Mustache.to_html(self.Template.mentions,
            {mentions: Candy.View.Pane.Chat.rooms[args.roomJid].mentionsCount}));
        } else {
          $(tab).find('.mentions').html(Candy.View.Pane.Chat.rooms[args.roomJid].mentionsCount);
        }
      }
    });

    // Clear mention notifications on window focus.
    $(window).focus(function() {
      var roomJid = Candy.View.getCurrent().roomJid;
      if (roomJid) {
        self.clearMentions(roomJid);
      }
    });

    // Add a mention notification counter and set it at zero.
    $(Candy).on('candy:view.room.after-add', function(e, args) {
      Candy.View.Pane.Chat.rooms[args.roomJid].mentionsCount = 0;
    });

    // Clear mention notifications when moving to a window.
    $(Candy).on('candy:view.room.after-show', function(e, args) {
      self.clearMentions(args.roomJid);
    });
  };

  self.containsMe = function(message) {
    var message = message.toLowerCase(),
        nickSearch = _options.nameIdentifier + Candy.Core.getUser().getNick().toLowerCase(),
        jidSearch  = Candy.Core.getUser().getJid().toLowerCase(),
        cidSearch  = _options.nameIdentifier + Strophe.getNodeFromJid(Candy.Core.getUser().getJid()).toLowerCase();
    if (message.indexOf(nickSearch) !== -1 ||
        message.indexOf(jidSearch) !== -1 ||
        message.indexOf(cidSearch) !== -1) {
      return true;
    }
    return false;
  };

  self.clearMentions = function(roomJid) {
    var tab = Candy.View.Pane.Chat.getTab(roomJid);
    Candy.View.Pane.Chat.rooms[roomJid].mentionsCount = 0;
    $(tab).find('.mentions').remove();
  };

  self.Template = {
    highlight: '<span class="candy-notifyme-highlight">{{message}}</span>',
    mentions: '<small title="Mentions" class="mentions">{{mentions}}</span>'
  };

  return self;
}(CandyShop.NotifyMe || {}, Candy, jQuery));
