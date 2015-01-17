var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.MeDoes = (function(self, Candy, $) {

	self.init = function() {
		$(Candy).on("candy:view.message.before-show", function(e, args) {
			if (args && args.message && args.message.match(/^\/me /i)) {
				var message = args.message.match(/^\/([^\s]+)(?:\s+(.*))?$/m)[2];
				Candy.View.Pane.Chat.infoMessage(args.roomJid, '<span><strong>' + args.name + '</strong> ' + message + '</span>');
				return false;
			}
		});

	};

	return self;
}(CandyShop.MeDoes || {}, Candy, jQuery));
