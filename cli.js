#!/usr/bin/env node

const program = require('commander');
const hardcode = require('./hardcode');

const options = {};

program
	.version('1.0.2')
	.arguments('<glob>')
	.description('<glob> = the glob pattern for matching files to build')
	.action(pattern => {
		options.pattern = pattern;
	})
	.option('-o, --out <out>', 'output folder. Default is ./build')
	.option('-p, --prefix <prefix>', 'skips over a pattern prefix when building');

program.parse(process.argv);

options.out = program.out;
options.prefix = program.prefix;

hardcode(options)
	.then(paths => {
		console.log(`\n${paths.length} files have been hardcoded:`);
		for (const path of paths) {
			console.log(`\t- ${path}`);
		}

		console.log();
	})
	.catch(error => {
		throw error;
	});
