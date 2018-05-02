// Copyright (c) 2016, the IFMLEdit.org project authors. Please see the
// AUTHORS file for details. All rights reserved. Use of this source code is
// governed by a MIT-style license that can be found in the LICENSE file.
/*jslint node: true, nomen: true */
"use strict";

var _ = require('lodash'),
    pcn = require('../../../pcn').pcn,
    createRule = require('almost').createRule;
let mapposition = require('../../mapposition').mapposition;
let getNodeMap = mapposition.map;


function sortMapByRow(map) {
    var rowMap = [];
    var sameRow = [];
    var tempMap = Object.assign([], map);
    var indexRow = 0;
    while (tempMap.length > 0) {
        for (var i = 0; i < tempMap.length; i++) {
            if (tempMap[i].row_depth === indexRow) {
                sameRow.push(tempMap[i]);
                tempMap.splice(i, 1);
                i--;
            }
        }
        rowMap.push(sameRow);
        sameRow = [];
        indexRow++;
    }
    return rowMap;
}

function sortMapByCol(sortedRowMap) {
    for (var i = 0; i < sortedRowMap.length; i++) {
        sortedRowMap[i].sort(function(x, y) { return x.col_depth >= y.col_depth });
    }
    return sortedRowMap;
}

function sortMap(map) {
    var resMap = null;
    resMap = sortMapByRow(map);
    resMap = sortMapByCol(resMap);
    return resMap;
}

function getAbsoluteNode(map) {
    var newData = Object.assign([], map);
    for (var i = 0; i < map.length; i++) {
        newData[i] = getAbsoluteNodeInRow(map, i);
    }
    return newData;
}

function getAbsoluteNodeInRow(map, index) {
    var temp = [];
    var tempChild = [];
    var tempData = map[index][0];
    // console.log('ASBO', map, index, tempData);
    for (var i = 0; i < map[index].length; i++) {
        // console.log('ABSO', tempChild);
        if (map[index][i].col_depth === tempData.col_depth && map[index][i].row_depth === tempData.row_depth) {
            tempChild.push(map[index][i]);
            // console.log('ABSO', tempChild);
        } else {
            // console.log('ABSO NOTE', tempChild);
            var tempObj = {
                type: 'normal',
                elements: tempChild
            }
            if (tempChild.length > 1) {
                tempObj.type = 'absolute';
            }
            temp.push(Object.assign({}, tempObj));
            tempChild = [];
            tempData = map[index][i];
            tempChild.push(map[index][i]);
        }
    }
    var tempObj2 = {
        type: 'normal',
        elements: tempChild
    }
    if (tempChild.length > 1) {
        tempObj2.type = 'absolute';
    }
    temp.push(Object.assign({}, tempObj2));

    return temp;
}

exports.rules = [
    createRule( // map View Container
        function(element, model) { return model.isViewContainer(element) && model.getParent(element) === undefined && !element.attributes.isItem;},
        function(element, model) {
            var id = element.id,
                name = element.attributes.name,
                className = element.attributes.className,
                descendants = _.chain(model.getDescendants(element, true))
                .map(function(id) { return model.toElement(id); })
                .filter(function(e) {
                    if (!model.isEvent(e) || model.getOutbounds(e).length) { return true; }
                    var parent = model.getParent(e);
                    return model.isViewComponent(parent) && parent.attributes.stereotype === 'list' && e.attributes.name === 'selected';
                })
                .map('id')
                .value(),
                obj = {
                    routes: { children: id + '-route' },
                    views: { children: id + '-view' },
                    viewmodels: { children: id + '-viewmodel' },
                };
            console.log("View ", element);
            obj[id + '-route'] = { isFolder: true, name: id, children: id + '-route-index' };
            obj[id + '-route-index'] = { name: 'index.js', content: require('./templates/route.page.index.js.ejs')({ id: id }) };
            obj[id + '-view'] = { isFolder: true, name: id, children: id + '-view-index' };
            obj[id + '-view-index'] = { name: 'index.pug', content: require('./templates/view.index.pug.ejs')({ id: id, name: name, className: className }) };
            obj[id + '-viewmodel'] = { isFolder: true, name: id, children: id + '-viewmodel-index' };
            obj[id + '-viewmodel-index'] = { name: 'index.js', content: require('./templates/viewmodel.index.js.ejs')({ main: id, descendants: descendants }) };
            return obj;
        }
    ),
    createRule( // map View Container
        function(element, model) { return model.isViewContainer(element) && !model.isXOR(element) && !element.attributes.isItem; },
        function(element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                .reject(function(id) { return model.isEvent(id); })
                .map(function(id) { return model.toElement(id); })
                .map('id')
                .value(),
                childrenAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewContainer(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                logicAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewComponent(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                events = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isEvent(id); })
                .filter(function(id) { return model.getOutbounds(id).length; })
                .map(function(id) { return model.toElement(id); })
                .map(function(event) {
                    var flow = model.getOutbounds(event)[0],
                        target = model.getTarget(flow);
                    return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target) };
                })
                .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                obj = {};
            console.log("Non xor master element", element);
            // console.log("Non xor children attribute", childrenAttributes);
            // console.log("Non xor logic attribute", logicAttributes);

            var map = [];
            // console.log("Non xor maps", map);
            map = getNodeMap(map, childrenAttributes, id);

            // console.log("Non xor final maps", map);
            var sortedMap = sortMap(map);
            var finalMap = getAbsoluteNode(sortedMap);
            // console.log("FINAL SORTED MAP NON XOR", finalMap);

            obj[tid + '-view'] = { children: id + '-pug' };
            obj[id + '-pug'] = { name: id + '.pug', content: require('./templates/nonxor.pug.ejs')({ id: id, children: children, events: events, className: className, childrenAttributes: finalMap, logicAttributes: logicAttributes }) };
            obj[tid + '-viewmodel'] = { children: id + '-view-js' };
            obj[id + '-view-js'] = { name: id + '.js', content: require('./templates/nonxor.js.ejs')({ id: id, children: children, events: events }) };
            return obj;
        }
    ),
    createRule( // map XOR View Container
        function(element, model) { return model.isViewContainer(element) && model.isXOR(element) && !element.attributes.isItem; },
        function(element, model) {
            var id = element.id,
                className = element.attributes.className,
                children = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewContainer(id); })
                .value(),
                childrenAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewContainer(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                logicAttributes = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isViewComponent(id); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return element;
                })
                .value(),
                landmarks = _.chain(children)
                .filter(function(element) { return model.isLandmark(element); })
                .map(function(id) { return model.toElement(id); })
                .map(function(element) {
                    return {
                        id: element.id,
                        name: element.attributes.name,
                        broken: _.chain(model.getDescendants(element, true))
                            .reject(function(id) { return model.isEvent(id); })
                            .value()
                    };
                })
                .value(),
                defaultChild = _.chain(model.getChildren(element))
                .filter(function(element) { return model.isDefault(element); })
                .first()
                .value(),
                events = _.chain(model.getChildren(element))
                .filter(function(id) { return model.isEvent(id); })
                .filter(function(id) { return model.getOutbounds(id).length; })
                .map(function(id) { return model.toElement(id); })
                .map(function(event) {
                    var flow = model.getOutbounds(event)[0],
                        target = model.getTarget(flow);
                    return { id: event.id, name: event.attributes.name, targetsAction: model.isAction(target) };
                })
                .value(),
                top = model.getTopLevelAncestor(element),
                tid = top.id,
                path = model.isDefault(top) ? '' : tid,
                obj = {};
            // console.log("Xor master element", element);
            // console.log("Xor children attribute", childrenAttributes);
            // console.log("Xor logic attribute", logicAttributes);

            var map = [];
            map = getNodeMap(map, childrenAttributes, id);

            // console.log("Xor final map", map);

            obj[tid + '-view'] = { children: id + '-pug' };
            obj[id + '-pug'] = { name: id + '.pug', content: require('./templates/xor.pug.ejs')({ id: id, children: children, events: events, landmarks: landmarks, className: className, childrenAttributes: childrenAttributes }) };
            obj[tid + '-viewmodel'] = { children: id + '-view-js' };
            obj[id + '-view-js'] = { name: id + '.js', content: require('./templates/xor.js.ejs')({ id: id, children: children, events: events, defaultChild: defaultChild, currentTopLevel: tid, landmarks: landmarks, path: path }) };
            return obj;
        }
    )
];