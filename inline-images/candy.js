/*
 * inline-images
 * @version 1.0
 * @author Manuel Alabor (manuel@alabor.me)
 * @author Jonatan Männchen <jonatan@maennchen.ch>
 *
 * If a user posts a URL to an image, that image gets rendered directly
 * inside of Candy.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.InlineImages = (function(self, Candy, $) {

	var _fileExtensions = ['png','jpg','jpeg','gif']
		, _maxImageSize = 100
		, _replaceRegex = />(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])</ig;

	/** Function: init
	 * Initializes the inline-images plugin with the default settings.
	 */
	self.init = function() {
		$(Candy).on('candy:view.message.before-show', handleBeforeShow);
		$(Candy).on('candy:view.message.after-show', handleOnShow);
	};

	/** Function: initWithFileExtensions
	 * Initializes the inline-images plugin with the possibility to pass an
	 * array with all the file extensions you want to display as image.
	 *
	 * Parameters:
	 *   (String array) fileExtensions - Array with extensions (jpg, png, ...)
	 */
	self.initWithFileExtensions = function(fileExtensions) {
		_fileExtensions = fileExtensions;
		self.init();
	};

	/** Function: initWithMaxImageSize
	 * Initializes the inline-images plugin with the possibility to pass the
	 * maximum image size for displayed images.
	 *
	 * Parameters:
	 *   (int) maxImageSize - Maximum edge size for images
	 */
	self.initWithMaxImageSize = function(maxImageSize) {
		_maxImageSize = maxImageSize;
		self.init();
	};

	/** Function: initWithFileExtensionsAndMaxImageSize
	 * Initializes the inline-images plugin with the possibility to pass an
	 * array with all the file extensions you want to display as image and
	 * the maximum image size for displayed images.
	 *
	 * Parameters:
	 *   (String array) fileExtensions - Array with extensions (jpg, png, ...)
	 *   (int) maxImageSize - Maximum edge size for images
	 */
	self.initWithFileExtensionsAndMaxImageSize = function(fileExtensions, maxImageSize) {
		_fileExtensions = fileExtensions;
		_maxImageSize = maxImageSize;
		self.init();
	};


	/** Function: handleBeforeShow
	 * Handles the beforeShow event of a message.
	 *
	 * Paramteres:
	 *   (Object) args - {roomJid, element, nick, message}
	 *
	 * Returns:
	 *   (String)
	 */
	var handleBeforeShow = function(e, args) {
		var message = args.message,
			xhtmlMessage = args.xhtmlMessage;
		var processed = message.replace(_replaceRegex, replaceCallback);
		args.message = processed;
		if(xhtmlMessage) {
			var processedXhtml = xhtmlMessage.replace(_replaceRegex, replaceCallback);
			args.xhtmlMessage = processedXhtml;
		}
		return processed;
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
		$('.inlineimages-loader').each(function(index, element) {
			$(element).removeClass('inlineimages-loader');
			var url = $(element).attr('longdesc');
			var imageLoader = new Image();

			$(imageLoader).load(function() {
				var origWidth = this.width;
				var origHeight = this.height;
				if(origWidth > _maxImageSize || origHeight > _maxImageSize) {
					var ratio = Math.min(_maxImageSize / origWidth, _maxImageSize / origHeight);
					var width = Math.round(ratio * origWidth);
					var height = Math.round(ratio * origHeight);
				}

				$(element).replaceWith(buildImageSource(url, width, height))
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
	 *   (String) uselessMatch - whole url with ">" and "<"
	 *   (String) match - matched URL
	 *
	 * Returns:
	 *   (String)
	 */
	var replaceCallback = function(uselessMatch, match) {
		var result = match;

		var dotPosition = match.lastIndexOf(".");
		if(dotPosition > -1) {
			if(_fileExtensions.indexOf(match.substr(dotPosition+1)) != -1) {
				result = buildImageLoaderSource(match);
			}
		}
		return '>' + result + '<';
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
	var buildImageLoaderSource = function(url) {
		return '<img class="inlineimages-loader" longdesc="' + url + '" src="candy-plugins/inline-images/spinner.gif" />';
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
	var buildImageSource = function(url, width, height) {
		return '<a href="' + url + '" target="_blank" class="inlineimages-link"><img src="' + url + '" width="' + width + '" height="' + height + '"/></a>';
	};

	return self;
}(CandyShop.InlineImages || {}, Candy, jQuery));
