// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    pcn = require('../../../pcn').pcn,
    createRule = require('almost').createRule;

exports.rules = [
    createRule( // map View Container
        function (element, model) { return model.isViewContainer(element) && model.getParent(element) === undefined; },
        function (element, model) {
            var id = element.id,
                name = element.attributes.name,
                className = element.attributes.className,
                descendants = _.chain(model.getDescendants(element, true))
                    .map(function (id) { return model.toElement(id); })
                    .filter(function (e) {
                        if (!model.isEvent(e) || model.getOutbounds(e).length) { return true; }
                        var parent = model.getParent(e);
                        return model.isViewComponent(parent) && parent.attributes.stereotype === 'list' && e.attributes.name === 'selected';
                    })
                    .map('id')
                    .value(),
                obj = {
                    routes: {children: id + '-route'},
                    views: {children: id + '-view'},
                    viewmodels: {children: id + '-viewmodel'},
                };
            console.log("View ", element);
            obj[id + '-route'] = {isFolder: true, name: id, children: id + '-route-index'};
            obj[id + '-route-index'] = {name: 'index.js', content: require('./templates/route.page.index.js.ejs')({id: id})};
            obj[id + '-view'] = {isFolder: true, name: id, children: id + '-view-index'};
            obj[id + '-view-index'] = {name: 'index.jade', content: require('./templates/view.index.jade.ejs')({id: id, name: name, className: className})};
            obj[id + '-viewmodel'] = {isFolder: true, name: id, children: id + '-viewmodel-index'};
            obj[id + '-viewmodel-index'] = {name: 'index.js', content: require('./templates/viewmodel.index.js.ejs')({main: id, descendants: descendants})};
            return obj;
        }
    ),
    createRule( // map View Container
        function (element, model) { return model.isViewContainer(element) && !model.isXOR(element); },
        function (element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                    .reject(function (id) { return model.isEvent(id); })
                    .map(function (id) { return model.toElement(id); })
                    .map('id')
                    .value(),
                events = _.chain(model.getChildren(element))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) {
                        var flow = model.getOutbounds(event)[0],
                            target = model.getTarget(flow);
                        return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target)};
                    })
                    .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                obj = {};
            console.log("Non Xor", element);
            obj[tid + '-view'] = {children: id + '-jade'};
            obj[id + '-jade'] = {name: id + '.jade', content: require('./templates/nonxor.jade.ejs')({id: id, children: children, events: events, className: className})};
            obj[tid + '-viewmodel'] = {children: id + '-view-js'};
            obj[id + '-view-js'] = {name: id + '.js', content: require('./templates/nonxor.js.ejs')({id: id, children: children, events: events})};
            return obj;
        }
    ),
    createRule( // map XOR View Container
        function (element, model) { return model.isViewContainer(element) && model.isXOR(element); },
        function (element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                    .filter(function (id) { return model.isViewContainer(id); })
                    .value(),
                landmarks = _.chain(children)
                    .filter(function (element) { return model.isLandmark(element); })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (element) {
                        return {
                            id: element.id,
                            name: element.attributes.name,
                            broken: _.chain(model.getDescendants(element, true))
                                .reject(function (id) { return model.isEvent(id); })
                                .value()
                        };
                    })
                    .value(),
                defaultChild = _.chain(model.getChildren(element))
                    .filter(function (element) { return model.isDefault(element); })
                    .first()
                    .value(),
                events = _.chain(model.getChildren(element))
                    .filter(function (id) { return model.isEvent(id); })
                    .filter(function (id) { return model.getOutbounds(id).length; })
                    .map(function (id) { return model.toElement(id); })
                    .map(function (event) {
                        var flow = model.getOutbounds(event)[0],
                            target = model.getTarget(flow);
                        return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target)};
                    })
                    .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                path = model.isDefault(top) ? '' : tid,
                obj = {};
                console.log("Xor", element); 
            obj[tid + '-view'] = {children: id + '-jade'};
            obj[id + '-jade'] = {name: id + '.jade', content: require('./templates/xor.jade.ejs')({id: id, children: children, events: events, landmarks: landmarks, className: className})};
            obj[tid + '-viewmodel'] = {children: id + '-view-js'};
            obj[id + '-view-js'] = {name: id + '.js', content: require('./templates/xor.js.ejs')({id: id, children: children, events: events, defaultChild: defaultChild, currentTopLevel: tid, landmarks: landmarks, path: path})};
            return obj;
        }
    )
];
