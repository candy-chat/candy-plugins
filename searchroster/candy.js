/** File: searchroster.js
 * Search Roster - Search people and rooms.
 *
 * Authors:
 *	 - Jason Deegan <jdeegan@mojolingo.com>
 *
 * Copyright:
 *	 (c) 2014 Power Home Remodeling Group. All rights reserved.
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

	/** Boolan: isSearching
	 * Keeping track of whether user is in the middle of searching. Relevant for hide/show of full roster.
	 */
	var isSearching = false;

	/** Booleans: _searchtemp_displayOfflineUsers, _searchtemp_displayOfflineUsersOverride
	 * Keeping track of whether user is in the middle of searching and whether the displayOfflineUsers option has been selected.
	 */
	var _searchtemp_displayOfflineUsers = true;
	var _searchtemp_displayOfflineUsersOverride = false;

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
			self.searchRoster();
		});

		// on search 'Clear' button press do: Show all users, clear search field and give search field focus
		$(document).on('click', _clearbtn, function() {
			$(this).closest('div').find( 'input' ).focus();
			self.stopSearching();
		});
	};

	self.searchRoster = function(){
		var searchCriteria = $(_selector).val().toLowerCase();

		if (searchCriteria === '') {
			self.stopSearching();
			return;
		} else {
			CandyShop.SearchRoster.isSearching = true;
			if (CandyShop.SearchRoster._searchtemp_displayOfflineUsersOverride !== true) {
				CandyShop.SearchRoster._searchtemp_displayOfflineUsers = true;
			}
		}

		$('#chat-modal .user').hide();

		$('#chat-modal .user').filter(function(i,el) {
			if (CandyShop.SearchRoster._searchtemp_displayOfflineUsers === true) {
				return $(el).data('nick').toLowerCase().indexOf(searchCriteria) >= 0 || $(el).data('jid').toLowerCase().indexOf(searchCriteria) >= 0;
			} else {
				return ($(el).data('nick').toLowerCase().indexOf(searchCriteria) >= 0 || $(el).data('jid').toLowerCase().indexOf(searchCriteria) >= 0) && $(el).data('status') === 'available';
			}
		}).show();
	};

	self.stopSearching = function(){
		// Clear search input and reset Defaults
		$('#search-roster-value').val('');
		CandyShop.SearchRoster.isSearching = false;
		CandyShop.SearchRoster._searchtemp_displayOfflineUsers = true;
		CandyShop.SearchRoster._searchtemp_displayOfflineUsersOverride = false;
	};

	return self;
}(CandyShop.SearchRoster || {}, Candy, jQuery));
