var vm = require("vm");

var dust = require("../lib/server.js");

var compiler = require("../node_modules/dustjs-linkedin/lib/compiler.js");

var nonexistentPath = "/f8sh0asjv9foo/bs9gja39fjsr/b1jf0sjaz.dust";

require("tap").test("disable recursive compilation",function(t){
	dust.setRecursiveCompilation(false);
	var compiled = dust.compile('Hi {>"'+nonexistentPath+'"/}!',"/path/to/tmpl.dust");
	var context = vm.createContext({dust:dust});
	vm.runInContext(compiled,context);
	
	var keys = Object.keys(dust.cache);
	
	t.strictEqual(
		keys.length,
		1,
		"dust should only have one registered template"
	);
	
	t.strictEqual(
		keys[0],
		"/path/to/tmpl.dust",
		"registered template should be /path/to/tmpl.dust"
	);
	
	t.strictEqual(
		dust.compile,
		compiler.compile,
		"dust.compile should be the original compiler.compile method"
	);
	
	dust.setRecursiveCompilation(true);
	
	try {
		dust.compile('Hi {>"'+nonexistentPath+'"/}!',"/path/to/tmpl.dust");
	} catch(e) {
		if (e.code === "ENOENT") {
			t.pass("dust.compile should throw when resolving a non-existent path");
			t.end();
			return;
		}
	}
	t.fail("dust.compile should have failed");
	t.end();
});