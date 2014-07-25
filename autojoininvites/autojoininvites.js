/** File: autojoininvites.js
 * Candy Plugin Auto-Join Incoming MUC Invites
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.AutoJoinInvites = (function(self, Candy, $) {
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
   * Initializes the AutoJoinInvites plugin with the default settings.
   */
  self.init = function(){
    $(Candy).on('candy:core:chat:invite',function(ev, obj) {
      // JIDs in automatic invitations are escaped,
      // but Room.Join expects unescaped JID
      var roomJid = Candy.Util.unescapeJid(obj.roomJid);

      Candy.Core.Action.Jabber.Room.Join(roomJid, null);
    })
  };

  return self;
}(CandyShop.AutoJoinInvites || {}, Candy, jQuery));
