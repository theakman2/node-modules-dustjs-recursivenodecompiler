var path = require("path");
var fs = require("fs");

var dust = require("dustjs-linkedin");

var compiler = require("../node_modules/dustjs-linkedin/lib/compiler");

var oldFilePathMapper = dust.filePathMapper;
var oldCompileFn = compiler.compile;
var oldPartialFn = compiler.nodes.partial;
var oldCompileArray = compiler.compileArray;

var queue = [];
var filesEncountered = {};

function partialRecursive(context,node) {
	if (node[1][0] === "literal") {
		var fp = node[1][1];
		var base = path.dirname(dust.filePathMapper.visibleToFilePath(context.name));
		var resolved = path.resolve(base, fp);
		if (!filesEncountered.hasOwnProperty(resolved)) {
			queue.push(resolved);
			filesEncountered[resolved] = dust.filePathMapper.filePathToVisible(resolved);
		}
		node[1][1] = filesEncountered[resolved];
	}
	return oldPartialFn(context, node);
}

function compileRecursiveArray(source,name) {
	queue = [];
	filesEncountered = {};
	
	var compiled = [];
	
	if (!Array.isArray(source)) {
		source = [source];
	}
	
	if (!Array.isArray(name)) {
		name = [name];
	}
	
	if (!dust.filePathMapper) {
		dust.filePathMapper = "FilePathRebase";
	}
	
	if (typeof dust.filePathMapper === "string") {
		dust.filePathMapper = new (require("./filePathMappers/"+dust.filePathMapper))();
	}
	
	if (!(
		(typeof dust.filePathMapper.filePathToVisible === "function")
		&& (typeof dust.filePathMapper.visibleToFilePath === "function")
	)) {
		throw new Error(
			"dust.filePathMapper must have 'filePathToVisible' and 'visibleToFilePath'" +
			"methods defined"
		);
	}
	
	if (typeof dust.filePathMapper.init === "function") {
		dust.filePathMapper.init();
	}
	
	for (var i = 0, len = source.length; i < len; ++i) {
		var n = path.resolve(name[i]);
		if (!filesEncountered.hasOwnProperty(n)) {
			filesEncountered[n] = dust.filePathMapper.filePathToVisible(n);
			compiled.push(oldCompileFn(source[i], filesEncountered[n]));
		}
	}
	
	while (queue.length) {
		var content = fs.readFileSync(queue[0]).toString();
		compiled.push(oldCompileFn(content, dust.filePathMapper.filePathToVisible(queue[0])));
		queue.shift();
	}
	
	return compiled;
}

function compileRecursive(source,name) {
	return compileRecursiveArray(source,name).join("\n");
}

function enableRecursiveCompilation() {
	dust.filePathMapper = null;
	compiler.nodes.partial = partialRecursive;
	compiler.compileArray = compileRecursiveArray;
	compiler.compile = compileRecursive;
	dust.compile = compiler.compile;
}

function disableRecursiveCompilation() {
	dust.filePathMapper = oldFilePathMapper;
	compiler.nodes.partial = oldPartialFn;
	compiler.compileArray = oldCompileArray;
	compiler.compile = oldCompileFn;
	dust.compile = compiler.compile;
}

dust.setRecursiveCompilation = function(bool) {
	bool ? enableRecursiveCompilation() : disableRecursiveCompilation();
}

enableRecursiveCompilation();

module.exports = dust;