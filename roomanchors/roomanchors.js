/** File: roomanchors.js
 * Handling for joining rooms when included as part of the chat URL
 *
 * Authors:
 * - Ben Klang <bklang@mojolingo.com>
 *
 * Copyright:
 * - (c) 2014 Mojo Lingo LLC. All rights reserved.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.RoomAnchors = (function(self, Candy, $) {
  /** Object: about
   * About RoomAnchors plugin
   *
   * Contains:
   *   (String) name - Candy Plugin RoomAnchors
   *   (Float) version - andy Plugin Available Rooms version
   */
  self.about = {
    name: 'Candy Plugin RoomAnchors',
    version: '0.1.0'
  };

  /** Object: _options
   * Options for this plugin's operation
   *
   * Options:
   *   (String) conferenceDomain - Domain suffix to be applied to the room name in the anchor
   */
  var _options = {
    conferenceDomain: null
  };

  /** Function: init
   */
  self.init = function(options){
    // apply the supplied options to the defaults specified
    $.extend(true, _options, options);

    if (_options.conferenceDomain === '' || _options.conferenceDomain === null) {
      throw('You must configure the conference domain.');
    }

    // Ensure we have a leading "@"
    if (_options.conferenceDomain.indexOf('@') === -1) {
      _options.conferenceDomain = "@" + _options.conferenceDomain;
    }

    $(Candy).on('candy:view.connection.status-5', self.refresh);
    $(Candy).on('candy:view.connection.status-8', self.refresh);

    $(Candy).on('candy:view.room.after-show', function(ev, data) {
      if (
        data.roomJid === CandyShop.StaticLobby.getLobbyFakeJid() ||
        data.roomJid.indexOf(_options.conferenceDomain) === -1 || // Is not a MUC JID
        Strophe.getResourceFromJid(data.roomJid) // Is a MUC-based 1-on-1
      ) {
        return false;
      }
      window.location.hash = '#' + data.roomJid.split('@')[0];
    });
  };

  self.refresh = function() {
    if (window.location.hash !== '') {
      // Join, just in case we aren't already
      Candy.Core.Action.Jabber.Room.Join(self.roomAnchorJid());
      // Show, just in case we were already in the room
      try {
        Candy.View.Pane.Room.show(self.roomAnchorJid());
      } catch(ex) {
        // This may happen if we attempt to show right after a join, but the join hasn't
        // yet finished (a race condition). Ignore it, since the act of joining
        // will focus the room.
      }
    }
  };

  self.roomAnchorJid = function() {
    return window.location.hash.substring(1) + _options.conferenceDomain;
  };

  return self;
}(CandyShop.RoomAnchors || {}, Candy, jQuery));
