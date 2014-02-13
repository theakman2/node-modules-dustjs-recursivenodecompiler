# node-modules-dustjs-recursivenodecompiler

A version of the [dustjs-linkedin module](https://github.com/linkedin/dustjs) that allows recursive compilation via NodeJS.

## Usage

```html
<!-- path/to/tmpl1.dust -->
<p>My name is {>"../foo/tmpl2.dust"/}</p>
```

```html
<!-- path/foo/tmpl2.dust -->
Bob {>"tmpl3.dust"/}
```

```html
<!-- path/foo/tmpl3.dust -->
Smith
```

```javascript
// On a NodeJS server
var fs = require("fs");
var dust = require("dustjs-recursivenodecompiler");

var contents = fs.readFileSync("path/to/tmpl1.dust").toString();

// a string containing the compiled tmpl1.dust, tmpl2.dust and tmpl3.dust files, all registered to the `dust` object.
var compiled = dust.compile(contents,"path/to/tmpl1.dust");

// an array containing the compiled contents of tmpl1.dust, tmpl2.dust and tmpl3.dust as separate elements.
var compiledArray = dust.compileArray(contents,"path/to/tmpl1.dust");

```

Using the compiled templates (e.g. in the browser):

```html
<script src="path/to/dust.js"></script>
<script src="path/to/compiled.js"></script>
<script>
	dust.render("_AUTO_TEMPLATE_NAME%0",{},function(err,out){
		// `out` is '<p>My name is Bob Smith</p>'
	});
</script>
```

This module overwrites the filepaths to the partials so they're not present after compilation. The entry template is always at `_AUTO_TEMPLATE_NAME%0`. 

You can disable the recursive compilation at any time by setting `dust.ENABLE_RECURSIVE_COMPILATION` to `false`.

## Tests [![Build Status](https://travis-ci.org/theakman2/node-modules-dustjs-recursivenodecompiler.png?branch=master)](https://travis-ci.org/theakman2/node-modules-dustjs-recursivenodecompiler)

	$ npm test