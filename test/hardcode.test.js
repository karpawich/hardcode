/* eslint-env jest */

const {readFile} = require('fs');
const hardcode = require('../hardcode');

let paths;

beforeAll(() => {
	return new Promise((resolve, reject) => {
		hardcode({
			pattern: './test/src/**',
			prefix: './test/src',
			out: './test/import'
		})
			.then($paths => {
				paths = $paths;
				resolve();
			})
			.catch(reject);
	});
});

test('basic', () => {
	expect(paths).toBeDefined();
	expect(paths.length).toBe(2);
	expect(typeof paths[0]).toBe('string');
	expect(typeof paths[1]).toBe('string');
});

test('virtual files', () => {
	return new Promise((resolve, reject) => {
		readFile(paths[0], (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			expect(data.toString()).toBe('module.exports = "Hello, World!";');
			readFile(paths[1], (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				expect(data.toString()).toBe('module.exports = "Foo Bar";');
				resolve();
			});
		});
	});
});

test('index file generation', () => {
	return new Promise((resolve, reject) => {
		readFile('test/import/index.js', (err, data) => {
			if (err) {
				reject(err);
				return;
			}

			readFile('test/index.js.test.1', (err, actualData) => {
				if (err) {
					reject(err);
					return;
				}

				expect(data.toString()).toBe(actualData.toString());
				readFile('test/import/folder/index.js', (err, data) => {
					if (err) {
						reject(err);
						return;
					}

					readFile('test/index.js.test.2', (err, actualData) => {
						if (err) {
							reject(err);
							return;
						}

						expect(data.toString()).toBe(actualData.toString());
						resolve();
					});
				});
			});
		});
	});
});
