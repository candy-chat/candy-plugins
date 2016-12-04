/** File: namecomplete.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Troy McCabe <troy.mccabe@geeksquad.com>
 *   - Ben Klang <bklang@mojolingo.com>
 *
 * Copyright:
 *   (c) 2012 Geek Squad. All rights reserved.
 *   (c) 2014 Power Home Remodeling Group. All rights reserved.
 *
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: CandyShop.NameComplete
 * Allows for completion of a name in the roster
 */
CandyShop.NameComplete = (function(self, Candy, $) {
  /** Object: _options
   * Options:
   *   (String) nameIdentifier - Prefix to append to a name to look for. '@' now looks for '@NICK', '' looks for 'NICK', etc. Defaults to '@'
   *   (Integer) completeKeyCode - Which key to use to complete
   *   (Integer) maxResults - Maximum of results to be shown at a time
   */
  var _options = {
    nameIdentifier: '@',
    completeKeyCode: 9,
    maxResults: 12
  };

  /** String: _selector
   * The selector for the visible message box
   */
  var _selector = 'textarea[name="message"]:visible';

  /** RegExp: _matchLastMention
   * Matches the last mention.
   * Just matches if there is either a space or begin of input before "@".
   * Example: "@foo and @bar" would match "@bar"
   */
  var _matchLastMention = new RegExp('(^|\ )(' + _options.nameIdentifier + '[^' + _options.nameIdentifier + ']*)$');

  /**
   * This is to be used on replacing mention for user's name.
   * If we don't, it will also replace the space before "@", causing an issue.
   * e.g "Hey @name" -> "Hey Name LastName" instead of "HeyName LastName"
   */
  var _matchLastMentionWithoutSpace = new RegExp('(' + _options.nameIdentifier + '[^' + _options.nameIdentifier + ']*)$');

  /** Boolean:_autocompleteStarted
   * Keeps track of whether we're in the middle of autocompleting a name
   */
  var _autocompleteStarted = false;

  /** Integer: _replacementSet
   * Keeps track of how which names we need to replace with JIDs
   */
  var _replacementSet = [];

  /**
   * Last text written by the user
   */
  var _lastText = '';

  var _keys = {
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    ESC: 27,
    ENTER: 13
  };

  /** Function: init
   * Initialize the NameComplete plugin
   * Show options for auto completion of names
   *
   * Parameters:
   *   (Object) options - Options to apply to this plugin
   */
  self.init = function(options) {

    $.extend(true, _options, options);

    // Stop autocomplete on click anywhere in the document
    $(document).on('focus click', function(e) {
      self.endAutocomplete();
    });

    $(document).on('focus click', _selector, function(e) {
      e.stopPropagation();
    });

    $(document).on('keyup', _selector, function(e) {
      var field = $(this)
      self.getUsers().then(function (users) {
        if (!users) return;
        users = self.processUsers(users);

        var fieldText = field.val();
        var imatch = fieldText.match(_matchLastMention);

        if (imatch) {
          fieldText = imatch[imatch.length - 1];
        } else {
          self.endAutocomplete();
          return;
        }

        var fieldTextMinusAt = fieldText.slice(1, fieldText.length);

        if (fieldTextMinusAt.length === 0 || fieldTextMinusAt === _lastText) {
          return;
        }
        _lastText = fieldTextMinusAt;

        var matches = [];

        for(var i in users) {
          var user = users[i];
          var searchTerm = user.goes_by + ' ' + user.last_name + ' ' + user.territory + ' ' + user.department  + ' - ' + user.title;

          if (searchTerm.match(new RegExp(fieldTextMinusAt, 'i')) !== null) {
            matches.push(user);

            if (matches.length === _options.maxResults) {
              break;
            }
          }
        }

        self.startAutoComplete();
        self.showPicker(matches, field);
      });
    });

    $(Candy).on('candy:view.message.before-send', function(ev, args) {
      return self.replaceNamesWithId();
    });
  };

  self.getUsers = function () {
    /**
     * For replacements such as @all
     * ...and eventually @here, etc.
     */
    var _specialUsers = {
      'All': { id: 'All', jid: 'All', description: 'All users in this room', fullName: 'All Users', goes_by: 'All', last_name: 'Users', special: true}
    };

    var roomJid = Candy.View.getCurrent().roomJid;
    var room = CandyShop.LeftPaneHead.RoomList._rooms[roomJid];

    if (!room)
      return new Promise(function() {});

    if (!room.is_private) {
      return new Promise(function (resolve, reject) {
        var users = $.extend(true, _specialUsers, CandyShop.NitroAjaxApiV1Users._cachedData);
        resolve(users);
      });
    }

    return new Promise(function (resolve, reject) {
      $.ajax({
        type: 'GET',
        context: this,
        url: 'api/v1/connect/rooms/' + room.nitro_id + '.json'
      })
      .done(function(data) {
        var users = data.users.map(function(user, i) {
          return CandyShop.NitroAjaxApiV1Users.fetchByNitroId(user.id, true);
        });
        users = $.extend(true, _specialUsers, users);
        resolve(users);
      });
    });
  };

  self.processUsers = function (users) {
    var currentUserBareJid = Strophe.getBareJidFromJid(Candy.Core.getUser().getJid());

    return _.reject(users, function (user) {
      return user.jid === currentUserBareJid;
    });
  };

  self.startAutoComplete = function() {
    if ($('#context-menu:visible').length > 0) return;
    _autocompleteStarted = true;

    _lastText = '';
    _previousMatches = [];

    // Disable auto-sending of the message on <enter> key
    $(_selector).data('ready-to-send', false);

    // There is a mouseleave bind in Candy's code. Lets remove that out.
    $('#context-menu').unbind('mouseleave');
  };

  /** Function: endAutocomplete
   * Disables autocomplete mode, hiding the context menu
   */
  self.endAutocomplete = function() {
    _autocompleteStarted = false;

    $('#context-menu').hide();
    $(_selector).data('ready-to-send', true);
  };

  /** Function: keyDown
   * The listener for keydown in the menu
   */
  self.keyDown = function(e) {
    var menu = $('#context-menu');
    var content = menu.find('ul');
    var selected = content.find('li.selected');

    if(menu.css('display') === 'none') {
      $(document).unbind('keydown', self.keyDown);
      return;
    }

    switch (e.which) {
      case _keys.UP_ARROW:
        var prevLi = selected.prev('li');
        if (prevLi.length === 0) {
          prevLi = selected.siblings('li:last');
        }

        selected.removeClass('selected');
        prevLi.addClass('selected');

        e.preventDefault();
        break;

      case _keys.DOWN_ARROW:
        var nextLi = selected.next('li');
        if (nextLi.length === 0) {
          nextLi = selected.siblings('li:first');
        }

        selected.removeClass('selected');
        nextLi.addClass('selected');

        e.preventDefault();
        break;

      case _keys.ESC:
        self.endAutocomplete();
        break;

      case _options.completeKeyCode:
      case _keys.ENTER:
        self.endAutocomplete();
        var selected = content.find('li[data-nitroid].selected');

        if (selected.length > 0) {
          self.addNameFromTargetElement(selected);
        } else {
          $('form[class="message-form"]:visible').submit();
        }
        break;
    }
  };

  /** Function: selectOnClick
   * The listener for click on decision in the menu
   *
   * Parameters:
   *   (Event) e - The click event
   */
  self.selectOnClick = function(e) {
    self.addNameFromTargetElement($(e.currentTarget));

    $(_selector).focus();
    e.preventDefault();
  };

  self.addNameFromTargetElement = function(target) {
    var userJid = target.attr('data-userjid');
    if (!userJid)
      return;

    var userName = target.find('.name').text();

    // Needs to immediately finish/enter in name in full so that we can replace it with the ajax call in a bit.
    var msgBox = $(_selector);

    msgBox.val(msgBox.val().replace(_matchLastMentionWithoutSpace, userName + ' ').replace(/@(?![\s\S]*@)/, '@'));

    _replacementSet.push({'userJid': userJid, 'userName': userName});
  };

  // Called to replace each matched name with a hashtag
  self.replaceNamesWithId = function(ev) {
    if (_replacementSet.length == 0) {
      // No more replacements, allow message to be sent
      return true;
    }

    var replaced = 0;
    $.each(_replacementSet, function(i, replacement) {
      if (replacement.userJid === 'All') {
        $(_selector).val($(_selector).val().replace(replacement.userName, 'U#all'));
        if (++replaced >= _replacementSet.length) {
          _replacementSet = [];
          // Trigger the message to be sent now that all replacements are made
          $('form[class="message-form"]:visible').submit();
        }
      } else {
        var login = Strophe.getNodeFromJid(replacement.userJid);

        CandyShop.NitroAjaxApiV1Users.fetchByUserNode(login).then(function (result) {
          var nitroId = result.id;
          nitroId = 'U#' + nitroId;
          $(_selector).val($(_selector).val().replace(replacement.userName, nitroId));
          if (++replaced >= _replacementSet.length) {
            _replacementSet = [];
            // Trigger the message to be sent now that all replacements are made
            $('form[class="message-form"]:visible').submit();
          }
        });
      }
    });

    // Prevent messages from being sent until all replacements are done
    return false;
  };

  self.getListOfMatchesAsListItems = function (matches) {
    if (matches.length === 0) {
      return '<li class="candy-namecomplete-option">No results found</li>'
    }

    var liTemplate = '<li class="candy-namecomplete-option" data-nitroid="{{nitroId}}" data-userjid="{{userJid}}">' +
        '{{#avatarUrl}}<img src="{{avatarUrl}}">{{/avatarUrl}}' +
        '<div>' +
          '<p class="name">{{fullName}}</p>' +
          '<p>{{#territory}}{{territory}} {{department}} - {{title}}{{/territory}}{{description}}</p>' +
        '</div>' +
      '</li>';

    var listItems = [];
    for(var i in matches) {
      var user = matches[i];

      listItems.push(Mustache.to_html(liTemplate, {
        nitroId: user.id,
        userJid: user.jid,
        avatarUrl: user.avatar_thumb_url,
        fullName: user.goes_by + ' ' + user.last_name,
        territory: user.territory,
        department: user.department,
        title: user.title,
        description: user.description
      }));
    }

    return listItems.join('');
  };

  /** Function: showPicker
   * Show the picker for the list of names that match
   */
  self.showPicker = function(matches, elem) {
    var menu = $('#context-menu'),
        content = $('ul', menu);

    content.html(self.getListOfMatchesAsListItems(matches));

    $('li:first', content).addClass('selected');
    $('li', content).bind('click', self.selectOnClick);

    // bind the keydown to move around the menu
    $(_selector).unbind('keydown', self.keyDown).bind('keydown', self.keyDown);

    menu.fadeIn('fast');

    return true;
  };

  return self;
}(CandyShop.NameComplete || {}, Candy, jQuery));
