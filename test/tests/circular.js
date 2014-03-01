var fs = require("fs");
var path = require("path");

var dust = require("../../lib/server.js");

var entry = path.join(__dirname,"..","src","circular","main.dust");
var partial = path.join(__dirname,"..","src","circular","partial.dust");

require("tap").test("circular",function(t){
	fs.readFile(entry,function(err,contents){
		if (err) {
			t.fail("Error reading main.dust (error: " + err + ")");
			t.end();
			return;
		}
		var map = dust.compileMap(contents.toString(),entry);
		
		t.equivalent(
			Object.keys(map),
			[entry,partial]
		);
		
		t.equivalent(
			map[entry].requires,
			[map[partial]]
		);

		t.equivalent(
			map[partial].requires,
			[map[entry]]
		);
		
		t.end();
	});
});