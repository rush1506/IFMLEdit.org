// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    almost = require('almost'),
    Rule = almost.Rule,
    createRule = almost.createRule,
    AException = almost.Exception;

    
exports.rules = [
    createRule(
        Rule.always,
        function (model) {
            var pages = _.chain(model.getTopLevels())
                    .map(function (id) { return model.toElement(id); })
                    .sortBy('attributes.default')
                    .reverse()
                    .value(),
                actions = _.chain(model.elements)
                    .filter(function (e) { return model.isAction(e); })
                    .map(function (action) { return {id: action.id}; })
                    .value(),
                vms = _.map(pages, function (page) {
                    return {id: page.id};
                }),
                routes = _.chain(pages)
                    .map(function (page) {
                        return {id: page.id, path: page.attributes.default ? '' : page.id};
                    }).concat(
                        _.map(actions, function (action) {
                            return {id: action.id, path: action.id};
                        })
                    ).value(),
                landmarks = _.chain(pages)
                    .filter(function (e) { return model.isLandmark(e); })
                    .map(function (page) { return {href: page.attributes.default ? '' : page.id, name: page.attributes.name}; })
                    .value(),
                collections = _.chain(model.elements)
                    .filter(function (e) { return model.isViewComponent(e)})
                    .reject((x) => {return x.attributes.stereotype === 'form' || 
                        x.attributes.stereotype === 'image' ||
                        x.attributes.stereotype === 'button' ||
                        x.attributes.stereotype === 'text'})
                    .map(function (c) {
                        if (c.attributes.collection) {
                            return c.attributes.collection;
                        }
                        throw new AException('Collection cannot be empty\n(ViewComponent:' + c.id + ')');
                    })
                    .uniq()
                    .value(),
                css = model;
                console.log("CSS: ", css);
            return {
                '': {isFolder: true, children: 'webexample'},
                'webexample' : { isFolder: true, name: 'webexample', children: [
                'jestconfig', 'gitignore', 'babel', 'package', 
                'editorconfig','eslintrcjs', 'flowconfig', 'gitattributes', 
                'prettierrcjs', 'stylelintrcjs', 'travisyml', 'dockerfile', 
                'yarnlock', 
                'public', 'src', 'tools']},

                // config files

                'jestconfig': {name: 'jest.config.js', content: require('./templates/jest.config.js.ejs')()},
                'gitignore': {name: '.gitignore', content: require('./templates/gitignore.ejs')()},
                'babel': {name: '.babelrc.js', content: require('./templates/babelrc.js.ejs')()},
                'package': {name: 'package.json', content: require('./templates/package.json.ejs')()},

                'editorconfig': {name: '.editorconfig', content: require('./templates/editorconfig.ejs')()},
                'eslintrcjs': {name: '.eslintrc.js', content: require('./templates/eslintrc.js.ejs')()},
                'flowconfig': {name: '.flowconfig', content: require('./templates/flowconfig.ejs')()},
                'gitattributes': {name: 'gitattributes', content: require('./templates/gitattributes.ejs')()},

                'prettierrcjs': {name: '.prettierrc.js', content: require('./templates/prettierrc.js.ejs')()},
                'stylelintrcjs': {name: '.stylelintrc.js', content: require('./templates/stylelintrc.js.ejs')()},
                'travisyml': {name: '.travis.yml', content: require('./templates/travis.yml.ejs')()},
                'dockerfile': {name: 'Dockerfile', content: require('./templates/dockerfile.ejs')()},

                'yarnlock': {name: 'yarn.lock', content: require('./templates/yarn.lock.ejs')()},

                //public folder contents
                //TODO generate image assets is not supported

                'public': {isFolder: true, name: 'public', children: [
                    'publicbrowserconfig', 'publiccrossdomain', 'publicwebmanifest', 'publicrobots',
                    'publichumans', 
                    // 'publicfavicon', 'publicicon', 'publictilewide', 'publictile'
                ]},
                
                'publicbrowserconfig': {name: 'browserconfig.xml', content: require('./templates/public/browserconfig.xml.ejs')()},
                'publiccrossdomain': {name: 'crossdomain.xml', content: require('./templates/public/crossdomain.xml.ejs')()},
                'publicwebmanifest': {name: 'site.webmanifest', content: require('./templates/public/site.webmanifest.ejs')()},
                'publicrobots': {name: 'robots.txt', content: require('./templates/public/robots.txt.ejs')()},

                'publichumans': {name: 'humans.txt', content: require('./templates/public/humans.txt.ejs')()},
                // 'publicfavicon': {name: 'favicon.ico', content: require('./templates/public/favicon.ico')()},
                // 'publicicon': {name: 'icon.png', content: require('./templates/public/icon.png')()},
                // 'publictilewide': {name: 'tile-wide.png', content: require('./templates/public/tile-wide.png')()},

                // 'publictile': {name: 'tile.png', content: require('./templates/public/tile.png')()},

                //tools folder contents

                'tools': {isFolder: true, name: 'tools', children: [
                    'toolsbuild', 'toolsbundle', 'toolsclean', 'toolscopy',
                    'toolsdeploy', 'toolspostcss', 'toolsrender', 'toolsrun', 
                    'toolsrunServer', 'toolsstart', 'toolswebpackconfig', 'toolslib'
                ]},
                
                'toolsbuild': {name: 'build.js', content: require('./templates/tools/build.js.ejs')()},
                'toolsbundle': {name: 'bundle.js', content: require('./templates/tools/bundle.js.ejs')()},
                'toolsclean': {name: 'clean.js', content: require('./templates/tools/clean.js.ejs')()},
                'toolscopy': {name: 'copy.js', content: require('./templates/tools/copy.js.ejs')()},

                'toolsdeploy': {name: 'deploy.js', content: require('./templates/tools/deploy.js.ejs')()},
                'toolspostcss': {name: 'postcss.config.js', content: require('./templates/tools/postcss.config.ejs')()},
                'toolsrender': {name: 'render.js', content: require('./templates/tools/render.js.ejs')()},
                'toolsrun': {name: 'run.js', content: require('./templates/tools/run.js.ejs')()},

                'toolsrunServer': {name: 'runServer.js', content: require('./templates/tools/runServer.js.ejs')()},
                'toolsstart': {name: 'start.js', content: require('./templates/tools/start.js.ejs')()},
                'toolswebpackconfig': {name: 'webpack.config.js', content: require('./templates/tools/toolswebpack.config.js.ejs')()},

                //tools folder content child: lib folder contents

                'toolslib': {isFolder: true, name: 'lib', children: [
                    'toolslibcp', 'toolslibfileTransformer', 'toolslibmarkdown', 'toolsliboverrideRules',
                    'toolslibfs', 'toolslibwebpackHotDevClient'
                ]},
                
                'toolslibcp': {name: 'cp.js', content: require('./templates/tools/lib/cp.js.ejs')()},
                'toolslibfileTransformer': {name: 'fileTransformer.js', content: require('./templates/tools/lib/fileTransformer.js.ejs')()},
                'toolslibmarkdown': {name: 'markdown-loader.js', content: require('./templates/tools/lib/markdownloader.js.ejs')()},
                'toolsliboverrideRules': {name: 'overrideRules.js', content: require('./templates/tools/lib/overrideRules.js.ejs')()},

                'toolslibfs': {name: 'fs.js', content: require('./templates/tools/lib/fs.js.ejs')()},
                'toolslibwebpackHotDevClient': {name: 'webpackHotDevClient.js', content: require('./templates/tools/lib/webpackHotDevClient.js.ejs')()},
           
                //src folder contents

                'src': {isFolder: true, name: 'src', children: [
                    'srcclient', 'srcconfig', 'srccreateFetch', 'srcDOMUtils',
                    'srchistory', 'srcpassport', 'srcrouter', 'srcserver',
                    'srcdata', 'srcreducers', 'srcactions', 'srcstore',
                    'srccomponents', 'srcconstants'
                ]},
                
                'srcclient': {name: 'client.js', content: require('./templates/src/client.js.ejs')()},
                'srcconfig': {name: 'config.js', content: require('./templates/src/config.js.ejs')()},
                'srccreateFetch': {name: 'createFetch.js', content: require('./templates/src/createFetch.js.ejs')()},
                'srcDOMUtils': {name: 'DOMUtils.js', content: require('./templates/src/DOMUtils.js.ejs')()},

                'srchistory': {name: 'history.js', content: require('./templates/src/history.js.ejs')()},
                'srcpassport': {name: 'passport.js', content: require('./templates/src/passport.js.ejs')()},
                'srcrouter': {name: 'router.js', content: require('./templates/src/router.js.ejs')()},
                'srcserver': {name: 'server.js', content: require('./templates/src/server.js.ejs')()},
           
                //src folder conten child: actions

                'srcactions': {isFolder: true, name: 'actions', children: [
                    'srcactionsruntime',
                ]},
                
                'srcactionsruntime': {name: 'runtime.js', content: require('./templates/src/actions/runtime.js.ejs')()},

                //src folder conten child: components (where our view container suppose to be, i think...)

                'srccomponents': {isFolder: true, name: 'components', children: []},

                //src folder conten child: data

                'srcdata': {isFolder: true, name: 'data', children: ['srcdatasequelize']},
                
                'srcdatasequelize': {name: 'sequelize.js', content: require('./templates/src/data/sequelize.js.ejs')()},

                //src folder conten child: reducers

                'srcreducers': {isFolder: true, name: 'reducers', children: [
                    'srcreducersindex', 'srcreducersruntime', 'srcreducersuser'
                ]},
                
                'srcreducersindex': {name: 'index.js', content: require('./templates/src/reducers/index.js.ejs')()},
                'srcreducersruntime': {name: 'runtime.js', content: require('./templates/src/reducers/runtime.js.ejs')()},
                'srcreducersuser': {name: 'user.js', content: require('./templates/src/reducers/user.js.ejs')()},

                //src folder conten child: store

                'srcstore': {isFolder: true, name: 'store', children: [
                    'srcstoreconfigureStore', 'srcstorecreateHelpers', 'srcstorelogger'
                ]},
                
                'srcstoreconfigureStore': {name: 'configureStore.js', content: require('./templates/src/store/configureStore.js.ejs')()},
                'srcstorecreateHelpers': {name: 'createHelpers.js', content: require('./templates/src/store/createHelpers.js.ejs')()},

                //src folder conten child: store child: logger

                'srcstorelogger': {isFolder: true, name: 'logger', children: [
                    'srcstoreloggerclient', 'srcstoreloggerserver', 'srcstoreloggerpackage'
                ]},
                
                'srcstoreloggerclient': {name: 'logger.client.js', content: require('./templates/src/store/logger/logger.client.js.ejs')()},
                'srcstoreloggerserver': {name: 'logger.server.js', content: require('./templates/src/store/logger/logger.server.js.ejs')()},
                'srcstoreloggerpackage': {name: 'package.json', content: require('./templates/src/store/logger/package.json.ejs')()},

                //src folder conten child: constants

                'srcconstants': {isFolder: true, name: 'constants', children: [
                    'srcconstantsindex'
                ]},
                
                'srcconstantsindex': {name: 'index.js', content: require('./templates/src/constants/index.js.ejs')()}
                
            };
        }
    )
];
