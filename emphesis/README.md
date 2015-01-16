# Emphesis

Basic message formatting, with xhtml conversion.

Textile, BBCode, and Html Variants are supported:

**bold**
```
*bold*
[b]bold[/b]
<b>bold</b>
<strong>bold</strong>
```

_italic_
```
_italic_
[i]italic[/i]
<i>italic</i>
<em>italic</em>
```

<ins>underlined</ins>
```
+underlined+
[u]underlined[/u]
<u>underlined</u>
<ins>underlined</ins>
```

~~strikethrough~~
```
-strikethrough-
[s]strikethrough[/s]
<s>strinkethough</s>
<del>strikethrough</del>
```

## Usage
Include the JavaScript file:

```HTML
<script type="text/javascript" src="candyshop/emphesis/candy.js"></script>
```

Call its `init()` method after Candy has been initialized:

```javascript
Candy.init('/http-bind/', {});

// enable /me handling
CandyShop.Emphesis.init();

Candy.Core.connect();
```
