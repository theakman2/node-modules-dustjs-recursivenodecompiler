var path = require("path");

var o = module.exports = {};

o.base = null;

o.init = function() {
	o.base = null;
};

o.filePathToVisible = function(fp) {
	if (o.base === null) {
		o.base = path.dirname(fp);
	}
	return path.relative(o.base,fp).replace(/\\/g,"/");
};