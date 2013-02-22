/*
 * candy-replies-plugin
 * @version 0.1 (2013-2-20)
 * @author Drew Harry (drew.harry@gmail.com)
 *
 * Adds @reply highlighting to chat messages to help with high velocity 
 * conversations.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Replies = (function(self, Candy, $) {

	self.init = function() {
	  
    Candy.View.Event.Message.onShow = handleOnShow;
    
	  return self;
  };
  
  var handleOnShow = function(args) {
    var localNick = Candy.Core.getUser().getNick().toLowerCase();
    
    var re = new RegExp("@" + localNick + "[ .!><\":\/@-]|$");
    
    if(re.test(args.message.toLowerCase())) {
      var el = args.element;

      el.addClass("mention");
      el.prev().addClass("mention");
    }
  }
  
  return self;
}(CandyShop.Replies || {}, Candy, jQuery));