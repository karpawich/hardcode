# hardcode

`hardcode` assembles a virtual, `import`-able file system from disk.

## Install

    npm i hardcode

## CLI

The package comes with a built-in CLI for build scripts:

`hardcode <glob> --out <out> --prefix <prefix>`

See `hardcode --help` for more details.

Add `hardcode <glob>` to your build script. For example:

```
...
"build": "hardcode <pattern> && jest"
...
```

## Usage

1. Imagine that you have the following files on disk:
```
templates/
 dev/
  email.html
		res/
			style.css
```

2. Now, run `hardcode` on the `templates/dev` directory.

```javascript
const hardcode = require('hardcode');

hardcode({
	pattern: 'templates/dev/**',
	prefix: 'templates/dev/',
	out: 'templates/import/'
});
```

3. Finally, import the `templates/dev` directory as a JSON object:

```javascript
const templates = require('./templates/import')

const html = templates['email.html'] // email.html file contents
const css = templates['res']['style.css'] // style.css file contents
```

## License

This code is licensed under GNU-GPLv3.

