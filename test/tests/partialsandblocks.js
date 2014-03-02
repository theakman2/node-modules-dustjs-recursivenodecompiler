var path = require("path");

var test = require("../lib/test.js");

require("tap").test("partials and blocks",function(t){
	var fp = path.join(__dirname,"..","src","partialsandblocks","main.dust");
	test(fp,t,"m p u a x b y v barw q n p u a x b y v barw q o r a x b y s u a x b y v foow t");
});