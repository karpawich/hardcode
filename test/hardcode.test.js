/* eslint-env jest */

const {readFile} = require('fs');
const hardcode = require('../hardcode');

test('expect it to work, damn it!', () => {
	return new Promise((resolve, reject) => {
		return hardcode({
			pattern: './test/src/**',
			prefix: './test/src',
			out: './test/build'
		})
			.then(paths => {
				expect(paths).toBeDefined();
				expect(paths.length).toBe(2);
				expect(typeof paths[0]).toBe('string');
				expect(typeof paths[1]).toBe('string');

				readFile(paths[0], (err, data) => {
					if (err) {
						reject(err);
						return;
					}

					expect(JSON.parse(data).data).toBe('Hello, World!');
					readFile(paths[1], (err, data) => {
						if (err) {
							reject(err);
							return;
						}

						expect(JSON.parse(data).data).toBe('Foo\r\nBar');
						resolve();
					});
				});
			});
	});
});
