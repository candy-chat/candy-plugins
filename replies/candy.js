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
    // if the end of the nick has spaces (which, surprisingly, is possible)
    // trim() those off because it causes drama with the regex.
    var localNick = Candy.Core.getUser().getNick().toLowerCase().trim();
    
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
        
        var fullName = $(this).attr("data-nick");
        
        // this is a hedge so the plugin continues to work until 
        // https://github.com/candy-chat/candy/pull/154
        // is merged onto master. 
        if(fullName === undefined) {
          fullName = $(this).text();
        }
        
        var addText = "@" + fullName + " ";
        
        // prepend a space if there's already content there.
        if(inputEl.val().length > 0 &&
           inputEl.val()[inputEl.val().length-1] != " "){
          addText = " " + addText;
        }
      
        inputEl.val(inputEl.val() + addText);
        inputEl.focus();
      });
    }

		// on mouseover, highlight all the messages from that user
		el.find("a.name").mouseenter(function(e) {
			// if data-nick is available, use that. otherwise, use the text.
			var targetName = $(this).attr("data-nick")===undefined ? $(this).text() : $(this).attr("data-nick");
			
			var messagePane = $(".message-pane");
			
			messagePane.find("a.name").each(function(el) {
				var elName = $(this).attr("data-nick")===undefined ? $(this).text() : $(this).attr("data-nick");
				
				if(elName==targetName) {
					$(this).parent().parent().addClass("user-highlight");
					$(this).parent().parent().prev().addClass("user-highlight");
				}
			});
		});
		
		el.find("a.name").mouseleave(function(e) {
			$(".message-pane .user-highlight").removeClass("user-highlight");
		});
  }
  
  return self;
}(CandyShop.Replies || {}, Candy, jQuery));