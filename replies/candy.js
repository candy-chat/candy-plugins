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

	self.init = function(options) {
	  if(typeof options === "undefined") {
	    options = {};
	  }
	  
	  if("clickToReply" in options) {
	    if(options["clickToReply"]==true){
	      clickToReply = true;
	    } else {
	      clickToReply = false;
	    }
	  }
	  
    Candy.View.Event.Message.onShow = handleOnShow;
    
	  return self;
  };
  
  var clickToReply = true;
  
  var handleOnShow = function(args) {
    var localNick = Candy.Core.getUser().getNick().toLowerCase();
    
    var re = new RegExp("@" + localNick + "([ .!><\":\/@-]|$)");
    var el = args.element;
    
    if(re.test(args.message.toLowerCase())) {
      el.addClass("mention");
      el.prev().addClass("mention");
    }
    
    if(clickToReply) {
      // now swap in different event handlers for clicking
      // people's names.
      el.find("a.name").unbind();
    
      el.find("a.name").click(function(e) {
        var inputEl = $(".message-form input[type=text]");
      
        var addText = "@" + $(this).text() + " ";
      
        // prepend a space if there's already content there.
        if(inputEl.val().length > 0 &&
           inputEl.val()[inputEl.val().length-1] != " "){
          addText = " " + addText;
        }
      
        inputEl.val(inputEl.val() + addText);
        inputEl.focus();
      });
    }
  }
  
  return self;
}(CandyShop.Replies || {}, Candy, jQuery));