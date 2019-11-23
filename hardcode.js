const {readFile, writeFile, lstat, mkdir, readdir, unlink} = require('fs');
const {join, dirname, basename} = require('path');
const glob = require('glob');

function _forEach(contents, match, out) {
	const path = `${join(out, match)}.js`;
	return new Promise((resolve, reject) => {
		mkdir(dirname(path), {recursive: true}, err => {
			if (err) {
				reject(err);
				return;
			}

			writeFile(path,	`module.exports = ${JSON.stringify(contents.toString())};`, err => {
				if (err) {
					reject(err);
					return;
				}

				resolve(path);
			});
		});
	});
}

function _deleteIndex(dir) {
	return new Promise((resolve, reject) => {
		const path = join(dir, 'index.js');
		lstat(path, (err, _) => {
			if (err) {
				if (err.code !== 'ENOENT') {
					reject(err);
					return;
				}

				resolve();
			} else {
				unlink(path, error => {
					if (error) {
						reject(error);
						return;
					}

					resolve();
				});
			}
		});
	});
}

function _build(dir) {
	return new Promise((resolve, reject) => {
		_deleteIndex(dir)
			.catch(reject)
			.then(() => {
				readdir(dir, (err, files) => {
					if (err) {
						reject(err);
						return;
					}

					Promise.all(files.map(file => {
						return new Promise((resolve, reject) => {
							const path = join(dir, file);
							lstat(path, (err, stats) => {
								if (err) {
									reject(err);
									return;
								}

								if (stats.isDirectory()) {
									_build(path)
										.then(resolve)
										.catch(reject);
								} else {
									resolve(file.slice(0, -3));
								}
							});
						});
					}))
						.then(modules => {
							let $imports = '';
							let $exports = 'module.exports = {\n';
							let i = 0;
							for (const $module of modules) {
								$imports += `const $${i} = require('./${$module}');\n`;
								$exports += `\t'${$module}': $${i},\n`;
								i++;
							}

							$imports += '\n';
							$exports += '};\n';

							writeFile(join(dir, 'index.js'), `${$imports}${$exports}`, error => {
								if (error) {
									reject(error);
								}

								resolve(basename(dir));
							});
						});
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
				.then(dirFlags => {
					let i = 0;
					for (const dirFlag of dirFlags) {
						let match;
						if (!dirFlag) {
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
						.then(paths => {
							_build(options.out)
								.then(() => {
									resolve(paths);
								})
								.catch(reject);
						})
						.catch(reject);
				})
				.catch(reject);
		});
	});
}

module.exports = hardcode;
