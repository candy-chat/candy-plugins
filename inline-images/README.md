# Inline Images
If a user posts a URL to an image, that image gets rendered directly inside of Candy.

## Initialization
To use the Inline Images plugin, just add one of the ´init´ methods to your bootstrap:

	// init with default settings:
	CandyShop.InlineImages.init();
	
	// customized initialization:
	CandyShop.InlineImages.initWithFileExtensions(['png','jpg']);
	CandyShop.InlineImages.initWithMaxImageSize(150);
	CandyShop.InlineImages.initWithFileExtensionsAndMaxImageSize(['png'], 150);