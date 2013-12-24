/*
 * HTML5 Notifications
 * @version 1.0
 * @author Jonatan Männchen <jonatan@maennchen.ch>
 *
 * Notify user if new messages come in.
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Notifications = (function(self, Candy, $) {
	/** Function: init
	 * Initializes the notifications plugin.
	 * 
	 * @return void
	 */
	self.init = function() {
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
				// Send Notification
				var notification = window.webkitNotifications.createNotification(
						window.location + '/' + Candy.View.getOptions().resources + '/img/favicon.png',
						args.name,
						args.message);
				notification.show();
			}
		}
	};

	return self;
}(CandyShop.Notifications || {}, Candy, jQuery));
