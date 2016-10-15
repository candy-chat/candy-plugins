/** File: register.js
 * Candy Plugin Register
 * Author: Gérald Sédrati-Dinet <gibus@sedrati-dinet.net>
 */

var CandyShop = (function(self) { return self; }(CandyShop || {}));

CandyShop.Register = (function(self, Candy, $) {
  self._options = {
    domain: null
  }
  /** Object: about
   *
   * Contains:
   *  (String) name - Candy Plugin Register
   *  (Float) version - Candy Plugin Register
   */
  self.about = {
    name: 'Candy Plugin Register',
    version: '0.1'
  };

  /** Function: init
   * Initializes the Register plugin with the default settings.
   */
  self.init = function(options) {
    // apply the supplied options to the defaults specified
    $.extend(true, self._options, options);

    // add the translations
    self.applyTranslations();
  };

  /** Function: showRegistrationForm
   * Show the registration modal form.
   *
   * Parameter:
   * (String) msg - optional message to display above the form
   */
  self.showRegistrationForm = function(msg) {
    // Hide login/registration modal forms
    $('#login-form').hide();
    $('#registration-form').hide();

    // Build the registration form
    Candy.View.Pane.Chat.Modal.show(Mustache.to_html(self.Template.registrationForm, {
      _labelUsername: $.i18n._("labelUsername"),
      _labelPassword: $.i18n._("labelPassword"),
      _registrationSubmit: $.i18n._("registrationSubmit")
    }), false, false, null);

    // Show error message if needed
    if (msg) {
      $('#registration-msg').html(msg);
    }
    // Prevent event bubbling
    $('#registration-form').click(function(event) {
      event.stopPropagation();
    });

    // Focus on user name field
    $('#registration-form #username').focus();

    // Reset Strophe connection in order to attempt another registration after previous one failed
    Candy.Core.getConnection().reset();

    // Attach submit handler
    self.addRegistrationFormHandler();
  };

  /** Function addRegistrationFormHandler
   * Process registration form
   */
  self.addRegistrationFormHandler = function() {
    $('#registration-form').submit(function(event) {
      event.preventDefault();

      var uname = $('#registration-form #username').val();
      var upass = $('#registration-form #password').val();

      // Get Strophe connection
      var connection = Candy.Core.getConnection();

      // Process server replies
      var callback = function (status) {
        if (status === Strophe.Status.REGISTER) {
          // Fill out the fields
          connection.register.fields.username = uname;
          connection.register.fields.password = upass;
          // Call submit will continue the registration process
          connection.register.submit();
        } else if (status === Strophe.Status.REGISTERED) {
          Candy.Core.log("registered!");
          // Connect the registered JID with Candy.
          if (!connection.register.fields.username || !connection.register.domain || !connection.register.fields.password) {
            Candy.Core.log("Register a JID first!");
            self.showRegistrationForm($.i18n._("incompleteRegistration"));
          }
          else {
            Candy.Core.connect(connection.register.fields.username + "@" + connection.register.domain, connection.register.fields.password);
          }
        } else if (status === Strophe.Status.CONFLICT) {
          // User already exists
          Candy.Core.log("Contact already existed!");
          self.showRegistrationForm($.i18n._("userExists"));
        } else if (status === Strophe.Status.NOTACCEPTABLE) {
          // Registration information are not acceptable
          Candy.Core.log("Registration form not properly filled out.");
          self.showRegistrationForm($.i18n._("notAcceptable"));
        } else if (status === Strophe.Status.REGIFAIL) {
          // In-Band Registration not supported
          Candy.Core.log("The Server does not support In-Band Registration");
          self.showRegistrationForm($.i18n._("registrationNotSupported"));
        } else if (status !== Strophe.Status.CONNECTING) {
          // Unknown error
          Candy.Core.log("Unknown error status=" + status);
          self.showRegistrationForm($.i18n._("registrationError"));
        }
      };

      // Connect with Stophe.register plugin
      connection.register.connect("pirenaica.fr", callback, 60, 1);
    });
  }

  /** Function: applyTranslations
   * Apply translations to this plugin
   */
  self.applyTranslations = function() {
    var registerTranslations = {
      'registrationSubmit': {
        'en': "Register",
        'fr': "Inscription"
      },
      'incompleteRegistration': {
        'en': "Incomplete registration, please provide a username and a password.",
        'fr': "Inscription incomplète, merci de renseigner un nom d'utilisateur et un mot de passe"
      },
      'userExists': {
        'en': "This username already exists, please choose another one.",
        'fr': "Cet utilisateur existe déjà, merci d'en choisir un autre",
      },
      'notAcceptable': {
        'en': "Incorrect username or password, please choose another one.",
        'fr': "Nom d'utilisateur ou mot de passe incorrect, merci d'en choisir un autre"
      },
      'registrationNotSupported': {
        'en': "Registration is not available for the moment, please try again later.",
        'fr': "L'inscription n'est pas possible pour l'instant, merci d'essayer à nouveau plus tard"
      },
      'registrationError': {
        'en': "Error with registration, please try again later.",
        'fr': "Erreur dans l'inscription, merci d'essayer à nouveau plus tard"
      }
    };

    $.each(registerTranslations, function(key, val) {
      $.each(val, function(k, v) {
        if(Candy.View.Translation[k]) {
          Candy.View.Translation[k][key] = v;
        }
      });
    });
  };

  self.Template = {
    registrationForm: '<div id="registration-msg"></div>' +
      '<form method="post" id="registration-form" class="login-form">' +
      '<label for="username">{{_labelUsername}}</label>' +
      '<input id="username" name="username" type="text">' +
      '<label for="password">{{_labelPassword}}</label>' +
      '<input id="password" name="password" type="password">' +
      '<input type="submit" class="button" value="{{_registrationSubmit}}" />' +
      '</form>'
  };

  return self;
}(CandyShop.Register || {}, Candy, jQuery));
