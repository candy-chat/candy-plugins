/** File: bookmark.js
 * Candy Plugin - Bookmark Rooms
 * Author: Rafael Macedo <rafael.macedo@codeminer42.com>
 * Author: Ben Langfeld <blangfeld@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Bookmark = (function(self, Candy, $) {

  self.Bookmark = (function() {
    function Bookmark(type, args) {
      this.type       = type;
      this.jid        = args.jid;
      this.name       = args.name || args.jid.split(/@/)[0];
      this.id         = args.room_id || args.user_id;
      this.term       = args.term;
      this.to         = args.to;
      this.opened     = false;
      this.is_private = args.is_private;
      this.pending_removal = false;
    }

    Bookmark.prototype.join = function(foreground) {
      if (!this.opened) {
        if (this.type.match(/users/)) {
          Candy.View.Pane.PrivateRoom.open(this.jid, this.name, foreground, true);
        } else if (this.type.match(/rooms/)) {
          var data = { roomJid: this.jid, name: this.name, is_private: this.is_private, room_id: this.id };
          CandyShop.JoinOnResponse.joinRoom(data, false, foreground);
        } else {
          Candy.Core.warn('Error: unknown bookmark type: ', this.type);
        }
        this.opened = true;
      }
    };

    Bookmark.prototype.leave = function() {
      if (this.type.match(/users/)) {
        Candy.View.Pane.Room.close(this.jid);
      } else if (this.type.match(/rooms/)) {
        Candy.Core.Action.Jabber.Room.Leave(this.jid);
      }
    };

    Bookmark.prototype.toArgs = function() {
      var args = {};

      if (this.id) {
        if (this.type.match(/users/)) {
          args.user_id = this.id;
        } else if (this.type.match(/rooms/)) {
          args.room_id = this.id;
        }
      } else  {
        if (this.type.match(/users/)) {
          args.user_jid = this.jid;
        } else if (this.type.match(/rooms/)) {
          args.room_jid = this.jid;
        }
      }

      return args;
    };

    return Bookmark;
  })();

  self.BookmarkCollection = (function() {
    function BookmarkCollection() {
      this.collection = [];
      this.version = undefined;
    }

    BookmarkCollection.prototype.add = function(bookmark, newlyAdded) {
      if (this.collection.filter(function(item) { return item.jid === bookmark; }).length === 0) {
        if (newlyAdded) {
          this.collection.unshift(bookmark);
          if (Candy.Core.getConnection().connected === true) {
            bookmark.join();
          }
        } else {
          this.collection.push(bookmark);
        }
      }
      return this.collection;
    };

    BookmarkCollection.prototype.joinAll = function() {
      this.collection.forEach(function (bookmark, position, collection) {
        var foreground = false;
        if (CandyShop.RoomAnchors.roomAnchorJid()) {
          // This bookmark matches the room in the URL
          if (CandyShop.RoomAnchors.roomAnchorJid() === bookmark.jid) {
            foreground = true;
          }
        } else if (position === 0) {
          foreground = true;
        }
        bookmark.join(foreground);
      });
    }

    BookmarkCollection.prototype.jids = function() {
      return this.collection.map(function(bookmark) {
        return bookmark.jid;
      });
    };

    BookmarkCollection.prototype.pendingRemoval = function() {
      return this.collection.filter(function(item) { return item.pending_removal; });
    };

    BookmarkCollection.prototype.valid = function() {
      return this.collection.filter(function(item) { return !item.pending_removal; });
    };

    BookmarkCollection.prototype.tryRemoveByJid = function(jid) {
      this.collection.forEach(function (item) {
        if (item.jid === jid) {
          item.pending_removal = true;
        }
      });
    };

    BookmarkCollection.prototype.removeByJid = function(jid) {
      this.collection = this.collection.filter(function(bookmark) {
        return bookmark.jid !== jid;
      });
    };

    BookmarkCollection.prototype.reset = function(data) {
      for (var key in data) {
        data[key].forEach($.proxy(function(obj) {
          self.bookmarks.add(new self.Bookmark(key, obj));
        }), this);
      }
    };

    BookmarkCollection.prototype.sync = function(data) {
      for (var key in data) {
        data[key].forEach($.proxy(function(obj) {
          if ($.inArray(obj.jid, self.bookmarks.jids()) === -1) {
            self.bookmarks.add(new self.Bookmark(key, obj));
          }
        }), this);
      }

      var jids = [];
      jids = jids.concat(data.connect_bookmarked_users.map(function(i) { return i.jid; }));
      jids = jids.concat(data.connect_bookmarked_rooms.map(function(i) { return i.jid; }));

      this.valid().forEach($.proxy(function(item) {
        if ($.inArray(item.jid, jids) === -1) {
          this.removeByJid(item.jid);
          item.leave();
        }
      }), this);
    };

    BookmarkCollection.prototype.setVersion = function(version) {
      this.version = version;
    };

    BookmarkCollection.prototype.toArgs = function() {
      var args = {};
      var valid = this.valid();

      args.version = this.version;

      args.connect_bookmarked_users =
        valid.filter(function(bookmark) {
          return bookmark.type === 'connect_bookmarked_users';
        }).map(function(bookmark) { return bookmark.toArgs(); });

      args.connect_bookmarked_rooms =
        valid.filter(function(bookmark) {
          return bookmark.type === 'connect_bookmarked_rooms';
        }).map(function(bookmark) { return bookmark.toArgs(); });

      return args;
    };

    BookmarkCollection.prototype.type = function(type) {
      return this.collection.filter(function(bookmark) {
         return bookmark.type === 'connect_bookmarked_' + type;
      });
    };

    return BookmarkCollection;
  })();

  self.requestHandler = undefined;

  self.init = function() {
    self.bookmarks = new self.BookmarkCollection();
    self._addEventListeners();
  };

  self._addEventListeners = function() {
    $(Candy)
      .on('candy:core.presence.error', self._removeBookmarkPresenceError)
      .on('candy:view.room.after-close', self._removeBookmark)
      .on('candy:view.room.after-add', self._onRoomOpen)
      .on('candy:view.connection.status-' + Strophe.Status.CONNECTED, self.joinAll)
      .on('candy:view.connection.status-' + Strophe.Status.ATTACHED, self.joinAll);
  };

  self.joinAll = function () {
    self.bookmarks.joinAll();
  };

  self.fetchBookmarks = function(data) {
    self.bookmarks.setVersion(data.version);
    delete data.version;
    self.bookmarks.reset(data);
  };

  self._onRoomOpen = function(e, args) {
    if (self.bookmarks) {
      if ($.inArray(args.roomJid, self.bookmarks.jids()) === -1) {
        var bookmark;
        var type;

        if (args.type === 'chat') {
          type = 'connect_bookmarked_users';
        } else if (args.type === 'groupchat') {
          type = 'connect_bookmarked_rooms';
        }

        if (type) {
          bookmark = new self.Bookmark(type, { jid: args.roomJid });
          self.bookmarks.add(bookmark, true);
          self._updateBookmarks();
        }
      }

      // Re-sort the order of Rooms, and One-on-One chats to match
      // the order of the bookmarks
      var chatTabs   = $('#chat-tabs');
      var roomsHead  = $('#rooms-head').detach();
      var rooms      = chatTabs.find('.roomtype-groupchat').detach();
      var peopleHead = $('#people-head').detach();
      var people     = chatTabs.find('.roomtype-chat').detach();

      // TODO: DRY
      chatTabs.append(roomsHead);
      self.bookmarks.type('rooms').map(function(bookmark) {
        chatTabs.append(rooms.filter(function(i, room) {
          return $(room).attr('data-roomjid') === bookmark.jid;
        }));
      });

      chatTabs.append(peopleHead);
      self.bookmarks.type('users').map(function(bookmark) {
        chatTabs.append(people.filter(function(i, user) {
          return $(user).attr('data-roomjid') === bookmark.jid;
        }));
      });
    }
  };

  self._removeBookmarkPresenceError = function(e, args) {
    if ($(args).attr('error') && Strophe.getBareJidFromJid($(args).attr('from')) !== Strophe.getBareJidFromJid(Candy.Core.getUser().getJid())) {
      self._removeBookmark(e, args);
    }
  };

  self._removeBookmark = function(e, args) {
    if (args.roomJid) {
      self.bookmarks.tryRemoveByJid(args.roomJid);
      window.clearTimeout(self.requestHandler);
      self.requestHandler = window.setTimeout(self._updateBookmarks, 300);
    }
  };

  self._updateBookmarks = function() {
    $.ajax({
      type: 'PUT',
      url: '/api/v1/connect/bookmarks',
      contentType: 'application/json',
      data: JSON.stringify(self.bookmarks.toArgs()),
      statusCode: {
        409: function() {
          CandyShop.ConnectStateData.fetch().done(function(data) {
            self.bookmarks.setVersion(data.bookmarks.version);
            delete data.bookmarks.version;
            self.bookmarks.sync(data.bookmarks);
            self._updateBookmarks();
          });
        }
      }
    }).done(function(data) {
      self.bookmarks.setVersion(data.version);
      delete data.version;
      self.bookmarks.sync(data);

      self.bookmarks.pendingRemoval().forEach(function (bookmark) {
        if (self._serverHasBookmark(bookmark.jid, data)) {
          // The server still has this bookmark. We need to sync again
          self._removeBookmark(undefined, { roomJid: bookmark.jid });
        } else {
          // This bookmark was removed from the server. Remove it from our local collection
          self.bookmarks.removeByJid(bookmark.jid);
        }
      });
    });
  };

  self._serverHasBookmark = function (jid, data) {
    var has = false;
    for (var key in data) {
      data[key].forEach(function (bookmark) {
        if (bookmark.jid == jid) {
          has = true;
        }
      })
    }
    return has;
  }

  return self;
}(CandyShop.Bookmark || {}, Candy, jQuery));
