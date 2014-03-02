var i = 0;

var o = module.exports = {};

o.init = function() {
	i = 0;
};

o.registerFilePathAs = function() {
	return "__" + (++i) + "__";
};