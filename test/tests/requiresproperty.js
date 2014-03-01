var fs = require("fs");
var path = require("path");

var test = require("tap").test;

var dust = require("../../lib/server.js");

var a = path.join(__dirname,"..","src","simplepartials","a.dust");
var b = path.join(__dirname,"..","src","simplepartials","nested2","b.dust");
var c = path.join(__dirname,"..","src","simplepartials","nested","sub","c.dust");
var d = path.join(__dirname,"..","src","simplepartials","nested","d.dust");

test("requires property",function(t){
	var entry = path.join(__dirname,"..","src","simplepartials","main.dust");
	
	fs.readFile(entry,function(err,contents){
		if (err) {
			t.fail("Error reading main.dust (error: " + err + ")");
			t.end();
			return;
		}
		var compiledMap = {};
		dust.compileMap(contents.toString(),entry,compiledMap);
		
		t.strictEqual(
			Object.keys(compiledMap).length,
			5
		);
		
		t.equivalent(
			compiledMap[entry].requires,
			[compiledMap[a],compiledMap[a],compiledMap[b]]
		);
		
		t.equivalent(
			compiledMap[a].requires,
			[compiledMap[c]]
		);
		
		t.equivalent(
			compiledMap[b].requires,
			[compiledMap[d],compiledMap[c]]
		);
		
		t.equivalent(
			compiledMap[c].requires,
			[compiledMap[d]]
		);
		
		t.equivalent(
			compiledMap[d].requires,
			[]
		);
		
		t.end();
	});
	
});