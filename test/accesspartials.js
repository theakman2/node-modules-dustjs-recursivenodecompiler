var fs = require("fs");
var path = require("path");
var vm = require("vm");

var dust = require("../lib/server.js");

var filePath = path.join(__dirname,"src","accesspartials","nested","main.dust");

require("tap").test("accesspartials",function(t){
	fs.readFile(filePath,function(err,content){
		if (err) {
			t.fail("Error reading main.dust (error: " + err + ")");
			t.end();
			return;
		}
		
		content = content.toString();
		
		var compiled = dust.compile(content,filePath);
		var context = vm.createContext({dust:dust});
		vm.runInContext(compiled,context);
		
		t.equivalent(
			Object.keys(dust.cache),
			[
			 "main.dust",
			 "partial3.dust",
			 "sub/partial2.dust",
			 "../partial.dust",
			 "../sibling/partial4.dust"
			 ],
			 "dust.cache should be as expected"
		);
		
		dust.render("main.dust",{},function(err,out){
			if (err) {
				t.fail("Error rendering main.dust (error: " + err + ")");
				t.end();
				return;
			}
			t.strictEqual(out,"a b qJoanr c","main.dust should render as expected");
			dust.render("../partial.dust",{name:"Hank"},function(err,out){
				if (err) {
					t.fail("Error rendering partial.dust (error: " + err + ")");
					t.end();
					return;
				}
				t.strictEqual(out,"qHankr","partial.dust should render as expected");
				dust.render("partial3.dust",{},function(err,out){
					if (err) {
						t.fail("Error rendering partial3.dust (error: " + err + ")");
						t.end();
						return;
					}
					t.strictEqual(out,"a","partial3.dust should render as expected");
					dust.render("sub/partial2.dust",{},function(err,out){
						if (err) {
							t.fail("Error rendering partial2.dust (error: " + err + ")");
							t.end();
							return;
						}
						t.strictEqual(out,"b","partial2.dust should render as expected");
						dust.render("../sibling/partial4.dust",{},function(err,out){
							if (err) {
								t.fail("Error rendering partial4.dust (error: " + err + ")");
								t.end();
								return;
							}
							t.strictEqual(out,"r","partial4.dust should render as expected");
							t.end();
						});
					});
				});
			});
		});
	});
});