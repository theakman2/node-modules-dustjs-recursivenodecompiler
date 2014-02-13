var path = require("path");
var fs = require("fs");

var compiler = require("../node_modules/dustjs-linkedin/lib/compiler");

var dust = require("dustjs-linkedin");

dust.ENABLE_RECURSIVE_COMPILATION = true;

var oldCompileFn = compiler.compile;
var oldPartialFn = compiler.nodes.partial;

var queue = [];
var filesEncountered = [];

function indexToName(idx) {
	return "_AUTO_TEMPLATE_NAME%" + idx.toString();
}

function nameToIndex(name) {
	return parseInt(name.toString().split("%")[1],10);
}

compiler.nodes.partial = function(context, node) {
	if (dust.ENABLE_RECURSIVE_COMPILATION) {
		if (node[1][0] === "literal") {
			var fp = node[1][1];
			var base = path.dirname(filesEncountered[nameToIndex(context.name)]);
			var resolved = path.resolve(base, fp);
			if (filesEncountered.indexOf(resolved) === -1) {
				queue.push(resolved);
				filesEncountered.push(resolved);
			}
			node[1][1] = indexToName(filesEncountered.indexOf(resolved));
		}
	}
	return oldPartialFn(context, node);
}

compiler.compileArray = function(source, name) {
	if (dust.ENABLE_RECURSIVE_COMPILATION) {
		queue = [];
		filesEncountered = [];
		
		var compiled = [];
	
		filesEncountered.push(name);
		
		var idx = filesEncountered.indexOf(name);
		compiled.push(oldCompileFn(source, indexToName(idx)));
	
		while (queue.length) {
			var content = fs.readFileSync(queue[0]).toString();
			idx = filesEncountered.indexOf(queue[0]);
			compiled.push(oldCompileFn(content, indexToName(idx)));
			queue.shift();
		}
	
		return compiled;
	} else {
		return [oldCompileFn(source,name)];
	}
};

compiler.compile = function(source,name) {
	if (dust.ENABLE_RECURSIVE_COMPILATION) {
		return compiler.compileArray(source,name).join("\n");
	} else {
		return oldCompileFn(source,name);
	}
}

dust.compile = compiler.compile;

module.exports = dust;