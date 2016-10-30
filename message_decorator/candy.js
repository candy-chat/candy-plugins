/** File: messagedecorator.js
 * Candy - Chats are not dead yet.
 *
 * Authors:
 *   - Ben Klang <bklang@mojolingo.com>
 *
 * Copyright:
 *   (c) 2015 Power Home Remodeling Group
 */
var CandyShop = (function(self) { return self; }(CandyShop || {}));

/** Class: CandyShop.MessageDecorator
 * Converts certain text markup characters to HTML, such as *bold* and _italic_
 */
CandyShop.MessageDecorator = (function(self, Candy, $) {

  self.init = function() {
    $(Candy).on('candy:view.message.before-render', function(e, args) {
      try {
        args.templateData.message = self.markup(args.templateData.message);
      } catch(ex) {
        Candy.Core.error('[CandyShop MessageDecorator]', ex);
      }
    });
  };

  self.markup = function(message) {
    // Syntax highlighting:
    // `foo` => <code>foo</code>
    // *foo* => <strong>foo</strong>
    // _foo_ => <em>foo</em>
    // Rules:
    // 1. It must work with more than one match is found on a line
    // 2. It must ignore bold/italic within a code segment: `*bar*` would become <code>*bar*</code>
    // 3. It is acceptable to not work if the markup character is not after a whitespace: foo`bar` would not be marked up
    // Test cases:
    // *bold*
    // _italic_
    // `code`
    // *bold* *bold* _italic_ _italic_ `code` `code`
    // *bold* _italic_ `code` *bold* _italic_ `code`
    // *bold* _italic_ `code` _italic_ *bold*
    //
    // The following should not apply markup within the code segment:
    // *bold* `code *not bolded* _not italicized_ code` _italic_
    //
    // The following should not be changed
    // * Foo
    // # Foo
    //
    // The following should not be marked up at all:
    // * not bold * and more * not bolded * words

    // Keep track of code segments with placeholders so we can avoid undesired
    // bold/italics within them
    var codeSegments = [];
    message = message.replace(/(\s|^)`([^`\s][^`]+)`/g, function(match, leadingSpace, code, offset) {
      codeSegments.push(code);
      return leadingSpace + "\0";
    });

    message = applyBold(message);
    message = applyItalic(message);

    // With the code sections safely extracted to codeSegments,
    // apply bold/italic markup on remaining content
    message = applyBold(message);
    message = applyItalic(message);

    // Now put the code segments back in their placeholders
    message = message.replace(/\0/g, function() {
      return '<code>' + codeSegments.shift() + '</code>';
    });
    return message;

  };

  function applyBold(message) {
    return applyStyle(message, '*', 'strong')
  }

  function applyItalic(message) {
    return applyStyle(message, '_', 'em')
  }

  function applyStyle(message, delimiter, tag) {
    delimiter = RegExp.quote(delimiter);
    regex = new RegExp('(\\s|^)' + delimiter + '([^' + delimiter + '\\s][^' + delimiter + ']+)' + delimiter, 'g');
    return message.replace(regex, '$1<' + tag + '>$2</' + tag + '>');
  }

  return self;
}(CandyShop.MessageDecorator || {}, Candy, jQuery));
