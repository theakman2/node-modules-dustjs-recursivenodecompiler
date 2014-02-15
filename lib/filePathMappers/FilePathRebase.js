var path = require("path");

function FilePathRebase(base) {
	this._base = base;
}

FilePathRebase.prototype = {
	filePathToVisible:function(fp) {
		if (!this._base) {
			this._base = path.dirname(fp);
		}
		return path.relative(this._base,fp).replace(/\\/g,"/");
	},
	visibleToFilePath:function(v) {
		return path.resolve(this._base,v).replace(/\\/g,"/");
	}
};

module.exports = FilePathRebase;