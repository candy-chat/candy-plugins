/** File: autojoininvites.js
 * Candy Plugin Auto-Join Incoming MUC Invites
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

/* global Candy, jQuery */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.AutoJoinInvites = (function(self, Candy, $) {
  /**
   * Initializes the AutoJoinInvites plugin with the default settings.
   */
  self.init = function(){
    $(Candy).on('candy:core:chat:invite',function(ev, obj) {
      // JIDs in automatic invitations are escaped,
      // but Room.Join expects unescaped JID
      var roomJid = Candy.Util.unescapeJid(obj.roomJid);

      Candy.Core.Action.Jabber.Room.Join(roomJid, obj.password);
    });
  };

  return self;
}(CandyShop.AutoJoinInvites || {}, Candy, jQuery));
