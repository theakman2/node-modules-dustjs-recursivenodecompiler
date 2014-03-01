# dustjs-recursivenodecompiler

Recursively compile [DustJS templates](https://github.com/linkedin/dustjs) with Node.

## Usage

```html
<!-- /path/to/tmpl1.dust -->
<p>My name is {>"../foo/tmpl2.dust"/}</p>
```

```html
<!-- /path/foo/tmpl2.dust -->
Bob {>"tmpl3.dust"/}
```

```html
<!-- /path/foo/tmpl3.dust -->
Smith
```

```javascript
// On a NodeJS server
var fs = require("fs");
var dust = require("dustjs-recursivenodecompiler");

var contents = fs.readFileSync("/path/to/tmpl1.dust").toString();

// a string containing the compiled tmpl1.dust, tmpl2.dust and tmpl3.dust files, all registered to the `dust` object.
var compiled = dust.compile(contents,"/path/to/tmpl1.dust");

// get a compiled map instead:
var compiledMap = dust.compileMap(contents,"/path/to/tmpl1.dust");
/**
 * `compiledMap` is an object that looks like this:
 * {
 * 	"/path/to/tmpl1.dust": {"registeredAs":"tmpl1.dust","content":"[[compiled javascript]]"}
 * 	"/path/foo/tmpl2.dust": {"registeredAs":"../foo/tmpl2.dust","content":"[[compiled javascript]]"}
 * 	"/path/foo/tmpl3.dust": {"registeredAs":"../foo/tmpl3.dust","content":"[[compiled javascript]]"}
 * }
 */

// convert a compiled map to a string:
var compiled = dust.compiledMapToString(compiledMap);

/**
 * It's also possible to compile recursively with multiple entry templates by
 * making use of the optional third parameter to the `dust.compileMap` method:
 */
var compiledMap = {};
dust.compileMap(entry1Contents,entry1FilePath,compiledMap);
dust.compileMap(entry2Contents,entry2FilePath,compiledMap);
var compiled = dust.compiledMapToString(compiledMap);
```

Using the compiled templates (e.g. in the browser):

```html
<script src="path/to/dust.js"></script>
<script src="path/to/compiled.js"></script>
<script>
	dust.render("tmpl1.dust",{},function(err,out){
		// `out` is '<p>My name is Bob Smith</p>'
	});
</script>
```

By default, partials are registered relative to the directory of the entry template. This means the entry template is registered under its file name.

Other templates compiled as part of the recursive process may also be accessed relative to the entry template's directory:

```javascript
dust.render("../foo/tmpl2.dust",{},function(err,out){
	// `out` is 'Bob Smith'
});
dust.render("../foo/tmpl3.dust",{},function(err,out){
	// `out` is 'Smith'
});
```

You can disable the recursive compilation at any time by calling `dust.setRecursiveCompilation(false)`.

Enable it again by calling `dust.setRecursiveCompilation(true)`.

## Tests [![Build Status](https://travis-ci.org/theakman2/node-modules-dustjs-recursivenodecompiler.png?branch=master)](https://travis-ci.org/theakman2/node-modules-dustjs-recursivenodecompiler)

	$ npm test