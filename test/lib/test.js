var fs = require("fs");
var path = require("path");
var vm = require("vm");

var dust = require("../../lib/server.js");

function test(filePath,t,shouldEqual) {
	fs.readFile(filePath,function(err,content){
		if (err) {
			t.fail("Error reading main.dust (error: " + err + ")");
			t.end();
			return;
		}
		
		content = content.toString();
		
		dust.filePathMapper = new (dust.filePathMappers.FilePathMangler)();
		
		var compiled = dust.compile(content,filePath);
		var context = vm.createContext({dust:dust});
		vm.runInContext(compiled,context);
		
		dust.render("_AUTO_TEMPLATE_NAME%0",{},function(err,out){
			if (err) {
				t.fail("Error reading main.dust (error: " + err + ")");
				t.end();
				return;
			}
			t.strictEqual(out,shouldEqual,"Rendered dust should be as expected (FilePathMangler)");
			
			dust.filePathMapper = new (dust.filePathMappers.FilePathRebase)();
			
			compiled = dust.compile(content,filePath);
			
			context = vm.createContext({dust:dust});
			vm.runInContext(compiled,context);
			
			dust.render(path.basename(filePath),{},function(err,out){
				if (err) {
					t.fail("Error reading main.dust (error: " + err + ")");
					t.end();
					return;
				}
				t.strictEqual(out,shouldEqual,"Rendered dust should be as expected (FilePathRebase)");
				t.end();
			});
		});
	});
}

module.exports = test;