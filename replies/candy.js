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

    // lets also highlight messages that are FROM the local user, TO anyone.
    // this makes highlighting function as "all messages in conversations 
    // i'm involved in" rather than "messages to me" which feels more natural.
    if(args.nick==localNick) {
      // now the trick is we need to test for it having an @ message in it.
      // for now we're just going to look for an @ message somewhere in the
      // message. This has one weakness: any message that includes an email
      // address (or anything with an @) but practically, in the conversations
      // I've seen, that's quite quite rare compared to the former case.
      if(args.message.indexOf("@")!=-1) {
        el.addClass("mention");
        el.prev().addClass("mention");
      }
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
    
    var nameEl = el.find("a.name");
    
    if(nameEl.attr("data-role")=="moderator") {

      // lets look and see if this message fits the format
      // WORD: blah blah blah
      // we'll accept any WORD, and the notion is that moderators
      // can use it to do something like QUESTION: Are you happy?
      
      var alert = new RegExp("[A-Z]{3}:");
      
      // if it's an alert, that gets priority over mod status.
      if(alert.test(args.message)) {
        nameEl.parent().parent().addClass("alert");
        nameEl.parent().parent().prev().addClass("alert");
      } else {
        nameEl.parent().parent().addClass("mod");
        nameEl.parent().parent().prev().addClass("mod");
      }
    }
    
    // on mouseover, highlight all the messages from that user
    nameEl.mouseenter(function(e) {
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

    nameEl.mouseleave(function(e) {
      $(".message-pane .user-highlight").removeClass("user-highlight");
    });
  }

  return self;
  }(CandyShop.Replies || {}, Candy, jQuery));