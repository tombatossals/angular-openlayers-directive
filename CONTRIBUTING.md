Contributing
============

- [Issues](#issues)
- [Commit Message Guidelines](#commit)
- [Code Style](#code-style)

## <a name="issues"></a> Issues

If you have a bug or enhancement request, please file an issue.

When submitting an issue, please include context from your test and
your application. If there's an error, please include the error text.

It's always easy to undestand the bug/problem visually, you can use a predefined
jsfiddle example which loads a simple map, which you can use to document your issue:

http://jsfiddle.net/juristr/od60raL4/1/

## <a name="commit"></a> Commit Message Guidelines

These guidelines have been taken and adapted from the [official Angular guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines). By following the rules also mentioned in [conventional-changelog](https://www.npmjs.com/package/conventional-changelog). This leads to much more readable and clearer commit messages.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer than 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit being reverted.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example
`olHelper`, `layer`, etc.

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines. The rest of the commit message is then used for this.

A detailed explanation can be found in this [document][commit-message-format].


## <a name="code-style"></a> Code style

* We use a [editorconfig](http://editorconfig.org/) file to define indentation, codification and type of end of line of the archives.
* The style guide we try to use is the [Airbnb Javascript Style Guide](https://github.com/airbnb/javascript).


Software development life-cycle
-------------------------------
There are a some Grunt tasks defined to ease the development cycle. Let's see how to use them:

First, make sure you have npm and grunt-cli installed globally. Let's install the dependencies.

```
# Inside the project dir, install the dependencies
$ npm install
npm http GET https://registry.npmjs.org/protractor/0.14.0
npm http GET https://registry.npmjs.org/matchdep
npm http GET https://registry.npmjs.org/grunt-shell
npm http GET https://registry.npmjs.org/grunt-contrib-jshint
npm http GET https://registry.npmjs.org/grunt-contrib-connect
npm http GET https://registry.npmjs.org/grunt-karma
npm http GET https://registry.npmjs.org/grunt-ngmin
...
├── glob@3.1.21 (inherits@1.0.0)
├── minimatch@0.2.12 (sigmund@1.0.0, lru-cache@2.5.0)
├── http-proxy@0.10.3 (pkginfo@0.2.3, utile@0.1.7)
├── lodash@1.1.1
├── log4js@0.6.9 (semver@1.1.4, async@0.1.15, readable-stream@1.0.17)
├── useragent@2.0.7 (lru-cache@2.2.4)
├── connect@2.8.8 (methods@0.0.1, uid2@0.0.2, fresh@0.2.0, cookie@0.1.0, ..., send@0.1.4)
└── socket.io@0.9.16 (base64id@0.1.0, policyfile@0.0.4, redis@0.7.3, socket.io-client@0.9.16)
$
```

Once you have the development dependencies installed, we can use our predefined grunt tasks. For example:

* **grunt test**. Executes the karma unitary tests and the protractor e2e tests, reporting the actual state of the project.
* **grunt test:unit**. Executes only the karma unitary tests.
* **grunt test:e2e**. Executes only the protractor e2e tests.
* **grunt coverage**. Generates a "coverage" folder with an [istanbul](https://github.com/gotwarlost/istanbul) report of wich part of the code is covered by the actual tests.
* **grunt**. The default task watches for project files changes and when a change is detected, tries to build the library file passing the jshint filter and the tests. Let's see an example:

```
$ grunt
Running "watch:source" (watch) task
Waiting...OK
>> File "src/directives/openlayers.js" changed.

Running "jshint:source" (jshint) task
>> 18 files lint free.

Running "jshint:tests" (jshint) task
>> 14 files lint free.

Running "jshint:grunt" (jshint) task
>> 1 file lint free.

Running "concat:dist" (concat) task
File "dist/angular-openlayers-directive.js" created.

Running "ngmin:directives" (ngmin) task
ngminifying dist/angular-openlayers-directive.js

Running "uglify:dist" (uglify) task
File "dist/angular-openlayers-directive.min.no-header.js" created.

Running "karma:unit" (karma) task
INFO [karma]: Karma v0.10.8 server started at http://localhost:9018/
INFO [launcher]: Starting browser PhantomJS
INFO [PhantomJS 1.9.2 (Linux)]: Connected on socket WUeY410y1MZhG5OYnoyc
PhantomJS 1.9.2 (Linux): Executed 108 of 108 SUCCESS (0.875 secs / 0.625 secs)

Running "concat:license" (concat) task
File "dist/angular-openlayers-directive.min.js" created.

Done, without errors.
Completed in 9.714s at Sun Dec 15 2013 10:37:59 GMT+0100 (CET) - Waiting...
```

After a successful build, a new library distribution file will be generated inside the "dist" folder, which will be ready to use on your project:
```
$ ls -l dist/angular-openlayers-directive.min.js
-rw-r--r-- 1 dave dave 35255 dic 15 10:37 dist/angular-openlayers-directive.min.js
```
