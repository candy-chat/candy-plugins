# Inline Images
If a user posts a URL to an image, that image gets rendered directly inside of Candy.

## Initialization
To use the Inline Images plugin, just add one of the ´init´ methods to your bootstrap:

	// init with default settings:
	CandyShop.InlineImages.init();
	
	// customized initialization:
	CandyShop.InlineImages.initWithFileExtensions(['png','jpg']);  // only recognize PNG and JPG files as image
	CandyShop.InlineImages.initWithMaxImageSize(150);  // resize images to a maximum edge size of 150px
	CandyShop.InlineImages.initWithFileExtensionsAndMaxImageSize(['png','jpg'], 150);  // combination of the above examples