/*
 * candy-replies-plugin
 * @version 0.2 (2014-01-05)
 * @author Drew Harry (drew.harry@gmail.com)
 *
 * Adds @reply highlighting to chat messages to help with high velocity
 * conversations.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Replies = (function(self, Candy, $) {

	self.init = function() {

    $(Candy).on('candy:view.message.after-show', handleOnShow);

	  return self;
  };

  var handleOnShow = function(e, args) {
    var localNick = Candy.Core.getUser().getNick();

    var re = new RegExp("@" + localNick + "([ .!><\":\/@-]|$)", 'im');

    if(re.test(args.message)) {
      var el = args.element;

      el.addClass("mention");
    }
  }

  return self;
}(CandyShop.Replies || {}, Candy, jQuery));
