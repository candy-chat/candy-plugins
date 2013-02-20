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
    // params are roomJid, element, nick, message
    Candy.Core.log("in handleOnShow");
    // console.log(JSON.stringify(args));
    // console.log($(element));
  }
  
  return self;
}(CandyShop.Replies || {}, Candy, jQuery));