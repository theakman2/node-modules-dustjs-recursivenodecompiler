var i = 0;

var o = module.exports = {};

o.init = function() {
	i = 0;
};

o.filePathToVisible = function() {
	return "__" + (++i) + "__";
};