var path = require("path");
var fs = require("fs");

var dust = require("dustjs-linkedin");

var compiler = require("../node_modules/dustjs-linkedin/lib/compiler");

var filePathMappers = {
	filePathRebase: require("./filePathRebase.js"),
	filePathMangle: require("./filePathMangle.js")
};

var oldPartialFn = compiler.nodes.partial;
var oldCompileFn = compiler.compile;
var oldCompileMap = compiler.compileMap;
var oldCompileMapToString = compiler.compiledMapToString;
var oldCompileFilePathMapper = compiler.filePathMapper;
var oldCompileFilePathMappers = compiler.filePathMappers;

var oldDustCompile = dust.compile;
var oldDustCompileMap = dust.compileMap;
var oldDustCompiledMapToString = dust.compiledMapToString;
var oldDustFilePathMapper = dust.filePathMapper;
var oldDustFilePathMappers = dust.filePathMappers;

var queue = [];
var compiled = {};
var currFilePath = null;

function partialRecursive(context,node) {
	if (node[1][0] === "literal") {
		var fp = node[1][1];
		var resolved = path.resolve(path.dirname(currFilePath), fp);
		if (!compiled.hasOwnProperty(resolved)) {
			compiled[resolved] = {};
			compiled[resolved].registeredAs = dust.filePathMapper.filePathToVisible(resolved);
			compiled[resolved].requires = [];
			queue.push(resolved);
		}
		compiled[currFilePath].requires.push(compiled[resolved]);
		node[1][1] = compiled[resolved].registeredAs;
	}
	return oldPartialFn(context, node);
}

function compiledMapToString(map) {
	var ret = "";
	for (var key in map) {
		if (
			map.hasOwnProperty(key)
			&& (typeof map[key].registeredAs === "string")
			&& (typeof map[key].content === "string")
		) {
			ret += map[key].content + "\n";
		}
	}
	return ret;	
}

function compileRecursiveMap(source,name,_compiled) {
	queue = [];
	compiled = _compiled || {};
	currFilePath = null;
	
	if (!(
		dust.filePathMapper
		&& (typeof dust.filePathMapper.filePathToVisible === "function")
	)) {
		throw new Error(
			"dust.filePathMapper must define the 'filePathToVisible' method"
		);
	}
	
	if (typeof dust.filePathMapper.init === "function") {
		dust.filePathMapper.init();
	}
	
	currFilePath = path.resolve(name);
	if (!compiled.hasOwnProperty(currFilePath)) {
		var vis = dust.filePathMapper.filePathToVisible(currFilePath);
		compiled[currFilePath] = {};
		compiled[currFilePath].requires = [];
		compiled[currFilePath].registeredAs = vis;
		compiled[currFilePath].content = oldCompileFn(source,vis);
	}
	
	while (currFilePath = queue.shift()) {
		var content = fs.readFileSync(currFilePath).toString();
		var vis = compiled[currFilePath].registeredAs;
		compiled[currFilePath].content = oldCompileFn(content, vis);
	}
	
	return compiled;
}

function compileRecursive(source,name,_compiled) {
	return compiledMapToString(compileRecursiveMap(source,name,_compiled));
}

function enableRecursiveCompilation() {
	compiler.nodes.partial = partialRecursive;
	
	dust.compile = compiler.compile = compileRecursive;
	dust.compileMap = compiler.compileMap = compileRecursiveMap;
	dust.compiledMapToString = compiler.compiledMapToString = compiledMapToString;
	dust.filePathMapper = compiler.filePathMapper = filePathMappers.filePathRebase;
	dust.filePathMappers = compiler.filePathMappers = filePathMappers;
}

function disableRecursiveCompilation() {
	compiler.nodes.partial = oldPartialFn;
	
	compiler.compile = oldCompileFn;
	compiler.compileMap = oldCompileMap;
	compiler.compiledMapToString = oldCompileMapToString;
	compiler.filePathMapper = oldCompileFilePathMapper;
	compiler.filePathMappers = oldCompileFilePathMappers;
	
	dust.compile = oldDustCompile;
	dust.compileMap = oldDustCompileMap;
	dust.compiledMapToString = oldDustCompiledMapToString;
	dust.filePathMapper = oldDustFilePathMapper;
	dust.filePathMappers = oldDustFilePathMappers;
}

dust.setRecursiveCompilation = function(bool) {
	bool ? enableRecursiveCompilation() : disableRecursiveCompilation();
}

enableRecursiveCompilation();

module.exports = dust;