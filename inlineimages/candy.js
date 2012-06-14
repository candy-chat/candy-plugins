/** File: candy.js
 * Candy - Chats are not dead yet.
 *
 * Authors
 *   - Manuel Alabor (manuel@alabor.me)
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: InlineImages
 * If a user posts a URL to an image, that image gets rendered directly
 * inside of Candy.
 */
CandyShop.InlineImages = (function(self, Candy, $) {
	/** Object: _options
	 * Options:
	 *   (Array) fileExtensions - The file extensions to replace with an <img /> tag
	 *   (Integer) maxImageSize - The max image size (height and width) of the shown image
	 */
	var _options = {
		fileExtensions: ['png','jpg','jpeg','gif'],
		maxImageSize: 100
	};

	/** Function: init
	 * Initializes the inline-images plugin with the default settings.
	 *
	 * Parameters:
	 *   (Object) options - An options packet to apply to this plugin
	 */
	self.init = function(options) {
		// apply passed in options to this plugin
		$.extend(true, _options, options);

		// add a listener to these events
		$(Candy.View.Pane).on('candy:view.message.beforeShow', self.handleBeforeShow);
		$(Candy.View.Pane).on('candy:view.message.afterShow', self.handleAfterShow);
	};

	/** Function: buildImageLoaderSource
	 * Returns a loader indicator. The handleOnShow method fullfills afterwards
	 * the effective image loading.
	 *
	 * Parameters:
	 *   (String) url - image url
	 *
	 * Returns:
	 *   (String)
	 */
	self.buildImageLoaderSource = function(url) {
		url = url.replace(/^\>/, '').replace(/\<$/, '');
		return '<img class="inlineimages-loader" longdesc="' + url + '" src="candy-plugins/inline-images/spinner.gif" />'
	};

	/** Function: buildImageSource
	 * Returns HTML source to show a URL as an image.
	 *
	 * Parameters:
	 *   (String) url - image url
	 *
	 * Returns:
	 *   (String)
	 */
	self.buildImageSource = function(url, width, height) {
		return '<img src="' + url + '" width="' + width + '" height="' + height + '" />';
	};

	/** Function: handleBeforeShow
	 * Handles the beforeShow event of a message.
	 *
	 * Parameters:
	 *   (String) message - the message to process
	 *
	 * Returns:
	 *   (String)
	 */
	self.handleBeforeShow = function(e, args) {
		var processed = args.message.replace(/(^|[^\/])(www\.[^\.]+\.[\S]+(\b|$))/gi, '$1http://$2');
		args.message = processed.replace(/\>(https?:\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])\</ig, self.replaceCallback);
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
	self.handleAfterShow = function(e, args) {
		$('.inlineimages-loader').each(function(index, element) {
			$(element).removeClass('inlineimages-loader').parent().addClass('inlineimages-link');
			var url = $(element).attr('longdesc');
			var imageLoader = new Image();

			$(imageLoader).load(function() {
				var origWidth = this.width;
				var origHeight = this.height;
				var ratio = Math.min(_options.maxImageSize / origWidth, _options.maxImageSize / origHeight);
				var width = Math.round(ratio * origWidth);
				var height = Math.round(ratio * origHeight);

				$(element).replaceWith(self.buildImageSource(url, width, height))
			});

			imageLoader.src = url;
		});
	};

	/** Function: replaceCallback
	 * This callback handles matches from the URL regex.
	 * If the callback detects an image URL, it returns an image with a loading
	 * indicator. If it is just a common URL, a link-tag gets returned.
	 *
	 * Paramters:
	 *   (String) match - matched URL
	 *
	 * Returns:
	 *   (String)
	 */
	self.replaceCallback = function(match) {
		var result = match.replace(/^>/, '').replace(/<$/, '');

		var dotPosition = result.lastIndexOf(".");
		if(dotPosition > -1) {
			if(_options.fileExtensions.indexOf(result.substr(dotPosition+1)) != -1) {
				result = self.buildImageLoaderSource(match);
			}
		}

		result = '>' + result + '<';

		return result;
	};

	return self;
}(CandyShop.InlineImages || {}, Candy, jQuery));