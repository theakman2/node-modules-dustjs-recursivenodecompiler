var fs = require("fs");
var path = require("path");
var vm = require("vm");

var dust = require("../../lib/server.js");

require("tap").test("multipleentry",function(t){
	var entry1 = path.join(__dirname,"..","src","multipleentry","main1.dust");
	var entry2 = path.join(__dirname,"..","src","multipleentry","main2.dust");
	
	var content1 = fs.readFileSync(entry1).toString();
	var content2 = fs.readFileSync(entry2).toString();
	
	var compiledMap = {};
	dust.compileMap(content1,entry1,compiledMap);
	dust.compileMap(content2,entry2,compiledMap);
	
	var compiled = dust.compiledMapToString(compiledMap);
	
	var context = vm.createContext({dust:dust});
	vm.runInContext(compiled,context);
		
	t.equivalent(
		Object.keys(dust.cache).sort(),
		[
		 "main1.dust",
		 "main2.dust",
		 "sharedpartial.dust"
		 ],
		 "dust.cache should be as expected"
	);
	
	dust.render("main2.dust",{},function(err,out){
		if (err) {
			t.fail("Error rendering main2.dust (error: " + err + ")");
			t.end();
			return;
		}
		t.strictEqual(out,"s foo t","main2.dust should render as expected");
		dust.render("main1.dust",{},function(err,out){
			if (err) {
				t.fail("Error rendering main1.dust (error: " + err + ")");
				t.end();
				return;
			}
			t.strictEqual(out,"x foo z","main1.dust should render as expected");
			t.end();
		});
	});
});