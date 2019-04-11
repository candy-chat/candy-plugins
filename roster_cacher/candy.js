var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.RosterCacher = (function(self, Candy, $) {
  self.init = function(){
    var debouncedRosterCacher = $.debounce(1000, self.cacheRoster);

    $(Candy).on('candy:core:roster:fetched', debouncedRosterCacher)
      .on('candy:core:roster:added', debouncedRosterCacher)
      .on('candy:core:roster:updated', debouncedRosterCacher)
      .on('candy:core:roster:removed', debouncedRosterCacher);
  };

  self.getCachedRoster = function() {
    if (localStorage.roster_items) {
      try {
        Candy.Core.log('[CandyShop RosterCacher] Returning JSON parse of local storage roster items.');
        return JSON.parse(localStorage.roster_items);
      } catch (ex) {
        Candy.Core.warn('[CandyShop RosterCacher] Unable to load the stored roster; fetching from the server instead.');
        return [];
      }
    } else {
      return [];
    }
  };

  self.cacheRoster = function() {
    // Store current roster version in localStorage
    var roster = Candy.Core.getConnection().roster;
    localStorage.roster_items = JSON.stringify(roster.items);
    if (roster.ver) {
      localStorage.roster_version = roster.ver;
    }
  };

  return self;
}(CandyShop.RosterCacher || {}, Candy, jQuery));
