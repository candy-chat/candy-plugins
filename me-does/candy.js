var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.MeDoes = (function(self, Candy, $) {

	self.init = function() {
		$(Candy).on("candy:view.message.before-show", function(e, args) {
			if (args && args.message && args.message.match(/^\/me /i)) {
				var message = args.message.match(/^\/([^\s]+)(?:\s+(.*))?$/m)[2];
				self.infoMessage(args.roomJid, args.name, message);
				return false;
			}
		});

	};
	
	self.meDoesTemplate = '<li><small>{{time}}</small><div class="infomessage">' +
	'<span class="spacer">•</span>&nbsp;<span><strong>{{name}}</strong>&nbsp;{{message}}</span></div></li>';
	
	//Using logic from real infoMessage function and inserting custom template
	self.infoMessage = function (roomJid, name, message){
		if(Candy.View.getCurrent().roomJid) {
			var html = Mustache.to_html(self.meDoesTemplate, {
				name: name,
				message: message,
				time: Candy.Util.localizedTime(new Date().toGMTString())
			});
			Candy.View.Pane.Room.appendToMessagePane(roomJid, html);
			if (Candy.View.getCurrent().roomJid === roomJid) {
				Candy.View.Pane.Room.scrollToBottom(Candy.View.getCurrent().roomJid);
			}
		}
	};
	
	return self;
}(CandyShop.MeDoes || {}, Candy, jQuery));
