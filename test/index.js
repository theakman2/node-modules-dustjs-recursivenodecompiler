var fs = require("fs");
var path = require("path");
var vm = require("vm");

var dust = require("../lib/server.js");

function test(filePath,assert,done,shouldEqual) {
	fs.readFile(filePath,function(err,content){
		if (err) {
			assert.fail("Error reading main.dust (error: " + err + ")");
			done();
			return;
		}
		
		var compiled = dust.compile(content.toString(),filePath);
		
		var unforkedDust = require("dustjs-linkedin");
		
		var context = vm.createContext({dust:unforkedDust});
		
		vm.runInContext(compiled,context);
		
		unforkedDust.render("_AUTO_TEMPLATE_NAME%0",{},function(err,out){
			if (err) {
				assert.fail("Error reading main.dust (error: " + err + ")");
				done();
				return;
			}
			assert.strictEqual(out,shouldEqual,"Rendered dust should be as expected");
			done();
		});
	});
}

var tests = {
	"test simple partials" : function(assert,done) {
		var fp = path.join(__dirname,"src","simplepartials","main.dust");
		test(fp,assert,done,"m p u x v barw q n p u x v barw q o r x s u x v foow t");
	},
	"test blocks" : function(assert,done) {
		var fp = path.join(__dirname,"src","blocks","main.dust");
		test(fp,assert,done,"g a x b y h a p b q");
	}
};

require("test").run(tests);