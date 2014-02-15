function FilePathMangler() {
	this._filesEncountered = [];
}

FilePathMangler.prototype = {
	init:function() {
		this._filesEncountered = [];
	},
	filePathToVisible:function(fullFilePath) {
		var idx = this._filesEncountered.indexOf(fullFilePath);
		if (idx === -1) {
			this._filesEncountered.push(fullFilePath);
			return this.filePathToVisible(fullFilePath);
		}
		return "_AUTO_TEMPLATE_NAME%" + idx.toString();
	},
	visibleToFilePath:function(name) {
		var idx = parseInt(name.toString().split("%")[1],10);
		return this._filesEncountered[idx];
	}
};

module.exports = FilePathMangler;