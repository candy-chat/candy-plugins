/*
 * grouped-messages
 * @version 1.0
 * @author Ben Klang <bklang@mojolingo.com>
 *
 * Visually group subsequent messages from the same sender
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.GroupedMessages = (function(self, Candy, $) {

  /**
   * groupDelay: Amount of time (ms) after which subsequent messages should be in a different group. Default: 5 minutes (300,000)
   */
  var _options = {
    groupDelay: 300000,
  };

  /** Function: init
   * Initializes the grouped-messages plugin with the default settings.
   */
  self.init = function(options) {
    // Apply the supplied options to the defaults specified
    $.extend(true, _options, options);

    $(Candy).on('candy:view.message.after-show', handleOnShow);
  };

  /** Function: handleOnShow
   * Each time a message gets displayed, this method checks for possible
   * image loaders (created by buildImageLoaderSource).
   * If there is one, the image "behind" the loader gets loaded in the
   * background. As soon as the image is loaded, the image loader gets
   * replaced by proper scaled image.
   *
   * Parameters:
   *   (Array) args
   */
  var handleOnShow = function(e, args) {
    var sender = args.name;
    var prev_message = args.element.prev();
    var prev_sender = prev_message.attr('data-sender-name');
    var prev_timestamp = new Date(prev_message.attr('data-timestamp'));
    if (prev_sender === sender && Date.now() - prev_timestamp < _options.groupDelay) {
      $(args.element).addClass('grouped');
      $(args.element).prev().addClass('grouped-parent');
    }
  };

  return self;
}(CandyShop.GroupedMessages || {}, Candy, jQuery));
