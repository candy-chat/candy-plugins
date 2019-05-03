/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Jason Deegan <jld0417@gmail.com>
 *
 * Copyright:
 *   (c) 2014 Power Home Remodeling Group. All rights reserved.
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: CandyShop.SearchRoster
 * Allows for completion of a name in the roster
 */
CandyShop.SearchRoster = (function(self, Candy, $) {
  /** String: _selector
   * The selector for the visible message box
   */
  var _selector = '#search-roster-value';

  /** String: _clearbtn
   * The button for clearing the search input box
   */
  var _clearbtn= '#search-roster-value-btn';

  /** Function: init
   * Initialize the SearchRoster plugin
   *
   * Parameters:
   *   None
   */
  self.init = function() {
    //  initialize tooltip help
    $(_selector).tooltip();

    // listen for keyup when someone wants to search
    $(document).on('keyup', _selector, function() {
      var searchCriteria = $(this).val().toLowerCase();
      if (searchCriteria === ''){
        CandyShop.StaticLobby.GlobalRoster.Display();
        return;
      }
      $('.user').hide();
      $('.user').filter(function(i,el){
        return $(el).data('nick').toLowerCase().indexOf(searchCriteria) >= 0 || $(el).data('jid').toLowerCase().indexOf(searchCriteria) >= 0;
      }).show();
    });

    // on search 'Clear' button press do: Show all users, clear search field and give search field focus
    $(document).on('click', _clearbtn, function() {
      $('.user').show();
      $(this).closest('div').find( 'input' ).val('');
      $(this).closest('div').find( 'input' ).focus();
      CandyShop.StaticLobby.GlobalRoster.Display();
    });
  };

  return self;
}(CandyShop.NameComplete || {}, Candy, jQuery));
