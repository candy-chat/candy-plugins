/** navigable_list.js
 *  Plugin to nagivate through items on list with arrow keys
 *  Author: Rafael Macedo <rafael.macedo@codeminer42.com>
 */

var NavigableList = (function() {
  function NavigableList(container, list) {
    this.container = container;
    this.list = list;
    this.index = -1;
  };

  NavigableList.init = function(container, list) {
    var instance = new this(container, list);
    instance.init();
    return instance;
  };

  NavigableList.prototype.init = function() {
    this.addEventListeners();
  };

  NavigableList.prototype.reset = function(list) {
    this.list.removeClass('current');
    this.list = list;
    this.index = -1;
  };

  NavigableList.prototype.addEventListeners = function() {
    this.container.on("keyup", $.proxy(function(e) {
      var key = e.keyCode || e.which;
      if (key === 40) {
        this.next(function(navigableList) {
          navigableList.highlightCurrent();
        });
      } else if (key === 38) {
        this.prev(function(navigableList) {
          navigableList.highlightCurrent()
        });
      }
    }, this));
  };

  NavigableList.prototype.current = function() {
    return $(this.list[this.index]);
  };

  NavigableList.prototype.highlightCurrent = function() {
    this.list.removeClass('current');
    this.current().addClass('current').focus();
  };

  NavigableList.prototype.next = function(callback) {
    if (this.index >= this.list.length - 1) {
      this.index = 0;
    } else {
      this.index++;
    }

    callback(this);
  };

  NavigableList.prototype.prev = function(callback) {
    if (this.index === 0) {
      this.index = this.list.length - 1;
    } else {
      this.index--;
    }

    callback(this);
  };

  return NavigableList;
})();
