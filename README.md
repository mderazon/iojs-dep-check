# iojs-dep-check

Checks your npm dependencies to see if there are any modules that won't currently work with io.js.

The list of broken modules is dynamically taken (scraped) from [https://github.com/iojs/io.js/issues/456](https://github.com/iojs/io.js/issues/456)  
(only modules with `open` badge are taken)

**this does not mean that your project will work well with iojs**


### how
this is **not** on npm as it might break / become irrelevant / hasn't been tested.

download / clone this repo
```
$ cd iojs-dep-check
$ npm install -g .
```

then go to any folder containing a `package.json`
```
$ iojs-dep-check
```

when you're done, throw this away
```
$ npm uninstall -g iojs-dep-check
```
