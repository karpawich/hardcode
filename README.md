# hardcode

This package hardcodes files in UTF-8 format into JavaScript modules that can be imported.

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

Imagine that you have the following project structure:
```
templates/
	dev/
		hello.pug
```

The following code will hardcode `hello.pug` for you:

```javascript
const hardcode = require('hardcode');

hardcode('templates/dev/**', {
	prefix: 'templates/dev/',
	out: 'templates/prod/'
});
```

At some point later on, you can access the contents of `hello.pug` by importing it:

```javascript
const helloPug = require('templates/prod/hello.pug')

console.log(helloPug.val) // the contents of hello.pug
```

## License

This code is licensed under GNU-GPLv3.

