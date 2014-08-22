//= require jquery-fileupload/basic

/** File: dragdrop.js
 * Candy Plugin Drag and Drop
 * Author: Melissa Adamaitis <madamei@mojolingo.com>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.DragDrop = (function(self, Candy, $) {
  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Drag and Drop
   *  (Float) version - 1.0
   */
  self.about = {
    name: 'Candy Plugin Drag and Drop',
    version: '1.0'
  };

  /**
   * Initializes the CreateRoom plugin with the default settings.
   */
  self.init = function(){
    $('#fileupload').fileupload({
      drop: function (e, data) {
        // Show that the image is loading.
        Candy.View.Pane.Chat.Modal.show(self.Template.loading, false, true);
      },
      done: function (e, data) {
        // Put the file url in the form input area.
        $('.room-pane:visible .message-form input[name="message"]').val(window.location.origin + data.result.path);
        // On image upload completion, remove the loading modal.
        Candy.View.Pane.Chat.Modal.hide();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        Candy.View.Pane.Chat.Modal.show(Mustache.to_html(self.Template.failedUpload,
          {errorMessage: errorThrown, statusCode: jqXHR.status}), true, false);
      },
      progressall: function (e, data) {
        var progress = parseInt(data.loaded / data.total * 100, 10);
        $('.file-progress-bar .bar').css('width', progress + '%');
      }
    });

    $(Candy).on('candy:view.room.after-add', function() {
      // Add the dropzone.
      $('.message-form-wrapper').before(self.Template.dropzone);
    });

    // Bind on dragover.
    $(document).bind('dragover', function (e) {
      var dropZone = $('.room-pane:visible .message-form-dropzone'),
        timeout = window.dropZoneTimeout;

      dropZone.addClass('show');

      if (!timeout) {
        dropZone.addClass('in');
      } else {
        clearTimeout(timeout);
      }

      var found = false,
        node = e.target;

      do {
        if (node === dropZone[0]) {
          found = true;
          break;
        }
        node = node.parentNode;
      } while (node !== null);

      if (found) {
        dropZone.addClass('hover');
      } else {
        dropZone.removeClass('hover');
      }

      window.dropZoneTimeout = setTimeout(function () {
        window.dropZoneTimeout = null;
        dropZone.removeClass('in hover show');
      }, 100);
    });

    $(document).bind('drop', function(e) {
      // On a successful drop, put it in the input bar.
      $('.room-pane:visible .message-form-dropzone').removeClass('in hover show');
    });

    // Prevent the default browser action.
    $(document).bind('drop dragover', function (e) {
      e.preventDefault();
    });
  };

  self.Template = {
    dropzone: '<div class="message-form-dropzone"></div>',
    failedUpload: '<h4>File Upload Error</h4><p>{{statusCode}}: {{errorMessage}}</p>',
    loading: '<h4>Loading...</h4><div class="file-progress-bar"><div class="bar" style="width: 0%"></div></div>'
  };

  return self;
}(CandyShop.DragDrop || {}, Candy, jQuery));
