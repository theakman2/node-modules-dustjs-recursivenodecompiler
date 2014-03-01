var fs = require("fs");
var path = require("path");
var vm = require("vm");

var dust = require("../../lib/server.js");

function test(filePath,t,shouldEqual) {
	var base = path.basename(filePath);
	fs.readFile(filePath,function(err,content){
		if (err) {
			t.fail("Error reading main.dust (error: " + err + ")");
			t.end();
			return;
		}
		
		content = content.toString();
		
		var compileMap = {};
		dust.compileMap(content,filePath,compileMap);
		var compiled = dust.compiledMapToString(compileMap);
		var context = vm.createContext({dust:dust});
		vm.runInContext(compiled,context);
		
		dust.render(base,{},function(err,out){
			if (err) {
				t.fail("Error reading main.dust (error: " + err + ")");
				t.end();
				return;
			}
			t.strictEqual(out,shouldEqual,"Rendered dust should be as expected (compileMap)");
			
			dust.filePathMapper = dust.filePathMappers.filePathMangle;
			
			compiled = dust.compile(content,filePath);
			
			context = vm.createContext({dust:dust});
			vm.runInContext(compiled,context);
			
			dust.render("__1__",{},function(err,out){
				if (err) {
					t.fail("Error reading main.dust (error: " + err + ")");
					t.end();
					return;
				}
				t.strictEqual(out,shouldEqual,"Rendered dust should be as expected (compile)");
				t.end();
			});
		});
	});
}

module.exports = test;