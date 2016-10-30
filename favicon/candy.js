/** File: favicon.js
 * Candy Plugin Favicon Notifier
 * Author: John Rose <john.rose@powerhrg.com>
 *
 * Show a different favicon when there are unread notifications
 */

 var CandyShop = (function(self) { return self; }(CandyShop || {}));

 CandyShop.Favicon = (function(self, Candy, $) {

  self.about = {
    name: 'Candy Favicon Plugin',
    version: '1.0'
  };

  self.init = function(){
    self.$favicon = $('link[rel="shortcut icon"]');
    self.standardFaviconUrl = self.$favicon.attr("href");
    self.notificationsFaviconUrl = "/ui/favicons/favicon-notification-pending.ico";
    self.faviconInterval = null;
    self.maxBlinks = 5;
    self.currentBlinks = 0;
    self.faviconBlinkMs = 500;

    // Override the renderUnreadMessages function in candy.bundle.js
    Candy.View.Pane.Window.renderUnreadMessages = function(count) {
      window.top.document.title = Candy.View.Template.Window.unreadmessages.replace("{{count}}", count).replace("{{title}}", Candy.View.Pane.Window._plainTitle);
      if (count === 0) {
        CandyShop.Favicon.clearUnreadMessages();
      } else {
        CandyShop.Favicon.showNotificationsFavicon();
        CandyShop.Favicon.startFaviconBlink();
      }
    };

    // Override the clearUnreadMessages function in candy.bundle.js
    Candy.View.Pane.Window.clearUnreadMessages = function(count) {
      Candy.View.Pane.Window._unreadMessagesCount = 0;
      window.top.document.title = Candy.View.Pane.Window._plainTitle;
      CandyShop.Favicon.clearUnreadMessages();
    };
  };

  self.clearUnreadMessages = function() {
    CandyShop.Favicon.stopFaviconBlink();
    CandyShop.Favicon.showStandardFavicon();
  };

  self.startFaviconBlink = function() {
    var csf = CandyShop.Favicon;
    csf.stopFaviconBlink(); // just in case?
    csf.currentBlinks = 0;
    csf.faviconInterval = window.setInterval(function() { CandyShop.Favicon.faviconBlink(); }, csf.faviconBlinkMs );
  };

  self.stopFaviconBlink = function() {
    window.clearInterval(CandyShop.Favicon.faviconInterval);
  };

  self.showNotificationsFavicon = function() {
    CandyShop.Favicon.$favicon.attr("href", CandyShop.Favicon.notificationsFaviconUrl);
  };

  self.showStandardFavicon = function() {
    CandyShop.Favicon.$favicon.attr("href", CandyShop.Favicon.standardFaviconUrl);
  };

  self.faviconBlink = function() {
    var csf = CandyShop.Favicon;
    if (csf.currentBlinks >= csf.maxBlinks) {
      csf.showNotificationsFavicon();
      csf.stopFaviconBlink();
      return;
    }
    if (csf.$favicon.attr("href") === csf.standardFaviconUrl) {
      csf.showNotificationsFavicon();
      csf.currentBlinks += 1;
    } else {
      csf.showStandardFavicon();
    }
  };

  return self;
}(CandyShop.Favicon || {}, Candy, jQuery));