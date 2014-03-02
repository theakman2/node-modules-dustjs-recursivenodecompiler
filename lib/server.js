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

var compiled = {};
var currFilePath = null;

function partialRecursive(context,node) {
	if (node[1][0] === "literal") {
		var resolved = path.resolve(path.dirname(currFilePath), node[1][1]);
		if (!compiled.hasOwnProperty(resolved)) {
			var regAs = dust.filePathMapper.registerFilePathAs(resolved);
			compiled[resolved] = {};
			compiled[resolved].filePath = resolved;
			compiled[resolved].registeredAs = regAs;
			compiled[resolved].requires = [];
			var contents;
			try {
				contents = fs.readFileSync(resolved).toString();
			} catch (e) {
				if (e.code === "ENOENT") {
					e.message = "File '" + resolved
						+ "' not found in '" + currFilePath
						+ "' on line " + node[1][2][1]
						+ " column " + node[1][3][1] + ".";
				}
				throw e;	
			}
			var oldCurrFilePath = currFilePath;
			currFilePath = resolved;
			compiled[resolved].content = oldCompileFn(contents,regAs);
			currFilePath = oldCurrFilePath;
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
	compiled = _compiled || {};
	currFilePath = null;
	
	if (!(
		dust.filePathMapper
		&& (typeof dust.filePathMapper.registerFilePathAs === "function")
	)) {
		throw new Error(
			"dust.filePathMapper must define the 'registerFilePathAs' method"
		);
	}
	
	if (
		(typeof dust.filePathMapper.init === "function")
		&& !Object.keys(compiled).length
	) {
		dust.filePathMapper.init();
	}
	
	currFilePath = path.resolve(name);
	if (!compiled.hasOwnProperty(currFilePath)) {
		var regAs = dust.filePathMapper.registerFilePathAs(currFilePath);
		compiled[currFilePath] = {};
		compiled[currFilePath].filePath = currFilePath;
		compiled[currFilePath].requires = [];
		compiled[currFilePath].registeredAs = regAs;
		compiled[currFilePath].content = oldCompileFn(source,regAs);
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