var path = require("path");
var fs = require("fs");

var dust = require("dustjs-linkedin");

var compiler = require("../node_modules/dustjs-linkedin/lib/compiler");

var oldPartialFn = compiler.nodes.partial;
var oldCompileFn = compiler.compile;
var oldCompileMap = compiler.compileMap;
var oldCompiledMapToString = compiler.compiledMapToString;

var oldDustCompile = dust.compile;
var oldDustCompileMap = dust.compileMap;
var oldDustCompiledMapToString = dust.compiledMapToString;

var oldFilePathMapper = dust.filePathMapper;
var oldFilePathMappers = dust.filePathMappers;

var filePathMappers = {
	FilePathMangler:require("./filePathMappers/FilePathMangler"),
	FilePathRebase:require("./filePathMappers/FilePathRebase")
};

var queue = [];
var compiled = {};

function partialRecursive(context,node) {
	if (node[1][0] === "literal") {
		var fp = node[1][1];
		var base = path.dirname(dust.filePathMapper.visibleToFilePath(context.name));
		var resolved = path.resolve(base, fp);
		if (!compiled.hasOwnProperty(resolved)) {
			compiled[resolved] = {
				registeredAs:dust.filePathMapper.filePathToVisible(resolved)
			};
			queue.push(resolved);
		}
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
	
	if (!dust.filePathMapper) {
		dust.filePathMapper = new (filePathMappers.FilePathRebase)();
	}
	
	if (!(
		(typeof dust.filePathMapper.filePathToVisible === "function")
		&& (typeof dust.filePathMapper.visibleToFilePath === "function")
	)) {
		throw new Error(
			"dust.filePathMapper must have 'filePathToVisible' and" +
			" 'visibleToFilePath' methods defined"
		);
	}
	
	if (typeof dust.filePathMapper.init === "function") {
		dust.filePathMapper.init();
	}
	
	var n = path.resolve(name);
	if (!compiled.hasOwnProperty(n)) {
		var vis = dust.filePathMapper.filePathToVisible(n);
		compiled[n] = {
			registeredAs:vis,
			content:oldCompileFn(source, vis)
		};
	}
	
	while (queue.length) {
		var content = fs.readFileSync(queue[0]).toString();
		var vis = compiled[queue[0]].registeredAs;
		compiled[queue[0]].content = oldCompileFn(content, vis);
		queue.shift();
	}
	
	return compiled;
}

function compileRecursive(source,name,_compiled) {
	return compiledMapToString(compileRecursiveMap(source,name,_compiled));
}

function enableRecursiveCompilation() {
	compiler.nodes.partial = partialRecursive;
	compiler.compile = compileRecursive;
	compiler.compileMap = compileRecursiveMap;
	compiler.compiledMapToString = compiledMapToString;
	
	dust.compile = compiler.compile;
	dust.compileMap = compiler.compileMap;
	dust.compiledMapToString = compiler.compiledMapToString;
	
	dust.filePathMappers = filePathMappers;
	dust.filePathMapper = null;
}

function disableRecursiveCompilation() {
	compiler.nodes.partial = oldPartialFn;
	compiler.compile = oldCompileFn;
	compiler.compileMap = oldCompileMap;
	compiler.compiledMapToString = oldCompiledMapToString;
	
	dust.compile = oldDustCompile;
	dust.compileMap = oldDustCompileMap;
	dust.compiledMapToString = oldDustCompiledMapToString;
	
	dust.filePathMappers = oldFilePathMappers;
	dust.filePathMapper = oldFilePathMapper;
}

dust.setRecursiveCompilation = function(bool) {
	bool ? enableRecursiveCompilation() : disableRecursiveCompilation();
}

enableRecursiveCompilation();

module.exports = dust;