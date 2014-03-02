var path = require("path");

var test = require("../lib/test.js");

require("tap").test("partials and blocks",function(t){
	var fp = path.join(__dirname,"..","src","partialsandblocks2","main.dust");
	test(fp,t,"a x50o b rnt50");
});