const {readFile, writeFile, lstat, mkdir} = require('fs');
const {join, dirname} = require('path');
const glob = require('glob');

function _forEach(contents, match, out) {
	const path = `${join(out, match)}.js`;
	return new Promise((resolve, reject) => {
		mkdir(dirname(path), {recursive: true}, err => {
			if (err) {
				reject(err);
				return;
			}

			writeFile(path,	`module.exports = {val: ${JSON.stringify(contents.toString())}};`, err => {
				if (err) {
					reject(err);
					return;
				}

				resolve(path);
			});
		});
	});
}

function hardcode(options) {
	return new Promise((resolve, reject) => {
		const promises = [];
		let forEach = _forEach;
		let prefix = '';

		if (typeof options !== 'object') {
			options = {};
		}

		if (typeof options.pattern !== 'string') {
			reject(new TypeError('the pattern must be of type string'));
			return;
		}

		if (typeof options.forEach === 'undefined') {
			if (typeof options.out !== 'string') {
				options.out = 'build';
			}
		}

		if (typeof options.forEach === 'function') {
			forEach = options.forEach;
		}

		if (typeof options.prefix === 'string') {
			prefix = options.prefix;
		}

		glob(options.pattern, (err, matches) => {
			if (err) {
				reject(err);
				return;
			}

			Promise.all(matches.map(match => {
				return new Promise((resolve, reject) => {
					lstat(match, (err, stats) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(stats.isDirectory());
					});
				});
			}))
				.then(directoryFlags => {
					let i = 0;
					for (const directoryFlag of directoryFlags) {
						let match;
						if (!directoryFlag) {
							match = matches[i];
							promises.push(
								new Promise((resolve, reject) => {
									readFile(match, (error, data) => {
										if (error) {
											reject(error);
											return;
										}

										if (match.startsWith(prefix)) {
											match = match.slice(prefix.length);
										}

										forEach(data, match, options.out)
											.then(resolve)
											.catch(reject);
									});
								})
							);
						}

						i++;
					}

					Promise.all(promises)
						.then(paths => resolve(paths))
						.catch(reject);
				})
				.catch(reject);
		});
	});
}

module.exports = hardcode;
