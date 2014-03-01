var path = require("path");

var test = require("../lib/test.js");

require("tap").test("simple partials",function(t){
	var fp = path.join(__dirname,"..","src","simplepartials","main.dust");
	test(fp,t,"m p u x v barw q n p u x v barw q o r x s u x v foow t");
});