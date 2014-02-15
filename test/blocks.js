var path = require("path");

var test = require("./lib/test.js");

require("tap").test("blocks",function(t){
	var fp = path.join(__dirname,"src","blocks","main.dust");
	test(fp,t,"g a x b y h a p b q");
});