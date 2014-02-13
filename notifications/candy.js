/*
 * HTML5 Notifications
 * @version 1.0
 * @author Jonatan Männchen <jonatan@maennchen.ch>
 *
 * Notify user if new messages come in.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Notifications = (function(self, Candy, $) {
	/** Object: _options
	 * Options for this plugin's operation
	 *
	 * Options:
	 *   (Boolean) notifyNormalMessage - Notification on normalmessage. Defaults to false
	 *   (Boolean) notifyPersonalMessage - Notification when I'm mentioned. (Reuqires NotifyMe Plugin) Defaults to true
	 *   (Integer) closeTime - Time until closing the Notification. (0 = Don't close) Defaults to 3000
	 */
	var _options = {
		notifyNormalMessage: false,
		notifyPersonalMessage: true,
		closeTime: 3000
	};
	
	/** Function: init
	 * Initializes the notifications plugin.
	 * 
	 * Parameters:
	 *   (Object) options - The options to apply to this plugin
	 *   
	 * @return void
	 */
	self.init = function(options) {
		// apply the supplied options to the defaults specified
		$.extend(true, _options, options);
		
		// Just init if notifications are supported
		if (window.webkitNotifications) {
			// Setup Permissions (has to be kicked on with some user-events)
			jQuery(document).one('click keydown', setupPermissions);
			
			// Add Listener for Notifications
			$(Candy).on('candy:view.message.after-show', handleOnShow);
		}
	};
	
	/** Function: checkPermissions
	 * Check if the plugin has permission to send notifications.
	 * 
	 * @return boid
	 */
	function setupPermissions() {
		// Check if permissions is given
		if (window.webkitNotifications.checkPermission() != 0) { // 0 is PERMISSION_ALLOWED
			// Request for it
			window.webkitNotifications.requestPermission();
		}
	};
	

	/** Function: handleOnShow
	 * Descriptions
	 *
	 * Parameters:
	 *   (Array) args
	 * 
	 * @return void
	 */
	function handleOnShow(e, args) {
		// Check if window has focus, so no notification needed
		if (!document.hasFocus()) {
			// Check if notifications are allowed
			if (window.webkitNotifications.checkPermission() == 0) { // 0 is PERMISSION_ALLOWED
				var sendNotification = _options.notifyNormalMessage;
				
				if(_options.notifyPersonalMessage && typeof args.forMe != 'undefined' && args.forMe) {
					sendNotification = true;
				}
				
				if(sendNotification) {
					var message = args.message;
					
					// Send Notification
					var notification = window.webkitNotifications.createNotification(
							window.location + '/' + Candy.View.getOptions().resources + '/img/favicon.png',
							args.name,
							message);
					notification.show();
					
					// Close it after 3 Seconds
					if(_options.closeTime) {
						window.setTimeout(function() { notification.close(); }, _options.closeTime);
					}
				}
			}
		}
	};

	return self;
}(CandyShop.Notifications || {}, Candy, jQuery));
