# iojs-dep-check

Checks your npm dependencies to see if there are any modules that won't currently work with io.js.

The list of broken modules is dynamically taken (scraped) from [https://github.com/iojs/io.js/issues/456](https://github.com/iojs/io.js/issues/456)  
(only modules with `open` badge are taken)

**This does not mean that your project will work well with iojs**

### how

```
$ npm install -g iojs-dep-check
```

Then go to any folder containing a `package.json`
```
$ npm install
$ iojs-dep-check
```
